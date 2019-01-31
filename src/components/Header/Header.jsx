import React, { Component } from "react";
import * as _ from "lodash";
import styles from "./Header.scss";
import { icons } from "../../icon/Icons";

export const Header = props => {
  return (
    <div className={styles["Header"]}>
      <ul>
        {_.map(props.menu, val => {
          return (
            <HeaderItem
              id={val.id}
              icon={icons[val.icon]}
              label={val.label}
              callback={val.callback}
              show={val.show}
            />
          );
        })}
      </ul>
    </div>
  );
};

export const HeaderItem = props => {
  const classname = () => {
    return props.show ? styles["HeaderItem"] + " show" : styles["HeaderItem"];
  };
  return (
    <li
      className={classname()}
      onClick={e => {
        props.callback(e, props.id);
      }}
    >
      {props.children}
      <img className="icon" src={props.icon} alt={props.label} />
      <p className="label">{props.label}</p>
    </li>
  );
};
