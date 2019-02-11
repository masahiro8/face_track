import * as _ from 'lodash';
import * as THREE from 'three';

class LoaderType {
  constructor(type, url) {
    this.complete = false;
    this.url = _.flatten(url);
    this.get = [];
    this.type = type;
    this.callback = undefined;
    this.loader = undefined;
    this.Progress = null;
    this.Error = null;

    this.loaderCheck();
  }

  setCallback(callback) {
    this.callback = callback;
  }

  loaderCheck() {
    if (this.type == 'material') {
      this.loader = new THREE.MTLLoader();
    } else if (this.type == 'texture') {
      this.loader = new THREE.TextureLoader();
    } else if (this.type == 'object') {
      this.loader = new THREE.OBJLoader();
    }
  }

  getTexture(textures, tex_name) {
    for (let i in textures) {
      if (tex_name === textures[i].__name__) {
        return textures[i];
      }
    }
  }

  setTexture(material, texs, info) {
    if (_.isArray(material)) {
      _.each(material, mat => {
        let tex = this.getTexture(texs, info[mat.name]);

        if (tex) mat.map = tex;
      });
    } else if (_.isObject(material)) {
      let tex = this.getTexture(texs, info[material.name]);

      if (tex) material.map = tex;
    }
  }

  OBJLoad(materials, textures, info) {
    if (!this.type == 'object') {
      return false;
    }

    if (materials[0]) this.loader.setMaterials(materials[0]);
    for (let index in this.url) {
      this.loader.load(
        this.url[index],
        obj => {
          obj.traverse(child => {
            if (child instanceof THREE.Mesh) {
              console.log('Load確認', child);

              this.setTexture(child.material, textures, info);

              child.rotation.set(0, 90, 0);
              this.get.push(child);
            }
          });
          this.callback(obj);
        },
        progress => {
          if (this.Progress) {
            this.Progress(progress);
          }
        },
        error => {
          if (this.Error) {
            this.Error(error);
            alert('loadに失敗しました。');
          }
        }
      );
    }
  }

  load() {
    if (this.complete) {
      return {};
    }
    this.loader.crossOrigin = '*';
    for (let index in this.url) {
      if (_.isEmpty(this.url[index])) {
        this.complete = true;
        this.callback();
      }
      this.loader.load(
        this.url[index],
        ele => {
          ele.__name__ = decodeURIComponent(this.url[index]).match(
            '.+/(.+?)(_\\w)?.[a-z]+([?#;].*)?$'
          )[1];
          this.get.push(ele);

          if (this.get.length == this.url.length) {
            this.complete = true;
            this.callback();
          }
        },
        progress => {
          if (this.Progress) {
            this.Progress(progress);
          }
        },
        error => {
          if (this.Error) {
            this.Error(error);
            alert('loadに失敗しました。');
          }
        }
      );
    }
  }
}

export default class Loader {
  constructor(sceneMg) {
    this.sceneMg = sceneMg;

    this.mtl_loader = null;
    this.tex_loader = null;
    this.obj_loader = null;

    this.mtl_info = {}; // mtlとtexの関係を保持
  }

  load(url, callback) {
    this.mtl_loader = new LoaderType(
      'material',
      url.material ? [url.material] : ['']
    );
    this.tex_loader = new LoaderType(
      'texture',
      url.texture ? [url.texture] : ['']
    );
    this.obj_loader = new LoaderType('object', url.model ? [url.model] : ['']);

    this.mtl_loader.setCallback(() => {
      this.Complete();
      _.each(this.mtl_loader.get, mt => {
        mt.preload();
        let list = mt.materialsInfo;
        for (let i in list) {
          if (list[i].map_kd) {
            this.mtl_info[i] = list[i].map_kd.replace(/\..*/, '');
          }
        }
      });
      console.log('MTLのロード完了');
    });

    this.tex_loader.setCallback(() => {
      if (this.tex_loader.complete) {
        this.mtl_loader.load();
        console.log('TEXのロード完了');
      }
    });

    let obj_callback = obj => {
      this.sceneMg.addScene(obj);
      _.each(this.obj_loader.get, child => {
        callback(child);
      });
      console.log('OBJのロード完了');
    };

    this.obj_loader.setCallback(obj_callback.bind(this));
    this.tex_loader.load();
  }

  Complete() {
    if (this.mtl_loader.complete && this.tex_loader.complete) {
      this.obj_loader.OBJLoad(
        this.mtl_loader.get,
        this.tex_loader.get,
        this.mtl_info
      );
    }
  }

  get(type = null) {
    if (type == 'model') {
      return this.obj_loader.get || null;
    } else if (type == 'material') {
      return this.mtl_loader.get || null;
    } else if (type == 'texture') {
      return this.tex_loader.get || null;
    }

    return null;
  }

  ChengeScene(sceneMg) {
    this.sceneMg = sceneMg;
  }
}
