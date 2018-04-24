'use strict';

import React from 'react';
import PureComponent from './pure_component.js';
import ContentStore from '../stores/content_store.js';
import VideoConferenceStore from '../stores/video_conference_store.js';

export default class ConferenceFeed extends PureComponent {
  static propTypes = {
    peerID: React.PropTypes.string,
    muted: React.PropTypes.bool,
    autoPlay: React.PropTypes.bool,
    onReady: React.PropTypes.func,
    audioState: React.PropTypes.bool,
    videoState: React.PropTypes.bool,
  };

  static defaultProps = {
    peerID: null,
    autoPlay: true,
    muted: false,
    onReady: function() { }
  };

  constructor(props, context) {
    super(props, context);

    this.state = {
      peer_name: null,
    }

    this._video_element = null;
    this._attachStream = this._attachStream.bind(this);
  }
  componentDidMount() {
    this._attachStream();
    VideoConferenceStore.addChangeListener(this._attachStream)
  }
  componentWillUnmount() {
    VideoConferenceStore.removeChangeListener(this._attachStream);
  }

  _attachStream() {
    const {peerID, onReady} = this.props;
    if(this._video_element) {
      const attached = VideoConferenceStore.attachStream(this._video_element, peerID);
      if(attached) {
        const peer_name = VideoConferenceStore.getPeerName(peerID);
        this.setState({ peer_name });
        onReady();
      }
    }
  }

  render() {
    const { muted, autoPlay, audioState, videoState } = this.props;

    let no_video_content;
    let container_class = "conf-feed-video-container";
    if(!videoState) {
      container_class += " hide";
      no_video_content = (
        <div className="conference-feed-placeholder">
          <div className='icon' />
          <div className='brand'>MYCHANNEL&trade;</div>
        </div>
      );
    }

    return (
      <div
        className={ container_class }
        title={ this.state.peer_name }
        >
          <video
            ref={(c) => this._video_element = c}
            autoPlay={ autoPlay }
            muted={ muted }
            onChange={  (e) => { console.log('Changed') } }
            onStalled={ (e) => { console.log('Stalled') } }
            onEnded={   (e) => { console.log('Ended')   } }
            >
          </video>
          { no_video_content }
      </div>
    );
  }
}
