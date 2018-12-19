export const setPoint = ( canvas , pos ) =>{
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0ff";
  ctx.fillRect(canvas.width-pos.x,pos.y,2,2);
}