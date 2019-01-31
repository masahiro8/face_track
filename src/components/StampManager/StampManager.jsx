import React, { Component } from "react";
import * as _ from "lodash";
import { aniSprite } from "../ani";
import { load } from "@tensorflow-models/posenet";
import styles from "./StampManager.scss";
import { icons } from "../../icon/Icons";

/***
 * アセットと座標を保存する
 */

export default class StampManager extends Component {
  constructor(props) {
    super(props);

    this.state = {
      data: []
    };
    this.assets = props.assets; //元のデータ
    this.callback = {
      save: this.saveAsset.bind(this),
      load: this.loadAsset.bind(this),
      delete: this.deleteAsset.bind(this)
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      JSON.stringify(nextProps.assets) !== JSON.stringify(this.props.assets)
    ) {
      this.assets = nextProps.assets;
    }
  }

  saveAsset() {
    let _asset = _.filter(this.assets, val => {
      return val.id == this.props.currentAsset.assetId;
    });
    let newData = _.clone(this.props.currentAsset);
    newData.id = parseInt(_.uniqueId());
    newData.src = _asset[0].src[0];

    let data = _.clone(this.state.data);
    data.push(newData);
    this.setState({ data });

    //TODO クラウドに保存
  }

  loadAsset(id) {
    let filtered = _.filter(this.state.data, val => {
      return val.id === id;
    });
    let data = _.clone(filtered[0]);
    delete data.src;
    delete data.id;
    this.props.callback(data);
  }

  deleteAsset(id) {
    let filtered = _.filter(this.state.data, val => {
      return val.id !== id;
    });
    this.setState({
      data: filtered
    });
  }

  getAssets() {
    return _.map(this.state.data, (asset, index) => {
      return (
        <AssetButton
          key={asset.id}
          id={asset.id}
          src={asset.src}
          callback={this.callback}
        />
      );
    });
  }

  render() {
    const classname = () => {
      return this.props.show ? styles["List"] + " show" : styles["List"];
    };
    return (
      <div className={classname()}>
        <div className={styles["Save"]}>
          <button
            onClick={e => {
              this.saveAsset();
            }}
          >
            <img src={icons.save} />
            <p className="label">保存</p>
          </button>
        </div>
        {this.getAssets()}
      </div>
    );
  }
}

const AssetButton = ({ id, src, callback }) => {
  return (
    <div className={styles["ListItem"]}>
      <img src={src} />
      <div className="navi">
        <button
          onClick={() => {
            callback.load(id);
          }}
        >
          <img src={icons.play} />
          <div className="label">load</div>
        </button>
        <button
          onClick={() => {
            callback.delete(id);
          }}
        >
          <img src={icons.del} />
          <div className="label">delete</div>
        </button>
      </div>
    </div>
  );
};
