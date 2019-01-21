import React, { Component } from "react";
import styles from './VideoCanvas.scss';
import {VIDEO_SIZE} from '../config';

class Video extends Component {
  constructor(props) {
    super(props);
    this.media = null;
    this.selfRef = null;
  }

  async componentDidMount() {
    await this.initCam();
    //console.log("detect init");
  }

  async initCam() {

    // const stream = await navigator.mediaDevices.getUserMedia({ video: {} }) 
    this.media = navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: "environment",
        width: this.props.size.width, 
        // height: this.props.size.height,
      },
    });

    let p = new Promise( resolve =>{
      this.media.then(stream => {
        this.selfRef.srcObject = stream;
        this.selfRef.onloadedmetadata = function(e) {
          //console.log("Onload video" , e);
          resolve();
        };
      });
      
      this.media.catch(err => {
        alert(err);
      });
    });

    return p;
    
  }

  render() {
    return (
      <video
        ref={ref => {
          this.selfRef = ref;
          this.props.setSelf(ref);
        }}
        className="video"
        autoPlay
        playsInline
        width={VIDEO_SIZE.width}
        height={VIDEO_SIZE.height}
      />
    );
  }
}

class Canvas extends Component {
  constructor(props) {
    super(props);
    this.canvas = null;
  }

  componentDidMount() {
    setInterval(() => {
      this.draw();
    }, this.props.interval);
  }

  draw() {
    if (!this.props.video || !this.props.canvas) {
      return;
    }
    let rect = this.props.video.getBoundingClientRect();
    var context = this.canvas.getContext("2d");
    this.canvas.width = this.props.size.width;
    this.canvas.height = this.props.size.height;
    context.drawImage(
      this.props.video,0, 0,
      this.props.size.width,
      this.props.size.height);
  }

  render() {
    return (
      <canvas
        ref={ref => {
          this.canvas = ref;
          this.props.set(ref);
        }}
        id={"canvas"}
        className="canvas"
      />
    );
  }
}

export class VideoImage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      video: null,
      canvas: null,
    };
  }

  setVideo(ref) {
    if (this.state.video !== ref && ref) {
      this.setState({ video: ref });
      this.props.video(ref);
    }
  }

  setCanvas(ref) {
    if (this.state.canvas !== ref && ref) {
      this.setState({ canvas: ref });
      this.props.canvas(ref);
    }
  }

  render(){
    return(
      <div className={styles["videoimage"]}>
        <Video
          size = {this.props.size}
          setSelf={ref => {
            this.setVideo(ref);
          }}
        />
        <Canvas
          size = {this.props.size}
          video={this.state.video}
          set={ref => {
            this.setCanvas(ref);
          }}
          interval={this.props.interval}
        />
      </div>
    )
  }
}