export const setImage = ( canvas ,  pos , img ) => {
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, pos.x, pos.y);
}
export const setRotate = ( canvas , pos , rot , img ) => {
  const ctx = canvas.getContext("2d");
  ctx.save();
  const _rot = rot;
  // 回転の中心位置を計算（画像の中心を回転中心にする）
  const cx = pos.x + img.width/2;
  const cy = pos.y + img.height/2;
  // 画像を回転
  ctx.setTransform(
    Math.cos(_rot), 
    Math.sin(_rot), 
    -Math.sin(_rot), 
    Math.cos(_rot),
    cx-cx*Math.cos(_rot)+cy*Math.sin(_rot),
    cy-cx*Math.sin(_rot)-cy*Math.cos(_rot)
  );
  ctx.drawImage(img, pos.x, pos.y);
  ctx.restore();
}