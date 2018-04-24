'use strict';

import React from 'react';
import _ from 'lodash';

import util from '../util.js';

import PureComponent from './pure_component.js';
import FileInput from './file_input.js';
import Button from './button.js';

export default class InputImage extends PureComponent {
  constructor(props,context) {
    super(props,context);
    this.state = {
      preview_url: false,
      is_removed: false,
    };

    this.release_list = [];
    this._onRemoveClick = this._onRemoveClick.bind(this);
    this._onImageChange = this._onImageChange.bind(this);
  }
  static defaultProps = {
    showRemove: false,
  };

  componentWillUnmount() {
   _.each(this.release_list,(url) => {
      try {
        URL.revokeObjectURL(url);
      } catch(e) {
        console.error("InputImage.componentWillUnmount: throw:",e.stack);
      }
    });
    this.release_list = [];
  }

  _onImageChange(filename) {
    if (this.refs.file) {
      const file = this.refs.file.getFile();
      if (file) {
        const preview_url = URL.createObjectURL(file);
        this.release_list.push(preview_url);
        this.setState({ is_removed: false, preview_url });
      } else {
        this.setState({ preview_url: false });
      }
    }
  }
  _onRemoveClick() {
    this.refs.file.clearFile();
    this.setState({ is_removed: true, preview_url: false });
  }

  getFile() {
    return this.refs.file && this.refs.file.getFile();
  }
  isRemoved() {
    return this.state.is_removed;
  }

  render() {
    const { image, showRemove }  = this.props;
    const { preview_url, is_removed } = this.state;

    let preview = null;
    let action = "";
    if (image && is_removed) {
      preview = <div className='removed-image'/>;
      action = "Add Image";
    } else if (preview_url) {
      preview = (
        <div
          className='image-preview'
          style={{ backgroundImage: "url(" + preview_url + ")" }}
        />
      );
      action = "Replace Image";
    } else if (image) {
      preview = (
        <div
          className='image-preview'
          style={{ backgroundImage: "url(" + image + ")" }}
        />
      );
      action = "Change Image";
    } else {
      preview = <div className='placeholder-image'/>;
      action = "Add Image";
    }

    let remove = null;
    if ((image || preview_url) && showRemove && !is_removed) {
      remove = (
        <div className='remove-button' onClick={this._onRemoveClick}>
          Remove
        </div>
      );
    }

    return (
      <div className='input-image'>
        {preview}
        <div className='image-button'>
          <div className='text'>{action}</div>
          <FileInput ref='file' onChange={this._onImageChange} />
        </div>
        {remove}
      </div>
    );
  }
}
