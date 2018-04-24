'use strict';

import React from 'react';

import util from '../util.js';

import PureComponent from './pure_component.js';

export default class Input extends PureComponent {
  constructor(props,context) {
    super(props,context);
    this._onChange = this._onChange.bind(this);
  }
  static propTypes = {
    onTextChange: React.PropTypes.func,
    onChange: React.PropTypes.func,
  };
  static defaultProps = {
    onTextChange: function() {},
    onChange: function() {},
  };

  _onChange(event) {
    const { value } = event.target;
    if (value != this.props.value) {
      this.props.onTextChange(value,event);
    }
    this.props.onChange(event);
  }
  focus() {
    this.refs.input.focus();
  }

  render() {
    const { type, onChange, onClick, ...extra } = this.props;

    return (
      <input
        ref="input"
        type={type || "text"}
        onClick={util.stopAll}
        onChange={this._onChange}
        {...extra}
      />
    );
  }
}

