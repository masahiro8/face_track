import * as faceapi from "face-api.js/dist/face-api.js";

export const setPoint = ( canvas , pos  , col) =>{
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = col||"#0ff";
  ctx.fillRect(pos.x,pos.y,4,4);
}

export const getLandmarks = (landmarks) => {
  const jawOutline = landmarks.getJawOutline();
  const nose = landmarks.getNose();
  const mouth = landmarks.getMouth();
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  const leftEyeBrow = landmarks.getLeftEyeBrow();
  const rightEyeBrow = landmarks.getRightEyeBrow();
  return {
    nose:nose,
    mouth:mouth,
    leftEye:leftEye,
    rightEye:rightEye,
    leftEyeBrow:leftEyeBrow,
    rightEyeBrow:rightEyeBrow,
    jawOutline:jawOutline,
  }
}

export const resizeCanvasAndResults = (dimensions, canvas, results) => {
  const { width, height } = dimensions instanceof HTMLVideoElement
    ? faceapi.getMediaDimensions(dimensions)
    : dimensions
  canvas.width = width
  canvas.height = height

  // resize detections (and landmarks) in case displayed image is smaller than
  // original size
  return results.map(res => res.forSize(width, height))
}

export const drawDetections = (dimensions, canvas, detections)=> {
  console.log("drawDetections" ,detections);
  const resizedDetections = resizeCanvasAndResults(dimensions, canvas, detections)
  faceapi.drawDetection(canvas, resizedDetections)
}

export const drawLandmarks = (dimensions, canvas, results, withBoxes = true) => {
  
  const resizedResults = resizeCanvasAndResults(dimensions, canvas, results)
  console.log("drawLandmarks = ",resizedResults);
  if (withBoxes) {
    faceapi.drawDetection(canvas, resizedResults.map(det => det.detection))
  }

  const faceLandmarks = resizedResults.map(det => det.landmarks)
  const drawLandmarksOptions = {
    lineWidth: 2,
    drawLines: true,
    color: 'green'
  }
  faceapi.drawLandmarks(canvas, faceLandmarks, drawLandmarksOptions)
}