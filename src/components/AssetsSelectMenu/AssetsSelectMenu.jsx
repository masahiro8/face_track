import React, { Component } from "react";
import * as _ from "lodash";
import AssetLoader from "../AssetLoader";
import { aniSprite } from "../ani";
import styles from "./AssetsSelectMenu.scss";

export default class AssetsSelectMenu extends Component {
  constructor(props) {
    super(props);
  }

  GetMenu(anies) {
    return _.map(anies, ani => {
      return (
        <AssetButton
          id={ani.id}
          src={ani.sprite.value.src[0]}
          callback={id => {
            this.props.callback(id);
          }}
        />
      );
    });
  }

  render() {
    const classname = () => {
      return this.props.show ? styles["List"] + " show" : styles["List"];
    };
    return (
      <AssetLoader
        assets={this.props.assets}
        progress={progress => {}}
        done={() => {}}
        view={anies => {
          return <div className={classname()}>{this.GetMenu(anies)}</div>;
        }}
      />
    );
  }
}

const AssetButton = ({ id, src, callback }) => {
  return (
    <div
      className={styles["ListItem"]}
      onClick={e => {
        callback(id);
      }}
    >
      <img src={src} />
    </div>
  );
};
