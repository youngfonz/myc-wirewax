'use strict';

import React from 'react';
import PureComponent from './components/pure_component.js';

import ContentStore from './stores/content_store.js';

require('../css/splash.less');

export default class Splash extends PureComponent {
  constructor(props,context) {
    super(props,context);
    this._videoClick = this._videoClick.bind(this);
  }
  _videoClick() {
    const { video } = this.refs;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  render() {
    let video = null;
    if (IS_IPAD) {
      video = <div className='splash-video-image-placeholder' />;
    } else {
      video = (
        <video
          ref="video"
          autoPlay
          loop
          src={ContentStore.getResourceUrl('splash_web_video')}
        />
      );
    }

    const content = (
      <div className="splash-container">
        <div className="splash-video-container">
          {video}
          <div className="cover" onClick={this._videoClick}/>
        </div>
        {this.props.children}
      </div>
    );
    return content;
  }
}
