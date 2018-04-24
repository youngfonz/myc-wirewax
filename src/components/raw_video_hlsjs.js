'use strict';

import React from 'react';
import Hls from 'hls.js';

import PureComponent from './pure_component.js';

export default class RawVideoHLSJS extends PureComponent {
  constructor(props,context) {
    super(props,context);
    this.hls = false;
  }
  static propTypes = {
    src: React.PropTypes.string.isRequired,
  };
  componentDidMount() {
    this._loadVideo(this.props.src);
  }
  componentWillUnmount() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = false;
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
  _loadVideo(src) {
    if (this.hls) {
      this.hls.destroy();
      this.hls = false;
    }
    this.hls = new Hls();
    this.hls.attachMedia(this.refs.video);
    this.hls.loadSource(src);
  }

  getVideo() {
    return this.refs && this.refs.video;
  }

  render() {
    const { src, ...other_props } = this.props;
    return (
      <video
        ref="video"
        {...other_props}
      />
    );
  }
}
