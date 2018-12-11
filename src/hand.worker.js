import * as tf from "@tensorflow/tfjs";
import { location } from "./config";

const Worker = self;

tf.loadModel(`${location}models/hand/model.json`).then(model => {
  const _model = model;
  Worker.addEventListener("message", async values => {
    const { float_array, shape } = values.data;
  
    const tensor = tf.tensor4d( float_array, shape );

    let prediction = await _model.predict(tensor).data(); //検出結果格納

    Worker.postMessage( prediction );

  });
});

export default null;
