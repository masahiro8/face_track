import * as _ from 'lodash';
import {scheduleDelegate} from "./scheduleDelegate";
import {Spline} from './spline';

class sprite {
  constructor(){

  }

  init ( image ) {
    this.local  = {
      pos :{x:0,y:0},
      rot : 0,
    }
    this.img = image;
  }

  getCtx () {
    return this.canvas.getContext("2d");
  }

  setCanvas ( canvas ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    return this;
  }

  transform ( pos , rot ) {
    this.move(pos).rotate(rot).emit();
  }

  move ( pos ) {
    this.local.pos = pos;
    return this;
  }

  rotate (  rot  ) {
    this.local.rot = rot;
    return this;
  }

  emit () {
    const ctx = this.getCtx();
    ctx.save();
    const _rot = this.local.rot;
    const _pos = this.local.pos;
    
    // 回転の中心位置を計算（画像の中心を回転中心にする）
    const cx = _pos.x + this.img.width/2;
    const cy = _pos.y + this.img.height/2;

    // 画像を回転
    ctx.setTransform(
      Math.cos(_rot), 
      Math.sin(_rot), 
      -Math.sin(_rot), 
      Math.cos(_rot),
      cx-cx*Math.cos(_rot)+cy*Math.sin(_rot),
      cy-cx*Math.sin(_rot)-cy*Math.cos(_rot)
    );
    ctx.drawImage(this.img, _pos.x, _pos.y);
    ctx.restore();
    return this;
  }
}

const base_fps = 60;

class animOptimize {
  /***
   * 基準 fps = 60
   * 1.再生時間から全フレーム数を算出
   * 2.1フレームあたりの移動量
   * 3.
   * 
   * { pos {x:0,y:0} time:0.0 }
   * { pos {x:0,y:60} time:2.0 }
   * 
   * 1. 60 * 2.0 = 120.0
   * 2. fps/120.0 = 移動量
   * 
   */

  constructor(){
    this.fps = 0;
    this.fps_prev  = new Date().getTime();
    this.update();
  }
  
  update () {
    window.requestAnimationFrame(this.update.bind(this));
    this.flatFps();
  }
   /**
   * fps平均化
   */
  flatFps  () {
    const _fps_current = new Date().getTime();
    const time = _fps_current - this.fps_prev;
    this.fps_prev = _fps_current;
    const FPS = (1000/time).toFixed(1);
    //console.log("fps " , FPS , time);
  }
}

const range = (min, max) => {
  const len  = max - min;
  const rand = Math.random() * len;
  return min + rand;
}


export class aniSprite extends sprite {

  constructor( value, image , scheduler){

    super(image);
    this.value = value;
    this.scheduler = scheduler;
    this.isPlay = true;

    this.frame  = 0;

    this.schedule = new scheduleDelegate();
    //this.ftpOptimizer = new animOptimize();

    this.init( image );
    this.makeFrames();
    this.makeSplineFrames();
    this.update();

  }

  update () {
    window.requestAnimationFrame(this.update.bind(this));
    this.playAnims();
  }

  playAnims () {
    if ( this.frame >= this.value.splineFrames.length )
    { this.frame = 0; } else 
    { this.frame++; }
  }

  makeSplineFrames ( ) {

    let  _anim =  this.value.anim;

    //回転
    const getValuePerFrame = ( current , next , frames , index )=>{
      return current + ((( next - current ) /frames ) * index ) ;
    }

    let rots = [];
    let rots_index = 0;
    _anim.map(( val , index  ) => {
      if( _anim[index+1] ) {
        const _time = _anim[index+1].time - _anim[index].time;
        const frames  = base_fps * _time;
        const _frames = Array.apply(null,new Array(frames));
        let list = _frames.map(( value  , n ) =>{
          const r = getValuePerFrame(_anim[index].rot , _anim[index+1].rot,frames,n);
          return { rot :Math.floor(r) };
        })
        rots = rots.concat(list);
      }
    })

    //位置の曲線変換
    let posx = [];
    let posy = [];
    _anim.map(( val ) =>{
      posx.push(val.pos.x);
      posy.push(val.pos.y);
    })
    const spx = new Spline();
    const spy = new Spline();
    spx.init(posx);
    spy.init(posy);

    this.value.splineFrames = [];
    let total_frames = 0;
    _anim.map(( val  ,index ) => {
      if( _anim[index+1] ) {
        const _time = _anim[index+1].time - _anim[index].time;
        const frames  = base_fps * _time;
        total_frames += frames;
      }
      index++;
    })
    
    const total_frames_array = Array.apply( null , Array(total_frames));
    let list = total_frames_array.map(( val , index  ) => {
      const m = ((_anim.length-1)/total_frames);
      const i = (m*index).toFixed(2);
      const x = spx.culc( i );
      const y = spy.culc( i );
      return { index :index , pos :{x:x,y:y} };
    });

    list.reverse();//回転変換を使う場合はフレーム順を変える

    this.value.splineFrames = list.map(( val  , index  ) =>{
      return { index :val.index ,pos:val.pos  ,rot:rots[index].rot};
    })
    console.log("this.value.splineFrames " ,this.value.splineFrames);
  }

  /**
   * フレーム数を確定
   * とりあえずposだけ
   */
  makeFrames () {
    const getValuePerFrame = ( current , next , frames , index )=>{
      return (( next - current ) /frames ) * index ;
    }

    this.value.frames = [];
    _.each( this.value.anim , ( val , index  ) => {
      if( this.value.anim[index+1] ) {
        const _time = this.value.anim[index+1].time - this.value.anim[index].time;
        const frames  = base_fps * _time;
        const _frames = new Array(frames);
        let list = _.map( _frames , ( value , n ) =>{
          const x = getValuePerFrame(this.value.anim[index].pos.x , this.value.anim[index+1].pos.x,frames,n);
          const y = getValuePerFrame(this.value.anim[index].pos.y ,this.value.anim[index+1].pos.y,frames,n);
          return { index :n , pos :{x:x,y:y} };
        })
        this.value.frames = this.value.frames.concat(list);
      }else {
        this.value.frames.push({index:1 , pos:this.value.anim[index].pos });
      }
    })
  }

  transform ( pos , tilt , deg ) {

    let _pos = pos;
    let _tilt = tilt;

    if( this.isPlay ) {
      _pos = this.localMove(pos , deg);
      _tilt = this.localRotate(tilt );  
    }
    
    this.move(_pos).rotate(_tilt).emit();
  }

  /**
   * ローカル座標
   * @param {*} pos 
   * @param {int} index
   */
  localMove ( pos , theta) {
    if( 
      !_.has(this.value,"frames") || 
      !this.value.splineFrames[this.frame]
    ) return  pos;

    const fpos = this.value.splineFrames[this.frame].pos;
    //回転行列 > 左右反転してしまう
    const _pos_x =  (Math.cos(theta)* fpos.x) + (Math.sin(theta)* fpos.y );
    const _pos_y =  (-1 * Math.sin(theta)* fpos.x) + (Math.cos(theta)* fpos.y );

    const _pos = {
      x : pos.x + _pos_x,
      y : pos.y + _pos_y
    }
    return _pos;
  }

  /**
   * ローカル座標
   * @param {*} rot 
   * @param {int} index
   */
  localRotate ( rot ,  n  = 0) {
    if( !_.has(
      this.value,"anim") || 
      this.value.splineFrames[this.frame]
    ) return  rot;
    return rot + this.value.splineFrames[n].rot;
  }
}

class ani {

  constructor(){
  
  }
}

const instance =  new ani();
export default instance;