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

export class Web3D extends Component {
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

    this.transScale = {
      x: 0.15,
      y: 0.13,
      z: 1
    };

    //検出対象のパーツ番号
    this.BASE_PARTS = this.props.partsConfig.base;
    this.VECTOR_PARTS = this.props.partsConfig.vector;
    this.CENTER_PARTS = this.props.partsConfig.center;

    this.state = {
      position: {},
      scale: 1,
      quat: {
        x: new THREE.Quaternion(),
        y: new THREE.Quaternion(),
        z: new THREE.Quaternion()
      }
    };
  }

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    if (nextProps.landmarks) {
      this.positions = this.lowPathFilter(nextProps);
      this.tilt = Tilt.vec3(
        this.positions[this.VECTOR_PARTS],
        this.positions[this.BASE_PARTS],
        this.positions[this.CENTER_PARTS]
      );

      this.quote();
      this.translation();
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

  quote() {
    let quat = {
      x: new THREE.Quaternion(),
      y: new THREE.Quaternion(),
      z: new THREE.Quaternion()
    };
    quat.x.setFromAxisAngle(
      this.axis.x,
      THREE.Math.degToRad(-this.tilt.x + 70)
    );
    quat.y.setFromAxisAngle(this.axis.y, THREE.Math.degToRad(this.tilt.y));
    quat.z.setFromAxisAngle(this.axis.z, THREE.Math.degToRad(this.tilt.z));
    quat.y.multiply(quat.x);
    quat.z.multiply(quat.y);
    this.setState({
      quat: quat
    });
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

    const scale = vec_length / 100;
    // console.log('scale ', scale);

    const pos = {
      x: (vec.x - center_position.x) * this.transScale.x,
      y: (center_position.y - vec.y) * this.transScale.y,
      z: 0 * this.transScale.z
    };

    this.setState({
      position: pos,
      scale: scale
    });
  }

  render() {
    return this.props.scene(
      this.state.position,
      this.state.quat,
      this.state.scale
    );
  }
}
