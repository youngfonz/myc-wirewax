'use strict';

import React from 'react';

import PureComponent from './pure_component.js';
import ConferenceFeed from './conference_feed.js';

import VideoConferenceStore from '../stores/video_conference_store.js';

export default class ConferenceRemoteFeeds extends PureComponent {
  static propTypes = {
    remotePeers: React.PropTypes.array.isRequired
  }

  render() {
    const remote_feeds = _.map(this.props.remotePeers, (peer_id) => {
      return (
        <div className="remote-feed" key={peer_id}>
          <div className="static_sized_css_fix">
            <ConferenceFeed
              peerID={ peer_id }
              audioState={ VideoConferenceStore.getPeerAudioState(peer_id) }
              videoState={ VideoConferenceStore.getPeerVideoState(peer_id) }
            />
          </div>
        </div>
      );
    });

    return (
      <div className="remote-feeds">
        {remote_feeds}
      </div>
    );
  }

}
