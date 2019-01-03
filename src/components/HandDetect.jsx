import React, { Component } from "react";
import * as _ from "lodash";
import * as tf from "@tensorflow/tfjs";

// eslint-disable-next-line
import handWorker from "./hand.worker.js";

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

export class HandDetect extends Component {
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
