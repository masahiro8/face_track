import * as tf from "@tensorflow/tfjs";
import { location } from "../config";

const handWorker = self;

tf.loadModel(`${location}models/hand/model.json`).then(model => {
  const _model = model;
  handWorker.addEventListener("message", async values => {
    const { float_array, shape } = values.data;
  
    const tensor = tf.tensor4d( float_array, shape );

    let prediction = await _model.predict(tensor).data(); //検出結果格納

    handWorker.postMessage( prediction );

  });
});

export default null;
