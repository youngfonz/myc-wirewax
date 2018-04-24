'use strict';

import React from 'react';

import util from '../util.js';

import PureComponent from './pure_component.js';

export default class Input extends PureComponent {
  constructor(props,context) {
    super(props,context);

    this._onClick = this._onClick.bind(this);
  }
  static propTypes = {
    onClick: React.PropTypes.func,
  };
  static defaultProps = {
    text: "Button Text",
    onClick: function() {},
    disabled: false,
  };

  _onClick(e) {
    util.stopAll(e);
    if (!this.props.disabled) {
      this.props.onClick(e);
    }
  }

  render() {
    const { text, disabled, className } = this.props;

    let cls = 'button';
    if (disabled) {
      cls += ' disabled';
    }
    if (className) {
      cls += " " + className;
    }

    return (
      <div className={cls} onClick={this._onClick}>
        <div className='button-text'>{text}</div>
      </div>
    );
  }
}

