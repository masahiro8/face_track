import * as vector from './vector.js';

const Ry = 50 / 0.5; //y軸の最大回転角度 / 最大割合
const Rx = 30 / 0.5; //x軸の最大回転角度 / 最大割合

export const z = (begin, end) => {
  //原点をbeginとして補正
  const _begin = { x: 0, y: 0 };
  const _end = vector.shiftBase(begin, end);
  //なす角
  const _crossProduct = vector.crossProduct(_end, { x: 100, y: 0 });
  let radian = Math.acos(vector.tilt(_end));
  let deg = radian * (180 / Math.PI);
  return _crossProduct < 0 ? radian : -deg * (Math.PI / 180);
};

export const y = (begin, end, center) => {
  //原点をbeginとして補正
  const _begin = { x: 0, y: 0 };
  const _end = vector.shiftBase(begin, end);
  const _center = vector.shiftBase(begin, center);

  //外積
  //begin-end線上の点までの距離
  const _crossProduct = vector.crossProduct(_end, _center);
  const distanceFromEdge = Math.abs(
    _crossProduct / vector.distance(_begin, _end)
  );

  //begin-centerベクトル量
  const _edgeOfBeginCenter = vector.distance(_begin, _center);

  //begin-end上の頂点（三平方の定理）
  const _edge = Math.sqrt(
    _edgeOfBeginCenter * _edgeOfBeginCenter -
      distanceFromEdge * distanceFromEdge
  );

  //begin-end間の距離
  const vec_length = vector.distance(_begin, _end);
  const rate = _edge / vec_length - 0.5;

  //角度に変換
  const r = rate * Ry;

  return `${r}`;
};

export const x = (begin, end, center) => {
  //原点をbeginとして補正
  const _begin = { x: 0, y: 0 };
  const _end = vector.shiftBase(begin, end);
  const _center = vector.shiftBase(begin, center);

  //外積
  //begin-end線上の点までの距離
  const _crossProduct = vector.crossProduct(_end, _center);
  const distanceFromEdge = Math.abs(
    _crossProduct / vector.distance(_begin, _end)
  );

  const vec_length = vector.distance(_begin, _end);
  const rate = distanceFromEdge / vec_length;

  const r = rate * 110;

  return r;
};

export const vec3 = (begin, end, center) => {
  //原点をbeginとして補正
  const _begin = { x: 0, y: 0 };
  const _end = vector.shiftBase(begin, end);
  const _center = vector.shiftBase(begin, center);

  //なす角
  //z
  const _crossProduct = vector.crossProduct(_end, { x: 100, y: 0 });
  let radian = Math.acos(vector.tilt(_end));
  let deg = radian * (180 / Math.PI);
  const z = _crossProduct < 0 ? -deg : deg;

  //外積
  //begin-end線上の点までの距離
  const _crossProduct2 = vector.crossProduct(_end, _center);
  const distanceFromEdge = Math.abs(
    _crossProduct2 / vector.distance(_begin, _end)
  );

  //begin-centerベクトル量
  const _edgeOfBeginCenter = vector.distance(_begin, _center);

  //begin-end上の頂点（三平方の定理）
  const _edge = Math.sqrt(
    _edgeOfBeginCenter * _edgeOfBeginCenter -
      distanceFromEdge * distanceFromEdge
  );

  //begin-end間の距離
  const vec_length = vector.distance(_begin, _end);
  const yrate = _edge / vec_length - 0.5;

  //角度に変換
  //y
  const y = yrate * Ry;

  //x
  const xrate = distanceFromEdge / vec_length;
  const x = xrate * 110;

  return {
    x: x,
    y: y,
    z: z
  };
};
