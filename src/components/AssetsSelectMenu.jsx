import React, { Component } from "react";
import * as _ from 'lodash';
import AssetLoader from './AssetLoader';
import {aniSprite} from './ani';

export default class AssetsSelectMenu extends Component {

  constructor(props) {
    super(props);
  }

  GetMenu( anies ){
    return _.map( anies , ani =>{
      return  (
        <AssetButton
          id = { ani.id }
          src = {ani.sprite.value.src[0]}
          callback = {(id )=>{ this.props.callback(id)}}
        />
      )
    });
  }

  render(){
    const show = () =>{
      return this.props.editMode?{display:'block'}:{display:'none'};
    }
    return(
      <AssetLoader
        assets = {this.props.assets}
        progress = {( progress )=>{}}
        done  = {()=>{}}
        view = {( anies ) => {  
          return(
            <div style = {show()}>
              { this.GetMenu( anies )}
            </div>
          );
        }}
      ></AssetLoader>
    )
  }
}

const AssetButton = ({ id , src , callback }) =>{
  return(
    <div 
      style={{width:"64px"}}
      onClick={(e)=>{ callback(id) }}>
      <img 
        style={{width:'inherit'}}
        src={src} />
    </div>
  )
}