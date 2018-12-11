import React, { Component } from 'react';
import * as _ from 'lodash';
import styles from './App.scss';
import * as tf from '@tensorflow/tfjs';
import * as faceapi from 'face-api.js/dist/face-api.js';
// eslint-disable-next-line
import Worker from './hand.worker.js';

// const worker = new Worker('./worker/predict.js');
const CLASSES = {0:'zero', 1:'one', 2:'two', 3:'three', 4:'four',5:'five', 6:'six', 7:'seven', 8:'eight', 9:'nine'}

class Video extends Component {

  constructor(props){
    super(props);
    this.media = null;
    this.selfRef=null;
  }

  componentDidMount(){
    this.initCam();
  }

  initCam () {
    this.media = navigator.mediaDevices.getUserMedia({
        audio : false, 
        video : {facingMode: "user"}
      });
    this.media.then((stream)=>{
      this.selfRef.srcObject = stream;
      this.selfRef.onloadedmetadata = function(e) {
        console.log("Onload video");
      };
    })
    this.media.catch((err)=>{
      alert(err);
    })
  }

  render(){
    return(
      <video 
        ref={(ref)=>{
          this.selfRef = ref;
          this.props.setSelf(ref);
        }} 
        className={styles["video"]}
        autoPlay 
        playsInline
      />
    )
  }
}



class HandDetect extends Component{

  constructor(props){
    super(props);
    this.model = null;
    this.state = {
      results : []
    }
    this.tfWorker = new Worker();
  }

  async componentDidMount(){
    this.init();
  }

  async init (){
    // await this.loadModel();
    setInterval(async ()=>{
      //this.predict();
      console.log("setInterval");

      let width = this.props.canvas.width;
      let height = this.props.canvas.height;

      var source = this.props.canvas.getContext("2d").getImageData(0,0,width,height);
      // let offset = tf.scalar(255);
      // let tensor = tf.fromPixels(source).resizeNearestNeighbor([100,100]).cast('float32');
      // let _tensor = tensor.div(offset).expandDims();
      // let prediction = await this.model.predict(_tensor).data();
      // this.tfWorker.postMessage(_tensor);
      this.tfWorker.postMessage({
        width:width,
        height:height,
        raw:source.data,
      },[source.data.buffer]);

    },this.props.interval);
  }

  //TFモデルのロード
  // async loadModel() {
  //   this.model = await tf.loadModel(`./models/hand/model.json`);
  //   let p = new Promise( resolve =>{
  //     if(this.model) {
  //       console.log("loaded model");
  //       resolve();
  //     }
  //   });
  //   return p;
  // };

  // async predict () {
  //   let tensor = this.imageFromVideo();
  //   let prediction = await this.model.predict(tensor).data();
  //   let results = Array.from(prediction).map((p,i)=>{
  //     return {
  //       probability: p,
  //       className: CLASSES[i]
  //     }
  //   }).sort((a,b)=>{//一致度の高い順
  //     return b.probability-a.probability;
  //   }).slice(0,5);//上位5件

  //   this.setState({
  //     results:results,
  //   })
  // }



  getLogs(){
    return this.state.results.map( p =>{
      return(
        <div>{p.className}:{p.probability.toFixed(5)}</div>
      )
    })
  }

  imageFromVideo(){
    let tensor = tf.fromPixels(this.props.canvas).resizeNearestNeighbor([100,100]).toFloat();
    let offset = tf.scalar(255);
    return tensor.div(offset).expandDims();
  }

  render(){
    return(
      <React.Fragment>
        <div className="log" >
          {this.getLogs()}
        </div>
      </React.Fragment>
    )
  }
}

class FaceDetect extends Component{

  constructor(props){
    super(props);
    this.canvas = null;
    this.state = {
      faceDetect: {},
    }
  }

  async componentDidMount(){
    await this.init();
    console.log("loaded Face model");
    
    setInterval( async ()=>{
      await this.predict();
    },this.props.interval);
  }

  async init (){
    return await faceapi.nets.ssdMobilenetv1.loadFromUri('./models/face/');
  }

  async predict () {
    if(!this.props.canvas) return;
    const detection = await faceapi.detectSingleFace(this.props.canvas);
    if( detection ) {
      //console.log("--" , detection._box );
      this.setState({faceDetect : detection._box})
    }
  }

  getLogs () {
    if(this.state.faceDetect=={}) return(<div/>);
    return(<div>x={this.state.faceDetect._width},y={this.state.faceDetect._height}</div>)
  }

  render(){
    return(
      <React.Fragment>
        <div className="log" >
          {this.getLogs()}
        </div>
      </React.Fragment>
    )
  }
}

class Canvas extends Component {

  constructor(props){
    super(props);
    this.canvas = null;
  }

  componentDidMount(){
    setInterval(()=>{
      this.draw();
    },this.props.interval);
  }

  draw(){
    if(!this.props.video) {
      return;
    }
    let rect = this.props.video.getBoundingClientRect();
    var context = this.canvas.getContext("2d");
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    context.drawImage(this.props.video, 0, 0, rect.width, rect.height);
  }

  render(){
    return(
      <canvas 
          ref={(ref)=>{
            this.canvas=ref;
            this.props.set(ref);
          }}  
          id={'canvas'}
          className={styles["canvas"]} />
    )
  }
}

class App extends Component {

  constructor(props){
    super(props);
    this.state= {
      video:null,
      canvas:null,
    }
  }

  setVideo(ref){
    if(this.state.video!==ref && ref){
      this.setState({video:ref});
    }
  }

  setCanvas(ref) {
    if(this.state.canvas!==ref && ref){
      this.setState({canvas:ref});
    }
  }

  render() {
    return (
      <div className="App">
        <Video
          setSelf={(ref)=>{this.setVideo(ref)}}
        />
        <HandDetect 
          canvas={this.state.canvas}
          interval = {500}
        />
        <FaceDetect 
          canvas={this.state.canvas}
          interval = {500} />
        <Canvas
          video={this.state.video} 
          set={(ref)=>{ this.setCanvas(ref)}} 
          interval = {500}
        />
      </div>
    );
  }
}

export default App;
