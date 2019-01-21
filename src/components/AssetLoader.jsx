import React, { Component } from "react";
import * as _ from 'lodash';
import { sigmoid } from "face-api.js";

export default class AssetLoader extends Component {
  constructor(props){
    super(props);
    this.state = {
      done:false,
      progress : 0,
      images : [],
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
        })
        if( this.props.assets.length == this.state.progress ) {
          this.props.setImages(this.state.images);
          this.setState({done:true});
        }
      }
      img.src = path;
    })
  }

  show () {
    if ( this.state.done ) {
      return (<div>{this.props.view()}</div>)
    }
    return null
  }

  render(){
    return(<React.Fragment>{this.show()}</React.Fragment>)
  }
}