import React, { Component } from "react";
import * as faceapi from "face-api.js/dist/face-api.js";
import * as _ from "lodash";
import { FaceDetect } from "./components/FaceDetect";
import { FaceDetectView } from "./components/FaceDetectView";
import { VideoImage } from "./components/VideoCanvas";
import { getLandmarks } from "./canvas.point";
import { VIDEO_SIZE, INTERVAL, PARTS_INDEX } from "./config";
import AssetLoader from "./components/AssetLoader";
import AssetsSelectMenu from "./components/AssetsSelectMenu/AssetsSelectMenu";
import StampManager from "./components/StampManager/StampManager";
import { aniSprite } from "./components/ani";
import { scheduleDelegate } from "./components/scheduleDelegate";
import styles from "./App.scss";
import { Header, HeaderItem } from "./components/Header/Header";
import { icons } from "./icon/Icons";

class App extends Component {
  constructor(props) {
    super(props);

    //使用するアセット
    this.assets = [
      {
        id: 1,
        type: "image",
        src: ["./images/star_01.png"],
        tiltFlag: true,
        anim: [
          {
            index: 1,
            pos: { x: 0, y: 0 },
            rot: 0,
            scale: { x: 1, y: 1 },
            time: 0.0
          },
          {
            index: 2,
            pos: { x: -100, y: 100 },
            rot: 360,
            scale: { x: 1, y: 1 },
            time: 0.5
          },
          {
            index: 3,
            pos: { x: -100, y: 200 },
            rot: 180,
            scale: { x: 1, y: 1 },
            time: 1.0
          },
          {
            index: 4,
            pos: { x: 100, y: 0 },
            rot: 200,
            scale: { x: 1, y: 1 },
            time: 1.5
          },
          {
            index: 5,
            pos: { x: -100, y: -200 },
            rot: 360,
            scale: { x: 1, y: 1 },
            time: 2.0
          },
          {
            index: 6,
            pos: { x: 0, y: 100 },
            rot: 180,
            scale: { x: 1, y: 1 },
            time: 2.5
          },
          {
            index: 7,
            pos: { x: 0, y: 0 },
            rot: 0,
            scale: { x: 1, y: 1 },
            time: 3.0
          }
        ]
      },
      {
        id: 2,
        type: "ani",
        src: ["./images/arrow_left.png"],
        tiltFlag: true,
        anim: [
          {
            index: 1,
            pos: { x: 0, y: 0 },
            rot: 0,
            scale: { x: 1, y: 1 },
            time: 0.0
          },
          {
            index: 2,
            pos: { x: 10, y: 0 },
            rot: 45,
            scale: { x: 1, y: 1 },
            time: 0.5
          },
          {
            index: 3,
            pos: { x: 80, y: 0 },
            rot: 90,
            scale: { x: 1, y: 1 },
            time: 1.0
          },
          {
            index: 4,
            pos: { x: 90, y: 0 },
            rot: 95,
            scale: { x: 1, y: 1 },
            time: 1.5
          }
        ]
      },
      {
        id: 3,
        type: "ani",
        src: ["./images/arrow_left.png"],
        tiltFlag: false,
        anim: [
          {
            index: 1,
            pos: { x: 0, y: 0 },
            rot: 0,
            scale: { x: 1, y: 1 },
            time: 0.0
          }
        ]
      }
    ];

    //アセットの表示スケジュール(未実装)
    //TODO:中心位置を設定する
    // this.schedules = [
    //   {
    //     start:1.0,
    //     end:2.0,
    //     asset:1,
    //     position:{
    //       x:null,
    //       y:null
    //     }
    //   },
    //   {
    //     start:3.0,
    //     end:4.0,
    //     asset:2,
    //     position:{
    //       x:null,
    //       y:null
    //     }
    //   },
    //   {
    //     start:5.0,
    //     end:6.0,
    //     asset:3,
    //     position:{
    //       x:null,
    //       y:null
    //     }
    //   },
    // ];

    this.state = {
      video: null,
      canvas: null,
      overlay: null,
      result: null,
      landmarks: null,
      positions: null,
      anies: [],
      editMode: true, //アセットの表示非表示
      stampMode: true, //スタンプの表示非表示
      data: {
        //ロードするスタンプ
        assetId: 1,
        rate: {},
        bool: {}
      }
    };

    this.partsConfig = {
      base: PARTS_INDEX.leftEye,
      vector: PARTS_INDEX.rightEye
    };

    this.callback = {
      edit: () => {},
      assets: () => {
        this.setState({ editMode: !this.state.editMode });
      },
      stamps: () => {
        this.setState({ stampMode: !this.state.stampMode });
      }
    };

    this.overlay = null;

    //イベントを設定
    // this.schedule = new scheduleDelegate();
    // _.each( this.schedules , val =>{
    //   this.schedule.setCallback({
    //     time:val.start,
    //     callback:()=>{
    //       console.log("start",val.asset ,val.start);
    //     }
    //   })
    //   this.schedule.setCallback({
    //     time:val.end,
    //     callback:()=>{
    //       console.log("end",val.asset ,val.end);
    //     }
    //   })
    // })
    // this.schedule.start();
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

  initCanvas() {
    if (!this.state.canvas || !this.state.overlay) return;
    this.setState({
      width: VIDEO_SIZE.width,
      height: VIDEO_SIZE.height
    });
  }

  render() {
    return (
      <div className="App">
        <Header
          menu={[
            {
              id: 1,
              label: "assets",
              icon: "assets",
              callback: this.callback.assets,
              show: this.state.editMode
            },
            {
              id: 2,
              label: "stamps",
              icon: "stamps",
              callback: this.callback.stamps,
              show: this.state.stampMode
            }
          ]}
        />
        <div className={styles["viewer"]}>
          <VideoImage
            size={VIDEO_SIZE}
            interval={INTERVAL}
            video={ref => {
              this.setVideo(ref);
            }}
            canvas={ref => {
              this.setCanvas(ref);
            }}
          />
          <FaceDetect
            canvas={this.state.canvas}
            video={this.state.video}
            interval={INTERVAL}
            result={result => {
              const { width, height } = faceapi.getMediaDimensions(
                this.state.video
              );
              const resizedResults = [result].map(res =>
                res.forSize(width, height)
              );
              const landmarks = getLandmarks(resizedResults[0].faceLandmarks);
              this.setState({
                landmarks: landmarks,
                positions: resizedResults[0].landmarks.positions
              });
            }}
          />
          <AssetLoader
            assets={this.assets}
            progress={progress => {}}
            done={() => {}}
            view={anies => {
              return (
                <React.Fragment>
                  <FaceDetectView
                    showEyes={false} //眼の点を表示 ediMode=trueの場合はtrue
                    showPoints={false} //クリック点を表示
                    editMode={this.state.editMode} //編集モード
                    multiPoints={false} //複数ポイント作成
                    editCallback={points => {
                      console.log("edit  callback ", points);
                      //アセットを更新
                      let data = this.state.data;
                      data.bool = points.bool;
                      data.rate = points.rate;
                      data.assetId = points.assetId;
                      this.setState({ data });
                    }} //クリック点の座標データ
                    video={this.state.video} //videoタグ
                    setRef={ref => {
                      this.setOverlay(ref);
                    }} //canvasタグ
                    partsConfig={this.partsConfig} //基準パーツ
                    landmarks={this.state.landmarks} //検出パーツ
                    positions={this.state.positions} //描画用の点
                    anies={anies} //AssetLoaderから返されるアニメーションデータ
                    loadData={this.state.data}
                  />
                </React.Fragment>
              );
            }}
          />
        </div>

        <AssetsSelectMenu
          show={this.state.editMode}
          assets={this.assets}
          callback={id => {
            let data = _.clone(this.state.data);
            data.assetId = id;
            this.setState({ data });
          }}
        />

        <StampManager
          show={this.state.stampMode}
          assets={this.assets}
          currentAsset={this.state.data}
          callback={data => {
            this.setState({ data });
          }}
        />
      </div>
    );
  }
}
export default App;
