import React, { Component } from "react";
import * as _ from "lodash";
import math from "mathjs";
import { VIDEO_SIZE } from "../config";
import * as vector from "../util/vector";
import * as Tilt from "../util/tilt";
import { setPoint } from "../canvas.point";
import styles from "./VideoCanvas.scss";

export class Canvas2DView extends Component {
  constructor(props) {
    super(props);
    this.canvas = null;
    this.tilt = null;
    this.deg = null;
    this.radian = null;
    this.star = null;

    //検出対象のパーツ番号
    this.BASE_PARTS = this.props.partsConfig.base;
    this.VECTOR_PARTS = this.props.partsConfig.vector;

    //ローパスフィルタ用
    this.positions = Array.apply(null, new Array(68));
    this.positions[this.VECTOR_PARTS] = { x: 0, y: 0 };
    this.positions[this.BASE_PARTS] = { x: 0, y: 0 };

    this.state = {
      assetId: null,
      points: [],
      tilt: null
    };
  }

  componentWillReceiveProps(nextProps) {
    //ロードされたデータ
    if (
      JSON.stringify(nextProps.loadData) !== JSON.stringify(this.props.loadData)
    ) {
      console.log("points", this.state.points);
      let points = this.state.points;
      points[0] = nextProps.loadData;
      this.setState({
        points: points,
        assetId: nextProps.loadData.assetId
      });
    }

    if (nextProps.landmarks) {
      this.clearCanvas();

      //平均化ローパスフィルタ
      if (this.props.positions) {
        this.positions[this.VECTOR_PARTS] = this.lowpathFilter(
          this.props.positions[this.VECTOR_PARTS],
          nextProps.positions[this.VECTOR_PARTS]
        );
        this.positions[this.BASE_PARTS] = this.lowpathFilter(
          this.props.positions[this.BASE_PARTS],
          nextProps.positions[this.BASE_PARTS]
        );
      } else {
        //通常
        this.positions[this.VECTOR_PARTS] =
          nextProps.positions[this.VECTOR_PARTS];
        this.positions[this.BASE_PARTS] = nextProps.positions[this.BASE_PARTS];
      }

      this.tilt = Tilt.z(
        this.positions[this.VECTOR_PARTS],
        this.positions[this.BASE_PARTS]
      );

      if (this.props.showEyes || this.props.editMode) this.drawPoints();
      if (this.props.showPoints) this.drawParts();
      if (this.state.points.length) {
        _.each(this.state.points, (point, index) => {
          this.initPointRate(
            point,
            index,
            this.positions[this.BASE_PARTS],
            this.positions[this.VECTOR_PARTS]
          );
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

  //ローパス
  lowpathFilter(prev, next) {
    return {
      x: prev.x * 0.9 + next.x * 0.1,
      y: prev.y * 0.9 + next.y * 0.1
    };
  }

  //描画
  setPoint(myPoint, index, begin, end) {
    //原点をbeginとして補正
    const _begin = { x: 0, y: 0 };
    const _end = vector.shiftBase(begin, end);
    //ベクトル距離
    const _end_vec = vector.vectorLength(_end);
    //begin > end 距離
    const vec_length = vector.distance(_begin, _end);
    //線上の距離
    const point_distance = vec_length * myPoint.rate.dot;
    const vec = {
      x: _begin.x + (_end.x / _end_vec) * point_distance + begin.x,
      y: _begin.y + (_end.y / _end_vec) * point_distance + begin.y
    };
    //半径
    const distanceFromCenter = vec_length * myPoint.rate.cross;
    const r = myPoint.bool.cross ? 270 : 90;
    const radian = (r * Math.PI) / 180;
    const vec2 = {
      x: distanceFromCenter * Math.cos(radian) + vec.x,
      y: distanceFromCenter * Math.sin(radian) + vec.y
    };

    //仮で画像描画
    const asset = _.filter(this.props.anies, asset => {
      return asset.id == this.state.assetId;
    });
    if (asset.length) {
      const img = asset[0].sprite.img;
      let _x = vec2.x - img.width / 2;
      let _y = vec2.y - img.height / 2;
      asset[0].sprite
        .setCanvas(this.canvas)
        .transform({ x: _x, y: _y }, this.tilt, -this.tilt);
    }

    if (this.props.editMode) {
      setPoint(this.canvas, { x: vec2.x, y: vec2.y }, `rgba(255,255,255)`);
    }
  }

  //初期値
  initPointRate(myPoint, index, begin, end) {
    if (myPoint.rate) return;

    //原点をbeginとして補正
    const _begin = { x: 0, y: 0 };
    const _end = vector.shiftBase(begin, end);
    const _myPoint = vector.shiftBase(begin, myPoint.vector);

    //外積
    const _crossProduct = vector.crossProduct(_end, _myPoint);
    const distanceFromEdge = Math.abs(
      _crossProduct / vector.distance(_begin, _end)
    ); //頂点から|begin|endへの距離

    //内積
    const _dotProduct = vector.dotProduct(_end, _myPoint); // _dotProduct<0 -> 正
    const cos_theta = vector.theta(_end, _myPoint);
    const _theta = math.acos(cos_theta); //θ
    const dotDistance = _theta * vector.vectorLength(_myPoint); //内積 -> 絶対値なので正負の判定を入れる必要がある

    //割合
    const vec_length = vector.distance(_begin, _end);
    const rate_vec_point = dotDistance / vec_length; //正しい
    const rate_from_edge = distanceFromEdge / vec_length;

    //初期値を設定
    let _point = this.state.points[index];
    _point.bool = {
      dot: _dotProduct < 0 ? false : true,
      cross: _crossProduct < 0 ? true : false
    };
    _point.rate = {
      dot: _dotProduct < 0 ? -rate_vec_point : rate_vec_point,
      cross: rate_from_edge
    };

    let _points = this.state.points;
    _points[index] = _.clone(_point);
    this.setState({
      points: _points
    });

    //編集モード
    if (this.props.editMode) {
      _point.assetId = this.state.assetId;
      this.props.editCallback(_point);
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

  //ポイントを追加
  addPoint(e) {
    var rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let _points = this.state.points;
    _points[0] = {
      vector: { x: x, y: y },
      rate: null
    };
    this.setState({
      points: _points
    });
    console.log("setpoint", _points);
  }

  //ポイントを追加（複数モード）
  addMultiPoints(e) {
    var rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let _points = this.state.points;
    _points.push({
      vector: { x: x, y: y },
      rate: null
    });
    this.setState({
      points: _points
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
          onClick={e => {
            if (this.props.multiPoints) {
              this.addMultiPoints(e);
            } else {
              this.addPoint(e);
            }
          }}
        />
      </div>
    );
  }
}
