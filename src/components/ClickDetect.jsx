import React, { Component } from "react";
import * as _ from 'lodash';
import math from 'mathjs';
import { VIDEO_SIZE } from '../config';
import * as vector from '../util/vector';
import {setPoint } from '../canvas.point';
import styles from './VideoCanvas.scss';

export class ClickDetect extends Component {

  constructor(props){
    super(props);
    this.state = {
      points : [],
    }
  }

  //ポイントを追加
  click (e) {
    var rect = this.props.canvas.getBoundingClientRect();
    // const x = (rect.width/2)+((rect.width/2) - (e.clientX - rect.left));
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let _points = this.state.points;
    _points.push({
      vector:{x:x,y:y},
      rate:null,
    });
    this.setState({
      points : _points
    });
    //console.log("points " , _points );
  }

  render(){
    return(
      <div 
        className={styles['overlayClickable']}
        onClick = {(e)=>{
          this.click(e);
        }}
      >
        { this.props.children }
      </div>
    )
  }
}