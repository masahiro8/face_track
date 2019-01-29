import React, { Component } from "react";
import * as _ from 'lodash';
import { sigmoid } from "face-api.js";
import {aniSprite} from './ani';

export default class AssetLoader extends Component {
  constructor(props){
    super(props);
    this.state = {
      done:false,
      progress : 0,
      images : [],
      anies : [],
    }
    _.map( props.assets , asset =>{
      this.loadImage(asset);
    })
  }

  loadImage( asset ){
    _.each ( asset.src , path => {
      let img = new Image();
      img.onload = ( image ) =>{
        let images = this.state.images;
        images.push({
          id:asset.id,
          image:img,
        });
        this.setState({
          progress : this.state.progress+1,
          images:images,
        });
        
        this.props.progress({
          result : this.state.progress ,
          total : this.props.assets.length
        });

        if( this.props.assets.length === this.state.progress ) {

          let anies = _.map( this.state.images , image =>{
            const value = _.filter( this.props.assets , asset =>{return asset.id===image.id });
            return {
              id:image.id,
              sprite:new aniSprite( value[0] , image.image , this.schedule )
            };
          });

          this.setState({
            done:true,
            anies:anies,
          });

          this.props.done();
        }
      }
      img.src = path;
    })
  }

  show () {
    if ( this.state.done ) {
      return (<div>{this.props.view(this.state.anies)}</div>)
    }
    return null
  }

  render(){
    return(<React.Fragment>{this.show()}</React.Fragment>)
  }
}