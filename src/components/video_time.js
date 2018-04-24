'use strict';

import React from 'react';
import util from '../util.js';

export default class VideoTime extends React.Component {
  constructor(props,context) {
    super(props,context);
    this.state = {
      currentTime: 0,
    };
  }
  static propTypes = {
    video: React.PropTypes.object.isRequired,
  };
  shouldComponentUpdate(nextProps,nextState) {
    const { props, state } = this;
    const diff = (
      state.currentTime != nextState.currentTime
      || props.video.duration_seconds != nextProps.video.duration_seconds
    );
    return diff;
  }

  updateState({ currentTime }) {
    this.setState({ currentTime: Math.floor(currentTime) });
  }

  render() {
    const { video } = this.props;
    const duration_seconds = Math.floor(video.duration_seconds);
    let { currentTime } = this.state;

    let content = null;
    if (duration_seconds) {

      if (currentTime >= duration_seconds) {
        currentTime = duration_seconds;
      }
      const current = time_to_string(currentTime);
      const total = time_to_string(duration_seconds);

      content = (
        <div className='video-time'>
          <div className='current-time'>{current}</div>
        </div>
      );
    }
    return content;
  }
}

function time_to_string(time) {
  const mins = Math.floor(time/60);
  const secs = Math.round(time - mins*60);
  return util.pad(mins) + ":" + util.pad(secs);
}
