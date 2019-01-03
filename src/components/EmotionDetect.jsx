import React, { Component } from "react";
import * as _ from "lodash";
import * as tf from "@tensorflow/tfjs";

const CLASSES_EMOTION =  ({
  0:'😠 angry',
  1:'😬 disgust',
  2:'😨 fear',
  3:'😄 happy',
  4:'😢 sad',
  5:'😮 surprise',
  6:'😐 neutral'});

export class EmotionDetect extends Component {

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
    this.model = await tf.loadModel(`../models/emotion/model.json`);
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