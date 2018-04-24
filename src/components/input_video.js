'use strict';

import React from 'react';
import _ from 'lodash';

import util from '../util.js';

import PureComponent from './pure_component.js';
import FileInput from './file_input.js';
import Button from './button.js';
import RawVideo from './raw_video.js';

export default class InputVideo extends PureComponent {
  constructor(props,context) {
    super(props,context);
    this.state = {
      preview_url: false,
    };

    this.release_list = [];
    this._onFileChange = this._onFileChange.bind(this);
  }
  componentWillUnmount() {
   _.each(this.release_list,(url) => {
      try {
        URL.revokeObjectURL(url);
      } catch(e) {
        console.error("InputVideo.componentWillUnmount: throw:",e.stack);
      }
    });
    this.release_list = [];
  }

  _onFileChange(filename) {
    if (this.refs.file) {
      const file = this.refs.file.getFile();
      const preview_url = URL.createObjectURL(file);

      this.release_list.push(preview_url);
      this.setState({ preview_url });
    }
  }

  getFile() {
    return this.refs.file && this.refs.file.getFile();
  }
  isRemoved() {
    return this.state.is_removed;
  }

  render() {
    const { video, onImageChange }  = this.props;
    const { preview_url } = this.state;

    let preview = null;
    let action = "";
    if (preview_url) {
      preview = (
        <div className='video-preview'>
          <video src={preview_url} paused={true} controls={true} preload="auto" />
        </div>
      );
      action = "Change File";
    } else if (video) {
      const cleaned_video = util.deepExtend(video);
      cleaned_video.video_stream_path = null;
      preview = (
        <div className='video-preview'>
          <RawVideo video={cleaned_video} paused={true} controls={true} preload="auto" />
        </div>
      );
      action = "Replace File";
    } else {
      preview = (
        <div className='placeholder-image' />
      );
      action = "Add File";
    }

    return (
      <div className='input-video'>
        {preview}
        <div className='image-button'>
          <div className='text'>{action}</div>
          <FileInput ref='file' onChange={this._onFileChange} />
        </div>
      </div>
    );
  }
}
