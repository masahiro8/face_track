import React, { Component } from 'react';
import styles from './App.scss';
import * as tf from '@tensorflow/tfjs';

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
    this.media = navigator.mediaDevices.getUserMedia(
      {
        audio : false, 
        video : {facingMode: "user"}
      }
    );
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
    this.canvas = null;
    this.state = {
      results : []
    }
  }

  async componentDidMount(){
    this.init();
  }

  async init (){
    await this.loadModel();
    setInterval(()=>{
      this.draw();
      this.predict();
    },200);
  }

  
  //TFモデルのロード
  async loadModel() {
    this.model = await tf.loadModel(`./models/hand/model.json`);
    let p = new Promise( resolve =>{
      if(this.model) {
        console.log("loaded model");
        resolve();
      }
    });
    return p;
  };

  async predict () {
    let tensor = this.imageFromVideo();
    let prediction = await this.model.predict(tensor).data();
    let results = Array.from(prediction).map((p,i)=>{
      return {
        probability: p,
        className: CLASSES[i]
      }
    }).sort((a,b)=>{//一致度の高い順
      return b.probability-a.probability;
    }).slice(0,5);//上位5件

    this.setState({
      results:results,
    })
  }

  getLogs(){
    return this.state.results.map( p =>{
      return(
        <div>{p.className}:{p.probability.toFixed(5)}</div>
      )
    })
  }

  imageFromVideo(){
    let tensor = tf.fromPixels(this.canvas).resizeNearestNeighbor([100,100]).toFloat();
    let offset = tf.scalar(255);
    return tensor.div(offset).expandDims();
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
      <React.Fragment>
        <div className="log" >
          {this.getLogs()}
        </div>
        <canvas 
          ref={(ref)=>{this.canvas=ref;}}  
          className={styles["canvas"]} />
      </React.Fragment>
    )
  }
}

class App extends Component {

  constructor(props){
    super(props);
    this.state= {
      video:null,
    }
  }

  setVideo(ref){
    if(this.state.video!==ref && ref){
      this.setState({video:ref});
    }
  }

  render() {
    return (
      <div className="App">
        <Video
          setSelf={(ref)=>{this.setVideo(ref)}}
        />
        <HandDetect 
          video={this.state.video}
        />
      </div>
    );
  }
}

export default App;
