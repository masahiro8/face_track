import React, { Component } from "react";
import * as _ from "lodash";
import math from "mathjs";
import { VIDEO_SIZE } from "../config";
import * as vector from "../util/vector";
import * as Tilt from "../util/tilt";
import { setPoint } from "../canvas.point";
import styles from "./VideoCanvas.scss";

export class Canvas3DView extends Component {
  constructor(props) {
    super(props);
    this.canvas = null;
    this.tilt = {
      x: null,
      y: null,
      z: null
    };
    this.deg = null;
    this.radian = null;
    this.star = null;

    //検出対象のパーツ番号
    this.BASE_PARTS = this.props.partsConfig.base;
    this.VECTOR_PARTS = this.props.partsConfig.vector;
    this.CENTER_PARTS = this.props.partsConfig.center;

    //ローパスフィルタ用
    this.positions = Array.apply(null, new Array(68));
    this.positions[this.VECTOR_PARTS] = { x: 0, y: 0 };
    this.positions[this.BASE_PARTS] = { x: 0, y: 0 };
    this.positions[this.CENTER_PARTS] = { x: 0, y: 0 };

    this.state = {
      assetId: 1,
      points: [
        {
          rate: {
            dot: 0.5,
            cross: 0
          },
          bool: {
            dot: true,
            cross: false
          }
        }
      ]
    };
  }

  componentWillReceiveProps(nextProps) {
    //ロードされたデータ
    if (
      JSON.stringify(nextProps.loadData) !== JSON.stringify(this.props.loadData)
    ) {
      this.setState({
        assetId: nextProps.loadData.assetId
      });
    }

    if (nextProps.landmarks) {
      this.clearCanvas();

      //通常
      this.positions[this.VECTOR_PARTS] =
        nextProps.positions[this.VECTOR_PARTS];
      this.positions[this.BASE_PARTS] = nextProps.positions[this.BASE_PARTS];
      this.positions[this.CENTER_PARTS] =
        nextProps.positions[this.CENTER_PARTS];

      //傾き
      this.tilt.z = Tilt.z(
        this.positions[this.VECTOR_PARTS],
        this.positions[this.BASE_PARTS]
      );

      this.tilt.y = Tilt.y(
        this.positions[this.VECTOR_PARTS],
        this.positions[this.BASE_PARTS],
        this.positions[this.CENTER_PARTS]
      );

      this.tilt.x = Tilt.x(
        this.positions[this.VECTOR_PARTS],
        this.positions[this.BASE_PARTS],
        this.positions[this.CENTER_PARTS]
      );

      if (this.props.showEyes || this.props.editMode) this.drawPoints();
      if (this.props.showPoints) this.drawParts();
      if (this.state.points.length) {
        _.each(this.state.points, (point, index) => {
          this.setPoint(
            point,
            index,
            this.positions[this.BASE_PARTS],
            this.positions[this.VECTOR_PARTS]
          );
        });
      }
    }
  }

  setCanvas(ref) {
    this.canvas = ref;
    this.props.setRef(ref);
  }

  //描画
  setPoint(myPoint, index, begin, end) {
    //原点をbeginとして補正
    const _begin = { x: 0, y: 0 };
    const _end = vector.shiftBase(begin, end);
    //ベクトル
    const _end_vec = vector.vectorLength(_end);
    //begin-end間の距離
    const vec_length = vector.distance(_begin, _end);
    //begin-end線上の投影座標
    const point_distance = vec_length * myPoint.rate.dot;
    //中心座標
    const vec = {
      x: _begin.x + (_end.x / _end_vec) * point_distance + begin.x,
      y: _begin.y + (_end.y / _end_vec) * point_distance + begin.y
    };

    //仮で画像描画
    const asset = _.filter(this.props.anies, asset => {
      return asset.id == this.state.assetId;
    });
    if (asset.length) {
      const img = asset[0].sprite.img;
      let _x = vec.x - img.width / 2;
      let _y = vec.y - img.height / 2;
      asset[0].sprite
        .setCanvas(this.canvas)
        .transform({ x: _x, y: _y }, this.tilt.z, -this.tilt.z);
    }

    if (this.props.editMode) {
      setPoint(this.canvas, { x: vec.x, y: vec.y }, `rgba(255,255,255)`);
    }
  }

  //キャンバスをクリア
  clearCanvas() {
    const context = this.canvas.getContext("2d");
    context.clearRect(0, 0, VIDEO_SIZE.width, VIDEO_SIZE.height);
  }

  //ベースパーツを描画
  drawPoints() {
    let index = 0;
    _.each(this.props.positions, point => {
      if (index == this.BASE_PARTS) {
        setPoint(this.canvas, { x: point.x, y: point.y }, `rgba(255,0,0)`);
      }
      if (index == this.VECTOR_PARTS) {
        setPoint(this.canvas, { x: point.x, y: point.y }, `rgba(0,255,0)`);
      }
      if (index == this.CENTER_PARTS) {
        setPoint(this.canvas, { x: point.x, y: point.y }, `rgba(0,0,255)`);
      }
      index++;
    });
  }

  //検出したパーツ
  drawParts() {
    let landmarks = this.props.landmarks;
    // パーツごとに色分け
    const getColor = (col, index) => {
      let cols = [
        `rgb(255,${index},${index})`,
        `rgb(${index},255,${index})`,
        `rgb(${index},${index},255)`,
        `rgb(255,255,${index})`, //左目
        `rgb(${index},255,255)`, //右目
        `rgb(255,${index},255)`,
        `rgb(${index},${index},${index})`
      ];
      return cols[col];
    };

    let col = 0; //パーツインデックス
    let index = 0; //パーツ内インデックス
    let step = Math.floor(255 / 10); //色の段階
    _.each(landmarks, (parts, key) => {
      col++;
      index = 0;
      parts.map(point => {
        index++;
        setPoint(
          this.canvas,
          { x: point.x, y: point.y },
          getColor(col, index * step)
        );
      });
    });
  }

  render() {
    return (
      <div className={styles["viewerCanvas"]}>
        <canvas
          ref={ref => {
            this.setCanvas(ref);
          }}
          width={VIDEO_SIZE.width}
          height={VIDEO_SIZE.height}
          className={styles["overlayCanvas"]}
        />
        <div style={{ color: "white" }}>
          tilt.z:
          {this.tilt.z}
        </div>
        <div style={{ color: "white" }}>
          tilt.y:
          {this.tilt.y}
        </div>
        <div style={{ color: "white" }}>
          tilt.x:
          {this.tilt.x}
        </div>
      </div>
    );
  }
}
