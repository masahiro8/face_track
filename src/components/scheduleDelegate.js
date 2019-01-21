import * as _ from 'lodash';
export class scheduleDelegate {
  constructor(){
    this.isPlay = false;

    this.time_total = null;
    this.time_start =  null;
    this.time_interval = null;
    this.time_current = null;
    this.time_prev = null;

    this.delegate = [];
    this.init();
  }

  init(){
    //console.log("init schedule delegate");
  }

  update () {
    if( this.isPlay ) {
      //ここに実装
      this.setCurrent();
      this.checkCallback(this.time_total);
      // console.log("total = ", this.time_total/1000);
    }
    window.requestAnimationFrame(this.update.bind(this));
  }

  checkCallback(time) {
    if(  !this.delegate.length ) return;
    //コールバックを取り出す
    let delegate = _.filter( this.delegate , ( value )=>{
      return value.time == Math.floor(time/1000);
    });
    //コールバックを削除する
    this.delegate = _.reject( this.delegate , ( value )=>{
      return value.time == Math.floor(time/1000);
    });
    _.each ( delegate  , d =>{
      d.callback();
    })
  }

  start () {
    this.time_total = 0;
    this.restart();
    this.update();
  }

  restart () {
    this.time_start = new Date().getTime();
    this.time_current = new Date().getTime();
    this.time_prev = new Date().getTime();
    this.time_interval = 0;
    this.isPlay = true;
  }

  pause () {
    this.isPlay = false;
  }

  /**
   * 時間の更新
   */
  setCurrent() {
    const _current =  new Date().getTime();
    this.time_current = _current - this.time_start;
    this.time_interval = _current  - this.time_prev;
    this.time_total += this.time_interval;
    this.time_prev = _current;
  }

  setCallback(  value  ) {
    this.delegate.push({
      time : value.time,
      callback : value.callback,
    })
  }
}