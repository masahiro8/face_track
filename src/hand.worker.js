import * as tf from "@tensorflow/tfjs";
import {location} from './config';

const Worker = self;
tf.loadModel(`${location}models/hand/model.json`).then((model)=>{
  const _model = model;
  Worker.addEventListener('message', async (values) => {
    var source = {'data'  : values.data.raw,
                'width' : values.data.width,
                'height': values.data.height}; 
    let offset = tf.scalar(255);
    let tensor = tf.fromPixels(source).resizeNearestNeighbor([100,100]).cast('float32');//.fromPixelsがHTMLElementの型を参照してエラーになる
    let _tensor = tensor.div(offset).expandDims();
    let prediction = await _model.predict(_tensor).data();//検出結果格納
    // if(prediction) console.log("result");
  });
})

export default null;