import React, { Component } from 'react';
import * as _ from 'lodash';
import * as THREE from 'three';
import MTLLoader from 'three-mtl-loader';
import * as OBJLoader from 'three-obj-loader';
import { location } from '../../../config';
import styles from '../../VideoCanvas.scss';

OBJLoader(THREE);

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

export class ObjLoader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      model: null
    };
  }

  async componentDidMount() {
    let model = await this.load();
    this.setState({
      model: model
    });
  }

  render() {
    return this.props.loaded(this.state.model);
  }

  async loadMatrial(mtl) {
    return new Promise((resolved, rejected) => {
      const loader = new MTLLoader();
      loader.load(
        mtl,
        val => {
          resolved(val);
        },
        progress => {},
        error => {
          rejected(error);
        }
      );
    });
  }

  async loadModel(obj) {
    return new Promise((resolved, rejected) => {
      this.THREE = THREE;
      const loader = new this.THREE.OBJLoader();
      loader.load(
        obj,
        val => {
          resolved(val);
        },
        progress => {},
        error => {
          rejected(error);
        }
      );
    });
  }

  async loadTexture(tex) {
    return new Promise((resolved, rejected) => {
      this.THREE = THREE;
      const loader = new this.THREE.TextureLoader();
      loader.load(
        tex,
        val => {
          resolved(val);
        },
        progress => {},
        error => {
          rejected(error);
        }
      );
    });
  }

  async load() {
    if (!this.props.model) return;
    let promise = new Promise(async resolved => {
      let material = await this.loadMatrial(this.props.model.mtl);
      let model = await this.loadModel(this.props.model.obj);
      let texture = await this.loadTexture(this.props.model.tex);
      if (material && model && texture) {
        model.traverse(child => {
          if (child instanceof THREE.Mesh) {
            child.material.map = texture;
          }
        });
        resolved(model);
      }
    });
    return promise;
  }
}

export class Scene extends Component {
  constructor(props) {
    super(props);

    //検出対象のパーツ番号
    this.BASE_PARTS = this.props.partsConfig.base;
    this.VECTOR_PARTS = this.props.partsConfig.vector;
    this.CENTER_PARTS = this.props.partsConfig.center;

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
    if (
      JSON.stringify(nextProps.position) !== JSON.stringify(this.props.position)
    ) {
      this.group.position.set(
        nextProps.position.x,
        nextProps.position.y,
        nextProps.position.z
      );
    }

    if (JSON.stringify(nextProps.quat) !== JSON.stringify(this.props.quat)) {
      this.group.quaternion.copy(nextProps.quat.z);
    }

    if (JSON.stringify(nextProps.scale) !== JSON.stringify(this.props.scale)) {
      this.group.scale.set(nextProps.scale, nextProps.scale, nextProps.scale);
    }

    if (JSON.stringify(nextProps.model) !== JSON.stringify(this.props.model)) {
      console.log('Add group =', nextProps.model);
      this.group.add(nextProps.model);
    }
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

    //group
    this.group = new faceGroup();
    this.group.useQuaternion = true;
    this.scene.add(this.group);

    //
    this.q = new THREE.Quaternion();
  }

  render3D() {
    window.requestAnimationFrame(() => {
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
