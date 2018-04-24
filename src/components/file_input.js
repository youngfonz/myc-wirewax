'use strict';

import React from 'react';

import PureComponent from './pure_component.js';

export default class FileInput extends PureComponent {
  constructor(props,context) {
    super(props,context);
    this.state = {
      filename: false,
    };
    this._onChange = this._onChange.bind(this);
  }
  static propTypes = {
    onChange: React.PropTypes.func,
  };
  static defaultProps = {
    onChange: function() {},
  };

  _getFilename() {
    let filename = false;
    const { value } = this.refs.input;
    if (value) {
      const match = value.match(/[^/\\]*$/);
      if (match && match.length > 0 && match[0]) {
        filename = match[0];
      }
    }
    return filename;
  }

  _onChange(event) {
    const filename = this._getFilename();
    this.setState({ filename });
    this.props.onChange(filename);
  }
  clearFile() {
    const { input } = this.refs;
    input.value = null;
    this.setState({ filename: false });
    this.props.onChange(false);
  }
  hasFile() {
    const filename = this._getFilename();
    return !!filename;
  }
  getFile() {
    let file = false;
    const { input } = this.refs;
    if ( input && input.files && input.files.length > 0) {
      file = input.files[0];
    }
    return file;
  }

  render() {
    const { filename } = this.state;

    return (
      <label className='file-input'>
        <input
          ref="input"
          type="file"
          {...this.props}
          onChange={this._onChange}
        />
        <div className='button'>
          <div className='button-text'>Choose File</div>
        </div>
        <div className='filename'>{filename || "None Selected"}</div>
      </label>
    );
  }
}
