'use strict';

import React from 'react';
import PureComponent from './pure_component.js';

import util from '../util.js';

export default class RawVideoMediaElement extends PureComponent {
  constructor(props,context) {
    super(props,context);

    this.media = false;
    this.media_element = false;
  }
  static propTypes = {
    src: React.PropTypes.string.isRequired,
  };
  componentDidMount() {
    const v = this.refs.container.children[0];
    this.media_element = new MediaElement(v,{
      success: (media) => {
        this.media = media;
        this._loadVideo(this.props.src);
      },
      error: () => {
        console.error("RawVideoMediaElement: ME error:",arguments);
      },
    });
  }
  componentWillReceiveProps(newProps) {
    const {
      src: old_src,
    } = this.props;
    const {
      src,
    } = newProps;

    if (src != old_src) {
      this._loadVideo(src);
    }
  }
  _loadVideo(src) {
    this.media && this.media.setSrc(src);
  }

  _rawMarkup(src) {
    const html =
"<video>"
+ "<source type='application/x-mpegURL' src='https://media11.cdn.myc-dev.com/mediaelement.m3u8'/>"
+ "</video>";
    return {
      __html: html,
    };
  }

  render() {
    const { src } = this.props;
    const content = (
      <div
        ref="container"
        className='raw-video-media-element-container'
        dangerouslySetInnerHTML={this._rawMarkup(src)}
      />
    );
    return content;
  }
}

