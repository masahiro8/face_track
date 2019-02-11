import React, { Component } from 'react';
import { Scene, ObjLoader } from './Scene';

export class Glasses extends Component {
  render() {
    return (
      <div>
        <Scene {...this.props} />
        <ObjLoader />
      </div>
    );
  }
}
