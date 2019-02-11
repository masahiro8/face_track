import React, { Component } from 'react';
import * as THREE from 'three';
import styles from '../VideoCanvas.scss';
import * as Tilt from '../../util/tilt';
import * as Filter from '../../util/filter';
import * as vector from '../../util/vector';

class faceGroup extends THREE.Group {
  constructor() {
    super();
    const geometry = new THREE.CubeGeometry(40, 10, 5);
    const material = new THREE.MeshLambertMaterial({ color: 0xfbbc05 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 10);
    this.add(mesh);
  }
}

export class Web3DView extends Component {
  constructor(props) {
    super(props);

    //回転
    this.positions = [];
    this.positions[this.VECTOR_PARTS] = { x: 0, y: 0 };
    this.positions[this.BASE_PARTS] = { x: 0, y: 0 };
    this.positions[this.CENTER_PARTS] = { x: 0, y: 0 };

    this.tilt = {};
    this.shift = {
      x: -60,
      y: 0,
      z: 0
    };
    this.axis = {
      x: new THREE.Vector3(1, 0, 0).normalize(),
      y: new THREE.Vector3(0, 1, 0).normalize(),
      z: new THREE.Vector3(0, 0, 1).normalize()
    };
    this.quat = {
      x: new THREE.Quaternion(),
      y: new THREE.Quaternion(),
      z: new THREE.Quaternion()
    };

    this.transScale = {
      x: 0.15,
      y: 1,
      z: 1
    };

    //検出対象のパーツ番号
    this.BASE_PARTS = this.props.partsConfig.base;
    this.VECTOR_PARTS = this.props.partsConfig.vector;
    this.CENTER_PARTS = this.props.partsConfig.center;

    //3D
    this.width = this.props.size.width;
    this.height = this.props.size.height;
    this.canvas = null;
    this.renderer = null;
    this.scene = null;
    this.light = null;
    this.persecamera = null;
    this.camera = null;
    this.controls = null;
    this.group = null;
    this.object = null;
    this.q = null;
  }

  componentDidMount() {
    this.init();
    this.camera.aspect = this.props.size.width / this.props.size.height;
    this.camera.updateProjectionMatrix();
    this.render3D();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.landmarks) {
      this.positions = this.lowPathFilter(nextProps);
      this.tilt = Tilt.vec3(
        this.positions[this.VECTOR_PARTS],
        this.positions[this.BASE_PARTS],
        this.positions[this.CENTER_PARTS]
      );
    }
  }

  lowPathFilter(nextProps) {
    let positions = {};
    //ローパス
    if (this.props.positions) {
      positions[this.VECTOR_PARTS] = Filter.lowpath(
        this.props.positions[this.VECTOR_PARTS],
        nextProps.positions[this.VECTOR_PARTS]
      );
      positions[this.BASE_PARTS] = Filter.lowpath(
        this.props.positions[this.BASE_PARTS],
        nextProps.positions[this.BASE_PARTS]
      );
      positions[this.CENTER_PARTS] = Filter.lowpath(
        this.props.positions[this.CENTER_PARTS],
        nextProps.positions[this.CENTER_PARTS]
      );
    } else {
      //通常
      positions[this.VECTOR_PARTS] = nextProps.positions[this.VECTOR_PARTS];
      positions[this.BASE_PARTS] = nextProps.positions[this.BASE_PARTS];
      positions[this.CENTER_PARTS] = nextProps.positions[this.CENTER_PARTS];
    }
    return positions;
  }

  init() {
    // renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio || 1);
    this.renderer.setSize(this.width, this.height);
    this.canvas.appendChild(this.renderer.domElement);

    // scene
    this.scene = new THREE.Scene();

    // lights
    this.light = new THREE.DirectionalLight(0xffffcc, 1);
    this.light.position.set(0, 100, 30);
    this.scene.add(this.light);
    const ambientLight = new THREE.AmbientLight(0xffaa55);
    this.scene.add(ambientLight);

    // camera
    const perscamera = new THREE.PerspectiveCamera(
      45,
      this.width / this.height,
      1,
      10000
    ); // fov(視野角),aspect,near,far
    this.camera = perscamera;
    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(this.scene.position);

    //helper
    // const axisHelper = new THREE.AxisHelper(200, 50);
    // this.scene.add(axisHelper);

    //group
    this.group = new faceGroup();
    this.group.useQuaternion = true;
    this.scene.add(this.group);

    //
    this.q = new THREE.Quaternion();
  }

  quote() {
    this.quat.x.setFromAxisAngle(
      this.axis.x,
      THREE.Math.degToRad(-this.tilt.x + 70)
    );
    this.quat.y.setFromAxisAngle(this.axis.y, THREE.Math.degToRad(this.tilt.y));
    this.quat.z.setFromAxisAngle(this.axis.z, THREE.Math.degToRad(this.tilt.z));
    this.quat.y.multiply(this.quat.x);
    this.quat.z.multiply(this.quat.y);
    this.group.quaternion.copy(this.quat.z);
  }

  translation() {
    if (!this.positions[this.BASE_PARTS] || !this.positions[this.VECTOR_PARTS])
      return;
    //原点をbeginとして補正
    const begin = this.positions[this.BASE_PARTS];
    const end = this.positions[this.VECTOR_PARTS];
    const _begin = { x: 0, y: 0 };
    const _end = vector.shiftBase(begin, end);
    const _end_vec = vector.vectorLength(_end);
    const vec_length = vector.distance(_begin, _end);
    const point_distance = vec_length * 0.5;
    const vec = {
      x: _begin.x + (_end.x / _end_vec) * point_distance + begin.x,
      y: _begin.y + (_end.y / _end_vec) * point_distance + begin.y
    };

    const center_position = {
      x: this.props.size.width / 2,
      y: this.props.size.height / 2
    };

    const pos = {
      x: (vec.x - center_position.x) * this.transScale.x,
      y: 0 * this.transScale.y,
      z: 0 * this.transScale.z
    };

    this.group.position.set(pos.x, pos.y, pos.z);
  }

  render3D() {
    window.requestAnimationFrame(() => {
      this.quote();
      this.translation();
      this.render3D();
    });
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <div
        ref={ref => {
          this.canvas = ref;
        }}
        className={styles['overlayWeb3D']}
      />
    );
  }
}
