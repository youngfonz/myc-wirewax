'use strict';

import React from 'react';

import util from '../util.js';

import PureComponent from './pure_component.js';

export default class InputCheckbox extends PureComponent {
  constructor(props,context) {
    super(props,context);
    this._onChange = this._onChange.bind(this);
  }
  static propTypes = {
    onChange: React.PropTypes.func,
  };
  static defaultProps = {
    onChange: function() {},
  };

  _onChange(event) {
    const { checked } = event.target;
    this.props.onChange(checked,event);
  }

  render() {
    const { type, onChange, value, label, checked, ...extra } = this.props;

    return (
      <label className='input-checkbox'>
        <input
          ref='input'
          type='checkbox'
          onChange={this._onChange}
          checked={value}
          {...extra}
        />
        <span className='checkbox-label'>{label}</span>
      </label>
    );
  }
}

