import React, { Component } from "react";
import * as _ from "lodash";
import styles from "./App.scss";
import * as tf from "@tensorflow/tfjs";
import * as faceapi from "face-api.js/dist/face-api.js";
import * as posenet from '@tensorflow-models/posenet';
import {setPoint} from './canvas.point.js';

// eslint-disable-next-line
import handWorker from "./hand.worker.js";
import emotionWorker from "./emotion.worker.js";

// const worker = new Worker('./worker/predict.js');
const CLASSES = {
  0: "zero",
  1: "one",
  2: "two",
  3: "three",
  4: "four",
  5: "five",
  6: "six",
  7: "seven",
  8: "eight",
  9: "nine"
};

const CLASSES_EMOTION =  ({
  0:'😠 angry',
  1:'😬 disgust',
  2:'😨 fear',
  3:'😄 happy',
  4:'😢 sad',
  5:'😮 surprise',
  6:'😐 neutral'});

class Video extends Component {
  constructor(props) {
    super(props);
    this.media = null;
    this.selfRef = null;
  }

  componentDidMount() {
    this.initCam();
  }

  initCam() {
    this.media = navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { facingMode: "environment" }
    });
    this.media.then(stream => {
      this.selfRef.srcObject = stream;
      this.selfRef.onloadedmetadata = function(e) {
        console.log("Onload video");
      };
    });
    this.media.catch(err => {
      alert(err);
    });
  }

  render() {
    return (
      <video
        ref={ref => {
          this.selfRef = ref;
          this.props.setSelf(ref);
        }}
        className={styles["video"]}
        autoPlay
        playsInline
      />
    );
  }
}

class HandDetect extends Component {
  constructor(props) {
    super(props);
    this.model = null;
    this.state = {
      results: [],
      counter: 0
    };
    this.initWorker();
  }

  initWorker () {
    this.tfWorker = new handWorker();
  }

  async componentDidMount() {
    this.init();

    this.tfWorker.addEventListener("message", values => {      
      console.log("Worker.addEventListener message");
      let results = Array.from(values.data)
        .map((p, i) => {
          return {
            probability: p,
            className: CLASSES[i]
          };
        })
        .sort((a, b) => {
          //一致度の高い順
          return b.probability - a.probability;
        })
        .slice(0, 5); //上位5件

      this.setState({
        results: results,
        counter : this.state.counter + 1
      });
    });
  }

  async init() {
    setInterval(
      async () =>
        tf.tidy(() => {
          let width = this.props.canvas.width;
          let height = this.props.canvas.height;

          var source = this.props.canvas
            .getContext("2d")
            .getImageData(0, 0, width, height);

          let offset = tf.scalar(255);
          let tensor = tf
            .fromPixels(source)
            .resizeNearestNeighbor([100, 100])
            .cast("float32");

          const _tensor = tensor.div(offset).expandDims();

          let float_array = _tensor.toFloat().buffer().values;

          this.tfWorker.postMessage({ float_array, shape: _tensor.shape }, [
            float_array.buffer
          ]);
        }),
      this.props.interval
    );
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

  getLogs() {
    return this.state.results.map(p => {
      return (
        <div>
          {p.className}:{p.probability.toFixed(5)}
        </div>
      );
    });
  }

  imageFromVideo() {
    let tensor = tf
      .fromPixels(this.props.canvas)
      .resizeNearestNeighbor([100, 100])
      .toFloat();
    let offset = tf.scalar(255);
    return tensor.div(offset).expandDims();
  }

  render() {
    return (
      <React.Fragment>
        <div className="log">{this.getLogs()}</div>
        <div>解析回数 : {this.state.counter} 回目</div>
      </React.Fragment>
    );
  }
}

class EmotionDetect extends Component {

  constructor(props){
    super(props);
    this.model = null;
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
      this.predict();
    },this.props.interval);
  }

  //TFモデルのロード
  async loadModel() {
    this.model = await tf.loadModel(`./models/emotion/model.json`);
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
        className: CLASSES_EMOTION[i]
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
    const channels = 1;
    let tensor = tf.fromPixels(this.props.canvas,channels).resizeNearestNeighbor([64,64]).toFloat();
    let offset = tf.scalar(255);
    return tensor.div(offset).expandDims();
  }

  render(){
    return(
      <React.Fragment>
        <div className="log" >{this.getLogs()}</div>
      </React.Fragment>
    )
  }
}

class PoseDetect extends Component {

  constructor(props){
    super(props);
    this.model = null;
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
      this.predict();
    },this.props.interval);
  }

  //TFモデルのロード
  async loadModel() {
    this.model =  await posenet.load();
    let p = new Promise( resolve =>{
      if(this.model) {
        console.log("loaded pose model");
        resolve();
      }
    });
    return p;
  };

  async predict () {
    //let tensor = this.imageFromVideo();
    const pose = await this.model.estimateSinglePose(this.props.canvas, 0.50, true, 16);
    let results = pose.keypoints.map((p,i)=>{
      return {
        score: p.score,
        className: p.part,
        position: p.position,
      }
    }).sort((a,b)=>{//一致度の高い順
      return b.score-a.score;
    })

    this.setState({
      results:results,
    })

    this.drawPoints();
  }

  drawPoints () {
    this.state.results.map( p =>{
      setPoint(this.props.canvas , p.position );
    });
  }

  getLogs(){
    return this.state.results.map( p =>{
      return(
        <div>{p.className}:{p.score.toFixed(5)}</div>
      )
    })
  }

  render(){
    return(
      <React.Fragment>
        <div className="log" >{this.getLogs()}</div>
      </React.Fragment>
    )
  }
}

class FaceDetect extends Component {
  constructor(props) {
    super(props);
    this.canvas = null;
    this.state = {
      faceDetect: {}
    };
  }

  async componentDidMount() {
    await this.init();
    console.log("loaded Face model");

    setInterval(async () => {
      await this.predict();
    }, this.props.interval);
  }

  async init() {
    return await faceapi.nets.ssdMobilenetv1.loadFromUri("./models/face/");
  }

  async predict() {
    if (!this.props.canvas) return;
    const detection = await faceapi.detectSingleFace(this.props.canvas);
    if (detection) {
      //console.log("--" , detection._box );
      this.setState({ faceDetect: detection._box });
    }
  }

  getLogs() {
    if (this.state.faceDetect == {}) return <div />;
    return (
      <div>
        x={this.state.faceDetect._width},y={this.state.faceDetect._height}
      </div>
    );
  }

  render() {
    return (
      <React.Fragment>
        <div className="log">{this.getLogs()}</div>
      </React.Fragment>
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
    if (!this.props.video) {
      return;
    }
    let rect = this.props.video.getBoundingClientRect();
    var context = this.canvas.getContext("2d");
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    context.drawImage(this.props.video, 0, 0, rect.width, rect.height);
  }

  render() {
    return (
      <canvas
        ref={ref => {
          this.canvas = ref;
          this.props.set(ref);
        }}
        id={"canvas"}
        className={styles["canvas"]}
      />
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      video: null,
      canvas: null
    };
  }

  setVideo(ref) {
    if (this.state.video !== ref && ref) {
      this.setState({ video: ref });
    }
  }

  setCanvas(ref) {
    if (this.state.canvas !== ref && ref) {
      this.setState({ canvas: ref });
    }
  }

  render() {
    return (
      <div className="App">
        <Video
          setSelf={ref => {
            this.setVideo(ref);
          }}
        />
        <EmotionDetect canvas={this.state.canvas} interval={500} />
        <FaceDetect canvas={this.state.canvas} interval={500} />
        <PoseDetect canvas={this.state.canvas} interval={100} />
        <HandDetect canvas={this.state.canvas} interval={500} />
        <Canvas
          video={this.state.video}
          set={ref => {
            this.setCanvas(ref);
          }}
          interval={500}
        />
      </div>
    );
  }
}

export default App;
