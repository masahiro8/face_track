import React, { Component } from "react";
import * as faceapi from "face-api.js/dist/face-api.js";
import * as _ from 'lodash';
import math from 'mathjs';
import {FaceDetect} from './components/FaceDetect';
import {VideoImage} from './components/VideoCanvas';
import {setPoint,getLandmarks } from './canvas.point';
import {setImage ,setRotate } from './canvas.image';
import styles from './components/VideoCanvas.scss';
import { VIDEO_SIZE , INTERVAL ,PARTS_INDEX } from './config';
import * as vector from './util/vector';
import AssetLoader from './components/AssetLoader';
import ani,{aniSprite} from './components/ani';
import {scheduleDelegate} from './components/scheduleDelegate';

const BASE_PARTS = PARTS_INDEX.leftEye;
const VECTOR_PARTS = PARTS_INDEX.rightEye;

class App extends Component {
  constructor(props) {
    super(props);

    this.assets =  [
      {
        id:1,
        type:'image',
        src:['./images/star_01.png',],
        tiltFlag:true,
        anim :[
          { index:1 , pos: { x:0, y:0} , rot:0 , scale:{x:1,y:1} ,time:0.0 , },
          { index:2 , pos: { x:-100, y:100} , rot:360 , scale:{x:1,y:1} ,time:0.5 , },
          { index:3 , pos: { x:-100, y:200} , rot:180 , scale:{x:1,y:1} ,time:1.0 , },
          { index:4 , pos: { x:100, y:0} , rot:200 , scale:{x:1,y:1} ,time:1.5 , },
          { index:5 , pos: { x:-100, y:-200} , rot:360 , scale:{x:1,y:1} ,time:2.0 , },
          { index:6 , pos: { x:0, y:100} , rot:180 , scale:{x:1,y:1} ,time:2.5 , },
          { index:7 , pos: { x:0, y:0} , rot:0 , scale:{x:1,y:1} ,time:3.0 , }
        ]
      },
      {
        id:2,
        type:'ani',
        src:['./images/arrow_left.png',],
        tiltFlag:true,
        anim :[
          { index:1 , pos: { x:0, y:0} , rot:0 , scale:{x:1,y:1} ,time:0.0 , },
          { index:2 , pos: { x:10, y:0} , rot:45 , scale:{x:1,y:1} ,time:0.5 , },
          { index:3 , pos: { x:80, y:0} , rot:90 , scale:{x:1,y:1} ,time:1.0 , },
          { index:4 , pos: { x:90, y:0} , rot:95 , scale:{x:1,y:1} ,time:1.5 , },
        ]
      },
      {
        id:3,
        type:'ani',
        src:['./images/arrow_left.png',],
        tiltFlag:false,
        anim :[
          { index:1 , pos: { x:0, y:0} , rot:0 , scale:{x:1,y:1} ,time:0.0 , },
        ]
      },
    ];

    this.schedules = [
      {
        start:1.0,
        end:2.0,
        asset:1,
        position:{
          x:null,
          y:null
        }
      },
      {
        start:3.0,
        end:4.0,
        asset:2,
        position:{
          x:null,
          y:null
        }
      },
      {
        start:5.0,
        end:6.0,
        asset:3,
        position:{
          x:null,
          y:null
        } 
      },
    ];

    this.state = {
      video:null,
      canvas: null,
      overlay: null,
      result : null,
      landmarks : null,
      positions : null,
      anies : [],
      selectedAssetId:1,
    };

    this.overlay = null;

    //イベントを設定
    this.schedule = new scheduleDelegate();
    _.each( this.schedules , val =>{
      this.schedule.setCallback({
        time:val.start,
        callback:()=>{
          console.log("start",val.asset ,val.start);
          
        }
      })
      this.schedule.setCallback({
        time:val.end,
        callback:()=>{
          console.log("end",val.asset ,val.end);
        }
      })
    })
    this.schedule.start();
  }

  setCanvas(ref) {
    if (this.state.canvas !== ref && ref) {
      this.setState({ canvas: ref });
    }
  }

  setVideo(ref) {
    if (this.state.video !== ref && ref) {
      this.setState({ video: ref });
      //console.log("setVideo " );
    }
  }

  setOverlay(ref) {
    if (this.state.overlay !== ref && ref) {
      this.setState({ overlay: ref });
      this.initCanvas();
      //console.log("setOverlay " );
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
        <AssetLoader
          assets = {this.assets}
          setImages = {(images)=>{
            let anies = _.map( images , image =>{
              const value = _.filter( this.assets , asset =>{return asset.id==image.id });
              return {
                id:image.id,
                sprite:new aniSprite( value[0] , image.image , this.schedule )
              };
            });
            this.setState({
              anies : anies,
            });
            //タイマー開始
            this.schedule.start();
          }}
          view = {() => {
            return(
              <FaceDetectView
                video = {this.state.video}
                landmarks ={this.state.landmarks}
                positions = {this.state.positions}
                showEyes = {true}
                showPoints = {false}
                setRef = {(ref)=>{this.setOverlay(ref)}}
                anies = {this.state.anies}
                selectedAssetId ={this.state.selectedAssetId}
              />
            );
          }}
        ></AssetLoader>
        <button 
          style={{display:"none"}}
          onClick={()=>{
          if(this.schedule.isPlay) {
            this.schedule.pause();
          }else {
            this.schedule.restart();
          }
        }}>play/stop</button>
        <button onClick={()=>{
          this.setState({selectedAssetId:1})
        }}>star</button>
        <button onClick={()=>{
          this.setState({selectedAssetId:2})
        }}>glasses</button>
        <button onClick={()=>{
          this.setState({selectedAssetId:3})
        }}>star2</button>
      </div>
    );
  }

}
export default App;

class FaceDetectView extends Component {
  constructor(props){
    super(props);
    this.canvas = null;
    this.tilt = null;
    this.deg = null;
    this.radian = null;
    this.star = null;

    //ローパスフィルタ用
    this.positions = Array.apply(null,new Array(68));
    this.positions[VECTOR_PARTS] = {x:0,y:0};
    this.positions[BASE_PARTS] = {x:0,y:0};

    this.state ={
      points:[],
      tilt:null,
    };
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.landmarks) {
      this.clearCanvas();

      //平均化ローパスフィルタ
      if( this.props.positions ) {
        this.positions[VECTOR_PARTS] = this.lowpathFilter(this.props.positions[VECTOR_PARTS] , nextProps.positions[VECTOR_PARTS]);
        this.positions[BASE_PARTS]   = this.lowpathFilter(this.props.positions[BASE_PARTS] , nextProps.positions[BASE_PARTS]);
      }else {
        //通常
        this.positions[VECTOR_PARTS] = nextProps.positions[VECTOR_PARTS];
        this.positions[BASE_PARTS]   = nextProps.positions[BASE_PARTS];
      }

      this.detectTilt(this.positions[VECTOR_PARTS],this.positions[BASE_PARTS]);

      if(this.props.showEyes) this.drawPoints();
      if(this.props.showPoints) this.drawParts();
      if(this.state.points.length) {
        _.each ( this.state.points ,  ( point , index ) =>{
          this.initPointRate( point,index ,this.positions[BASE_PARTS] , this.positions[VECTOR_PARTS]);
          this.setPoint(point,index ,this.positions[BASE_PARTS] , this.positions[VECTOR_PARTS]);
        })
      }
    }
  }

  setCanvas ( ref ) {
    this.canvas = ref;
    this.props.setRef(ref);
  }

  //ローパス
  lowpathFilter (prev,next) {
    return {
      x:(prev.x*0.9)+(next.x*0.1),
      y:(prev.y*0.9)+(next.y*0.1),
    }
  }

  //傾き検出
  detectTilt ( begin , end ){
    //原点をbeginとして補正
    const _begin = { x:0 , y: 0};
    const _end = vector.shiftBase( begin , end);
    //なす角
    const _crossProduct = vector.crossProduct(_end,{x:100,y:0});
    this.radian = Math.acos(vector.tilt(_end));
    this.deg = this.radian*(180/Math.PI);
    this.tilt = _crossProduct<0?this.radian:-this.deg*(Math.PI/180);
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
    
    //仮で画像描画
    const asset = _.filter(this.props.anies,(asset)=>{return asset.id==this.props.selectedAssetId})
    if( asset.length ) {
      const img = asset[0].sprite.img;
      let _x = vec2.x - (img.width/2);
      let _y = vec2.y - (img.height/2);
      asset[0].sprite.setCanvas(this.canvas).transform(
        {x:_x , y:_y},
        this.tilt,
        -this.tilt,
      );
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

  //ポイントを追加
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
    //console.log("points " , _points );
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
