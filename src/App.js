import React, { Component } from 'react';
import * as faceapi from 'face-api.js/dist/face-api.js';
import * as _ from 'lodash';
import { FaceDetect } from './components/FaceDetect';
import { VideoImage } from './components/VideoCanvas';
import { getLandmarks } from './canvas.point';
import { VIDEO_SIZE, INTERVAL, PARTS_INDEX } from './config';
import AssetLoader from './components/AssetLoader';
import AssetsSelectMenu from './components/AssetsSelectMenu/AssetsSelectMenu';
import StampManager from './components/StampManager/StampManager';
import { aniSprite } from './components/ani';
import { scheduleDelegate } from './components/scheduleDelegate';
import styles from './App.scss';
import { Header, HeaderItem } from './components/Header/Header';
import { icons } from './icon/Icons';
import { assets } from './assets/assets.js';

import { Canvas2DView } from './components/Canvas2DView';
import { Web3DView } from './components/Web3DView/Web3DView';
import { Web3D } from './components/Web3DView/Web3D';
import { Glasses } from './components/Web3DView/Scenes/Model';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      assets: assets,
      video: null,
      canvas: null,
      overlay: null,
      result: null,
      landmarks: null,
      positions: null,
      anies: [],
      editMenu: false, //アセットの表示非表示
      stampMenu: false, //スタンプの表示非表示
      tilt: {}, //3DViewで回転を抽出
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

    this.partsConfig3D = {
      base: PARTS_INDEX.leftEye,
      vector: PARTS_INDEX.rightEye,
      center: PARTS_INDEX.nose
    };

    this.callback = {
      edit: () => {},
      assets: () => {
        this.setState({ editMenu: !this.state.editMenu });
      },
      stamps: () => {
        this.setState({ stampMenu: !this.state.stampMenu });
      }
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
              label: 'assets',
              icon: 'assets',
              callback: this.callback.assets,
              show: this.state.editMenu
            },
            {
              id: 2,
              label: 'stamps',
              icon: 'stamps',
              callback: this.callback.stamps,
              show: this.state.stampMenu
            }
          ]}
        />
        <div className={styles['viewer']}>
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
            assets={this.state.assets}
            progress={progress => {}}
            done={() => {}}
            view={anies => {
              return (
                <React.Fragment>
                  <Canvas2DView
                    showEyes={false} //眼の点を表示 ediMode=trueの場合はtrue
                    showPoints={false} //クリック点を表示
                    multiPoints={false} //複数ポイント作成
                    editable
                    editMenu={this.state.editMenu} //編集モード
                    editCallback={points => {
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
                    partsConfig={this.partsConfig3D} //基準パーツ
                    landmarks={this.state.landmarks} //検出パーツ
                    positions={this.state.positions} //描画用の点
                    anies={anies} //AssetLoaderから返されるアニメーションデータ
                    loadData={this.state.data} //スタンプデータ
                  />
                  <Web3D
                    size={VIDEO_SIZE}
                    tilt={this.state.tilt}
                    positions={this.state.positions} //描画用の点
                    partsConfig={this.partsConfig3D} //基準パーツ
                    landmarks={this.state.landmarks} //検出パーツ
                    scene={(position, quat, scale) => {
                      return (
                        <Glasses
                          size={VIDEO_SIZE}
                          partsConfig={this.partsConfig3D} //基準パーツ
                          position={position}
                          quat={quat}
                          scale={scale}
                        />
                      );
                    }}
                  />
                </React.Fragment>
              );
            }}
          />
        </div>

        <AssetsSelectMenu
          show={this.state.editMenu}
          assets={this.state.assets}
          callback={id => {
            let data = _.clone(this.state.data);
            data.assetId = id;
            this.setState({ data });
          }}
        />

        <StampManager
          show={this.state.stampMenu}
          assets={this.state.assets}
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
