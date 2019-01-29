import React, { Component } from "react";
import * as faceapi from "face-api.js/dist/face-api.js";
import * as _ from 'lodash';
import {FaceDetect} from './components/FaceDetect';
import {FaceDetectView} from './components/FaceDetectView';
import {VideoImage} from './components/VideoCanvas';
import { getLandmarks } from './canvas.point';
import { VIDEO_SIZE , INTERVAL, PARTS_INDEX  } from './config';
import AssetLoader from './components/AssetLoader';
import AssetsSelectMenu from './components/AssetsSelectMenu';
import {aniSprite} from './components/ani';
import {scheduleDelegate} from './components/scheduleDelegate';


class App extends Component {
  constructor(props) {
    super(props);

    //使用するアセット
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

    //アセットの表示スケジュール(未実装)
    //TODO:中心位置を設定する
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
      points:[],//仮でアセットの中心位置を保持
      editMode : true,
    };

    this.partsConfig = {
      base: PARTS_INDEX.leftEye,
      vector: PARTS_INDEX.rightEye,
    }

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
    }
  }

  setOverlay(ref) {
    if (this.state.overlay !== ref && ref) {
      this.setState({ overlay: ref });
      this.initCanvas();
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
          progress = {( progress )=>{
            console.log("progress " , progress );
          }}
          done  = {()=>{ 
            this.schedule.start(); }}
          view = {( anies ) => {
            return(
              <React.Fragment>
                <FaceDetectView
                  showEyes = {false}//眼の点を表示 ediMode=trueの場合はtrue
                  showPoints = {false} //クリック点を表示
                  editMode = {this.state.editMode} //編集モード
                  multiPoints = {false} //複数ポイント作成
                  editCallback = {(points)=>{
                    console.log( "edit  callback " , points );
                  }}//クリック点の座標データ
                  video = {this.state.video}//videoタグ
                  setRef = {(ref)=>{this.setOverlay(ref)}}//canvasタグ
                  partsConfig = {this.partsConfig}//基準パーツ
                  landmarks ={this.state.landmarks}//検出パーツ
                  positions = {this.state.positions}//描画用の点
                  anies = {anies}//AssetLoaderから返されるアニメーションデータ
                  selectedAssetId ={this.state.selectedAssetId}//表示するアセットid
                />
              </React.Fragment>
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
          this.setState({editMode:!this.state.editMode})
        }}>editMode</button>

        <button onClick={()=>{
          this.setState({selectedAssetId:1})
        }}>star</button>
        
        <button onClick={()=>{
          this.setState({selectedAssetId:2})
        }}>glasses</button>
        
        <button onClick={()=>{
          this.setState({selectedAssetId:3})
        }}>star2</button>

        <AssetsSelectMenu 
          assets = { this.assets }
          callback = {(id)=>{
            this.setState({selectedAssetId:id})
          }}
          />
        
      </div>
    );
  }

}
export default App;

