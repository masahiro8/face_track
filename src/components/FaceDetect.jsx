import React, { Component } from "react";
import * as _ from "lodash";
import * as faceapi from "face-api.js/dist/face-api.js";
import { constant } from "@tensorflow/tfjs-layers/dist/exports_initializers";
import {setPoint,getLandmarks } from '../canvas.point';

// tiny_face_detector options
let inputSize = 128
let scoreThreshold = 0.5

export class FaceDetect extends Component {
  constructor(props) {
    super(props);
    this.canvas = null;
    this.pointlog = null;
    this.net = new faceapi.FaceLandmark68TinyNet();
    this.state = {
      faceDetect: {},
    };
  }

  async componentDidMount() {

    //必要なモデルのロード
    await faceapi.nets.tinyFaceDetector.load('models/face/');
    await faceapi.loadFaceLandmarkModel('models/face/');
    console.log("load models");
    setInterval(async () => {
      await this.predict();
    }, this.props.interval);
  }

  async predict() {
    if (!this.props.canvas) return;
    //検出
    let inputSize = 128;
    let scoreThreshold = 0.5;
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize, scoreThreshold })
    const result = await faceapi.detectSingleFace(this.props.video, options).withFaceLandmarks();
    //console.log("predict result" ,result);
    if (result) {
      //console.log("result " , result );
      // const { width, height } = faceapi.getMediaDimensions(this.props.video);
      // const resizedResults = [result].map(res => res.forSize(width, height));
      this.setState({ faceDetect: result });
      this.props.result(result);
    }
  }

  render() {
    return (
      <div/>
    );
  }
}