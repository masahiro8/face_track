import * as _ from 'lodash';
import math from 'mathjs';
import * as vector from './vector';

/**
 * グローバル座標から2点間の位置割合に変換
 * @param {object} myPoint
 * @param {object} begin
 * @param {oebject} end
 */
export const initPointRate = (myPoint, begin, end) => {
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
  let point = {};
  point.bool = {
    dot: _dotProduct < 0 ? false : true,
    cross: _crossProduct < 0 ? true : false
  };
  point.rate = {
    dot: _dotProduct < 0 ? -rate_vec_point : rate_vec_point,
    cross: rate_from_edge
  };
  return point;
};
