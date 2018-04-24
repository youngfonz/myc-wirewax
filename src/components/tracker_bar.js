'use strict';

import React from 'react';

import util from '../util.js';

export default class TrackerBar extends React.Component {
  constructor(props,context) {
    super(props,context);
    this.state = {
      currentTime: 0,
      bufferedTime: 0,
    };
    this._trackerClick = this._trackerClick.bind(this);
  }
  static defaultProps = {
    onSeek: function() {},
  };
  static propTypes = {
    onSeek: React.PropTypes.func,
    video: React.PropTypes.object.isRequired,
  };
  shouldComponentUpdate(nextProps,nextState) {
    const { props, state } = this;
    const diff = (
      state.currentTime != nextState.currentTime
      || state.bufferedTime != nextState.bufferedTime
      || props.video.duration_seconds != nextProps.video.duration_seconds
    );
    return diff;
  }

  updateState({ currentTime, bufferedTime }) {
    this.setState({ currentTime, bufferedTime });
  }
  _trackerClick(e) {
    const { video } = this.props;
    const { clientX, screenX, nativeEvent } = e;
    const { offsetX } = nativeEvent;
    const { tracker } = this.refs;
    const trackerWidth = tracker.clientWidth;
    const ratio = offsetX/trackerWidth;
    const time = video.duration_seconds * ratio;
    this.props.onSeek(time);
  }

  render() {
    const { video } = this.props;
    const { currentTime, bufferedTime } = this.state;

    let content = null;
    let progress = null;
    let buffered = null;
    if (video.duration_seconds) {
      if (currentTime >= 0) {
        const progress_percent = currentTime / video.duration_seconds * 100;
        const progress_style = { width: progress_percent + "%" };
        progress = <div className='progress' style={progress_style} />;
      }
      if (bufferedTime >= 0) {
        const buffered_percent = bufferedTime / video.duration_seconds * 100;
        const buffered_style = { width: buffered_percent + "%"};
        buffered = <div className='buffered' style={buffered_style} />;
      }
      if (progress || buffered) {
        content = (
          <div
            ref="tracker"
            className='tracker-bar'
            onClick={this._trackerClick.bind(this)}
          >
            <div className='inner'>
              {buffered}
              {progress}
            </div>
          </div>
        );
      }
    }
    return content;
  }
}
