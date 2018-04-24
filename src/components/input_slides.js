'use strict';

import React from 'react';
import _ from 'lodash';

import util from '../util.js';

import PureComponent from './pure_component.js';
import FileInput from './file_input.js';
import Button from './button.js';

import ResourceStore from '../stores/resource_store.js';

export default class InputVideo extends PureComponent {
  constructor(props,context) {
    super(props,context);
    this.state = {
      filename: false,
      is_removed: false,
    };

    this._onFileChange = this._onFileChange.bind(this);
    this._onRemoveClick = this._onRemoveClick.bind(this);
  }

  _onFileChange(filename) {
    if (this.refs.file) {
      const file = this.refs.file.getFile();
      if (file && file.type) {
        if (file.type != 'application/pdf') {
          window.alert('For slides, please upload a PDF.');
          this.refs.file.clearFile();
          filename = false;
        }
      } else {
        filename = false;
      }
    } else {
      filename = false;
    }
    this.setState({ filename, is_removed: false });
  }
  _onRemoveClick() {
    this.refs.file.clearFile();
    this.setState({ is_removed: true, filename: false });
  }

  getFile() {
    return this.refs.file && this.refs.file.getFile();
  }
  isRemoved() {
    return this.state.is_removed;
  }

  render() {
    const { video }  = this.props;
    const { filename, is_removed } = this.state;

    let slide_img_url = false;
    if (video && video.slide_list && video.slide_list.length > 0) {
      const slide = video.slide_list[0];
      slide_img_url = ResourceStore.getImageURL(slide.media_list, { width: 200, height: 200 });
    }

    let preview = null;
    let action = "";
    if (slide_img_url && is_removed) {
      preview = <div className='removed-image' />;
      action = "Add File";
    } else if (filename) {
      preview = (
        <div className='slide-preview'>
          {filename}
        </div>
      );
      action = "Change File";
    } else if (slide_img_url) {
      preview = (
        <div
          className='image-preview'
          style={{ backgroundImage: "url(" + slide_img_url + ")" }}
        />
      );
      action = "Replace File";
    } else {
      preview = (
        <div className='placeholder-image' />
      );
      action = "Add File";
    }
    let remove_button = null;
    if ((slide_img_url || filename) && !is_removed) {
      remove_button = (
        <div className='remove-button' onClick={this._onRemoveClick}>
          Remove
        </div>
      );
    }

    return (
      <div className='input-slides'>
        {preview}
        <div className='image-button'>
          <div className='text'>{action}</div>
          <FileInput ref='file' onChange={this._onFileChange} />
        </div>
        {remove_button}
      </div>
    );
  }
}

