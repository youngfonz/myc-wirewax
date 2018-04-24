'use strict';

import React from 'react';
import PureComponent from './pure_component.js';

import util from '../util.js';

export default class RawVideoHTML5 extends PureComponent {
  static propTypes = {
    src: React.PropTypes.string.isRequired,
  };

  _loadVideo(src) {
    try {
      const { video } = this.refs;
      video.src = src;
      video.load();
    } catch(e) {
      console.error("RawVideoHTML5._loadVideo: set src err:",e);
    }
  }

  componentWillReceiveProps(new_props) {
    const { video } = this.refs;
    const {
      src: old_src,
    } = this.props;
    const {
      src,
    } = new_props;

    if (old_src != src) {
      this._loadVideo(src);
    }
  }

  getVideo() {
    return this.refs && this.refs.video;
  }

  render() {
    return (
      <video
        ref="video"
        {...this.props}
      />
    );
  }
}
