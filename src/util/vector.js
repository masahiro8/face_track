//原点補正
export const shiftBase = (b, p) => {
  return { x: (p.x - b.x).toFixed(2), y: (p.y - b.y).toFixed(2) };
};
//ベクトル長さ
export const vectorLength = p => {
  return Math.sqrt(p.x * p.x + p.y * p.y);
  //return Math.pow( ( v.x * v.x ) + ( v.y * v.y ), 0.5 );
};
//内積
export const dotProduct = (a, b) => {
  return a.x * b.x + a.y * b.y;
};

//外積
export const crossProduct = (p, v) => {
  return p.x * v.y - v.x * p.y;
};

//ベクトルのなす角(ラジアン)
export const theta = (a, b) => {
  const _a = vectorLength(a);
  const _b = vectorLength(b);
  return Math.cos(dotProduct(a, b) / (_a * _b));
};

//ベクトル座標 座標,ベクトル
export const vecPos = (p, v) => {
  return { x: p.x / v, y: p.y * v };
};
//２点間の距離
export const distance = (p1, p2) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

//原点(0,0)からx軸の傾き
export const tilt = p => {
  return p.x / vectorLength(p);
};
