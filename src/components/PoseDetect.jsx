import React, { Component } from "react";
import * as posenet from '@tensorflow-models/posenet';
import {setPoint} from '../canvas.point.js';

export class PoseDetect extends Component {

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

    this.props.result(results);

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
        {this.props.log?<div className="log" >{this.getLogs()}</div>:<div/>}
      </React.Fragment>
    )
  }
}