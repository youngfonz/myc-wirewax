'use strict';

import React from 'react';
import PureComponent from './pure_component.js';

import VideoRecorderStore from '../stores/video_recorder_store.js';

export default class LocalVideoFeed extends PureComponent {
  static propTypes = {
    onLoaded: React.PropTypes.func,
  }
  static defaultProps = {
    onLoaded: function() { },
  }

  constructor(props, context) {
    super(props, context);
    this._video_element = null;
    this._localStreamRetrieved = this._localStreamRetrieved.bind(this);
  }
  componentDidMount() {
    VideoRecorderStore.addChangeListener(this._localStreamRetrieved);
    VideoRecorderStore.startLocalStream();
  }
  componentWillUnmount() {
    VideoRecorderStore.removeChangeListener(this._localStreamRetrieved);
    VideoRecorderStore.stopLocalStream();
  }

  _localStreamRetrieved(tag) {
    VideoRecorderStore.attachStream(this._video_element);
  }

  render() {
    return (
      <video
        ref={(c) => this._video_element = c}
        autoPlay={ true }
        muted={ true }
        onLoadedData={ this.props.onLoaded }
        >
      </video>
    );
  }
}
