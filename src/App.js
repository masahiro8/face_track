import React, { Component } from "react";
import * as tf from "@tensorflow/tfjs";
import * as faceapi from "face-api.js/dist/face-api.js";
import * as _ from 'lodash';
import {FaceDetect} from './components/FaceDetect';
import {VideoImage} from './components/VideoCanvas';
import {setPoint,getLandmarks ,drawLandmarks} from './canvas.point';
import styles from './components/VideoCanvas.scss';
import { VIDEO_SIZE , INTERVAL } from './config';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      video:null,
      canvas: null,
      overlay: null,
      result : null,
      landmarks : null,
    };
    this.overlay = null;
  }

  setCanvas(ref) {
    if (this.state.canvas !== ref && ref) {
      this.setState({ canvas: ref });
    }
  }

  setVideo(ref) {
    if (this.state.video !== ref && ref) {
      this.setState({ video: ref });
      console.log("setVideo " );
    }
  }

  setOverlay(ref) {
    if (this.state.overlay !== ref && ref) {
      this.setState({ overlay: ref });
      this.initCanvas();
      console.log("setOverlay " );
    }
  }

  initCanvas(){
    if( !this.state.canvas || !this.state.overlay ) return;
    this.setState({
      width:VIDEO_SIZE.width,
      height:VIDEO_SIZE.height
    });
  }

  render() {
    return (
      <div className="App">
        <VideoImage 
          size = {VIDEO_SIZE}
          interval={INTERVAL}
          video ={(ref)=>{ this.setVideo(ref); }}
          canvas = {(ref)=>{ this.setCanvas(ref); }}
        />
        <FaceDetect 
          canvas={this.state.canvas} 
          video={this.state.video}
          interval={INTERVAL}
          log={true}
          result={(result)=>{
            const { width, height } = faceapi.getMediaDimensions(this.state.video);
            const resizedResults = [result].map(res => res.forSize(width, height));
            const landmarks = getLandmarks(resizedResults[0].faceLandmarks);
            this.setState({landmarks:landmarks});
          }} />
        <FaceDetectView
          video = {this.state.video}
          landmarks ={this.state.landmarks}
          setRef = {(ref)=>{this.setOverlay(ref)}}
        />
      </div>
    );
  }
}
export default App;

class FaceDetectView extends Component {
  constructor(props){
    super(props);
    this.canvas = null;
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.landmarks) {
      this.drawPoints();
    }
  }

  setCanvas ( ref ) {
    this.canvas = ref;
    this.props.setRef(ref);
  }

  drawPoints (){
    let landmarks = this.props.landmarks;
    const context = this.canvas.getContext("2d");
    context.clearRect(0, 0, VIDEO_SIZE.width, VIDEO_SIZE.height);

    const getColor = ( col , index ) =>{
      let cols = [
        `rgb(255,${index},${index})`,
        `rgb(${index},255,${index})`,
        `rgb(${index},${index},255)`,
        `rgb(255,255,${index})`,
        `rgb(${index},255,255)`,
        `rgb(255,${index},255)`,
        `rgb(${index},${index},${index})`,
      ]
      return cols[col];
    }

    let index = 0;
    let col = 0;
    let step = Math.floor(255/68);
    _.each(landmarks ,( parts , key )=> {
      col++;
      parts.map ( point => {
        index += step;
        setPoint( this.canvas , {x:point.x , y:point.y} , getColor(col , index ));
      })
    })
  }

  render(){
    return(
      <canvas
        ref={ref => {
          this.setCanvas(ref);
        }}
        width={VIDEO_SIZE.width}
        height={VIDEO_SIZE.height}
        className = {styles["overlayCanvas"]}
      />
    )
  }
}
