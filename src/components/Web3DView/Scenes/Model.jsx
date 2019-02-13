import React, { Component } from 'react';
import { Scene, ObjLoader } from './Scene';
import { location } from '../../../config';

const model_url = {
  mtl: `${location}/3dmodels/chest/mj_chest01.mtl`,
  obj: `${location}/3dmodels/chest/mj_chest01.obj`,
  tex: `${location}/3dmodels/chest/img_o_mj_chest01.png`
};

export class Glasses extends Component {
  render() {
    return (
      <div>
        <ObjLoader
          model={model_url}
          loaded={model => {
            // console.log('model  ', model);
            return <Scene {...this.props} model={model} />;
          }}
        />
      </div>
    );
  }
}
