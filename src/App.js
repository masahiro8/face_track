import React, { Component } from "react";
import * as faceapi from "face-api.js/dist/face-api.js";
import * as _ from 'lodash';
import math from 'mathjs';
import {FaceDetect} from './components/FaceDetect';
import {VideoImage} from './components/VideoCanvas';
import {setPoint,getLandmarks } from './canvas.point';
import styles from './components/VideoCanvas.scss';
import { VIDEO_SIZE , INTERVAL ,PARTS_INDEX } from './config';
import * as vector from './util/vector';

const BASE_PARTS = PARTS_INDEX.leftEye;
const VECTOR_PARTS = PARTS_INDEX.rightEye;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      video:null,
      canvas: null,
      overlay: null,
      result : null,
      landmarks : null,
      positions : null,
    };
    this.overlay = null;
  }

  setCanvas(ref) {
    if (this.state.canvas !== ref && ref) {
      this.setState({ canvas: ref });
    }
  }

  setVideo(ref) {
    if (this.state.video !== ref && ref) {
      this.setState({ video: ref });
      console.log("setVideo " );
    }
  }

  setOverlay(ref) {
    if (this.state.overlay !== ref && ref) {
      this.setState({ overlay: ref });
      this.initCanvas();
      console.log("setOverlay " );
    }
  }

  initCanvas(){
    if( !this.state.canvas || !this.state.overlay ) return;
    this.setState({
      width:VIDEO_SIZE.width,
      height:VIDEO_SIZE.height
    });
  }

  render() {
    return (
      <div className="App">
        <VideoImage 
          size = {VIDEO_SIZE}
          interval={INTERVAL}
          video ={(ref)=>{ this.setVideo(ref); }}
          canvas = {(ref)=>{ this.setCanvas(ref); }}
        />
        <FaceDetect 
          canvas={this.state.canvas} 
          video={this.state.video}
          interval={INTERVAL}
          result={(result)=>{
            const { width, height } = faceapi.getMediaDimensions(this.state.video);
            const resizedResults = [result].map(res => res.forSize(width, height));
            const landmarks = getLandmarks(resizedResults[0].faceLandmarks);

            this.setState({
              landmarks:landmarks,
              positions:resizedResults[0].landmarks.positions
            });
          }} />
        <FaceDetectView
          video = {this.state.video}
          landmarks ={this.state.landmarks}
          positions = {this.state.positions}
          showEyes = {true}
          showPoints = {true}
          setRef = {(ref)=>{this.setOverlay(ref)}}
        />
      </div>
    );
  }
}
export default App;

class FaceDetectView extends Component {
  constructor(props){
    super(props);
    this.canvas = null;

    this.state ={
      points:[]
    };
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.landmarks) {
      this.clearCanvas();
      if(this.props.showEyes) this.drawPoints();
      if(this.props.showPoints) this.drawParts();
      if(this.state.points.length) {
        _.each ( this.state.points ,  ( point , index ) =>{
          this.initPointRate( point,index ,nextProps.positions[BASE_PARTS] , nextProps.positions[VECTOR_PARTS]);
          this.setPoint(point,index ,nextProps.positions[BASE_PARTS] , nextProps.positions[VECTOR_PARTS]);
        })
      }
    }
  }

  setCanvas ( ref ) {
    this.canvas = ref;
    this.props.setRef(ref);
  }

  //描画
  setPoint ( myPoint, index , begin, end ) {
    //原点をbeginとして補正
    const _begin = { x:0 , y: 0};
    const _end = vector.shiftBase( begin , end);
    //ベクトル距離
    const _end_vec = vector.vectorLength(_end);
    //begin > end 距離
    const vec_length = vector.distance(_begin , _end);
    //線上の距離
    const point_distance = vec_length*myPoint.rate.dot;
    const vec = {
      x : ( _begin.x+_end.x/_end_vec*point_distance ) + begin.x,
      y : ( _begin.y+_end.y/_end_vec*point_distance ) + begin.y
    }
    //半径
    const distanceFromCenter = vec_length*myPoint.rate.cross;
    const r = myPoint.bool.cross?270:90;
    const radian = r*Math.PI/180;
    const vec2 = {
      x:distanceFromCenter * Math.cos(radian) + vec.x,
      y:distanceFromCenter * Math.sin(radian) + vec.y,
    }
    setPoint( this.canvas , {x:vec2.x , y:vec2.y} , `rgba(255,255,255)`);
  }

  //初期値
  initPointRate( myPoint, index , begin, end ) {

    if ( myPoint.rate ) return;

    //原点をbeginとして補正
    const _begin = { x:0 , y: 0};
    const _end = vector.shiftBase( begin , end);
    const _myPoint = vector.shiftBase( begin ,myPoint.vector);
    
    //外積
    const _crossProduct = vector.crossProduct(_end,_myPoint);
    const distanceFromEdge = Math.abs(_crossProduct/vector.distance(_begin , _end));//頂点から|begin|endへの距離

    //内積
    const _dotProduct = vector.dotProduct(_end,_myPoint);// _dotProduct<0 -> 正
    const cos_theta = vector.theta(_end,_myPoint);
    const _theta = math.acos(cos_theta);//θ
    const dotDistance = _theta*vector.vectorLength(_myPoint);//内積 -> 絶対値なので正負の判定を入れる必要がある

    //割合
    const vec_length = vector.distance(_begin , _end);
    const rate_vec_point = dotDistance/vec_length;//正しい
    const rate_from_edge = distanceFromEdge/vec_length;
    
    // console.log("cos_theta ",
    //   vector.vectorLength(_end),
    //   vector.vectorLength(_myPoint) , 
    //   cos_theta ,
    //   _theta*180.0/Math.PI,
    //   vector.dotProduct(_end,_myPoint),
    // );

    //初期値を設定
    let _points = this.state.points; 
    _points[index].bool = {
      dot : _dotProduct<0?false:true,
      cross : _crossProduct<0?true:false,
    }
    _points[index].rate = {
      dot : _dotProduct<0?-rate_vec_point:rate_vec_point,
      cross : rate_from_edge,
    }
    this.setState({
      points:_points,
    })
  }

  //キャンバスをクリア
  clearCanvas () {
    const context = this.canvas.getContext("2d");
    context.clearRect(0, 0, VIDEO_SIZE.width, VIDEO_SIZE.height);
  }

  //ベースパーツを描画
  drawPoints (){
    let index = 0;
    _.each ( this.props.positions ,  point =>{
      if(index == BASE_PARTS) {
        setPoint( this.canvas , {x:point.x , y:point.y} , `rgba(255,0,0)`);
      }
      if(index == VECTOR_PARTS) {
        setPoint( this.canvas , {x:point.x , y:point.y} , `rgba(0,255,0)`);
      }
      index++;
    });
  }

  //検出したパーツ
  drawParts () {
    let landmarks = this.props.landmarks;
    // パーツごとに色分け
    const getColor = ( col , index ) =>{
      let cols = [
        `rgb(255,${index},${index})`,
        `rgb(${index},255,${index})`,
        `rgb(${index},${index},255)`,
        `rgb(255,255,${index})`,//左目
        `rgb(${index},255,255)`,//右目
        `rgb(255,${index},255)`,
        `rgb(${index},${index},${index})`,
      ]
      return cols[col];
    }

    let col = 0;//パーツインデックス
    let index = 0;//パーツ内インデックス
    let step = Math.floor(255/10);//色の段階
    _.each(landmarks ,( parts , key )=> {
      col++;
      index = 0;
      parts.map ( point => {
        index++;
        setPoint( this.canvas , {x:point.x , y:point.y} , getColor(col , index*step ));
      })
    })
    
  }

  //追加
  addPoint (e) {
    var rect = this.canvas.getBoundingClientRect();
    // const x = (rect.width/2)+((rect.width/2) - (e.clientX - rect.left));
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let _points = this.state.points;
    _points.push({
      vector:{x:x,y:y},
      rate:null,
    });
    this.setState({
      points : _points
    });
    console.log("points " , _points );
  }

  render(){
    return(
      <canvas
        ref={ref => {
          this.setCanvas(ref);
        }}
        width={VIDEO_SIZE.width}
        height={VIDEO_SIZE.height}
        className = {styles["overlayCanvas"]}
        onClick = {(e)=>{
          this.addPoint(e);
        }}
      />
    )
  }
}
