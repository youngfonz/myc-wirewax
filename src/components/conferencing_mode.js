'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';

import util from '../util.js';
import storage from '../storage.js';

import ConferenceStore from '../stores/conference_store.js';
import LocalStreamStore from '../stores/local_stream_store.js';

import ChannelTopBar from './channel_top_bar.js';
import CommentSidebar from './comment_sidebar.js';
import ConferenceFeed from './conference_feed.js';
import ConferenceRemoteFeeds from './conference_remote_feeds.js';
import CountUpTimer from './count_up_timer.js';
import EmojiButtons from './emoji_buttons.js';
import FormatControls from './format_controls.js';
import LoadingOverlay from './loading_overlay.js';
import PDFPageControls from './pdf_page_controls.js';
import PureComponent from './pure_component.js';
import ShareOverlay from './share_overlay.js';
import SlideViewer from './slide_viewer.js';
import VolumeSlider from './volume_slider.js';

require('../../css/presentation.less');
require('../../css/buttons.less');

export default class ConferencingMode extends PureComponent {
  static propTypes = {
    channel: React.PropTypes.object.isRequired,
    conference: React.PropTypes.object.isRequired,
    isCameraOff: React.PropTypes.bool.isRequired,
    isChatOpen: React.PropTypes.bool.isRequired,
    isFaded: React.PropTypes.bool,
    isMuted: React.PropTypes.bool.isRequired,
    onChatClick: React.PropTypes.func.isRequired,
    remotePeers: React.PropTypes.array.isRequired,
    toggleAudio: React.PropTypes.func.isRequired,
    toggleVideo: React.PropTypes.func.isRequired,
    user: React.PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      seq_page: false,
      user_format: false,
      is_muted: storage.getSync('mc.muted',false),
      volume: storage.getSync('mc.volume',1.0),
      local_audio_state: LocalStreamStore.getLocalAudioState(),
      local_video_state: LocalStreamStore.getLocalVideoState(),
    };

    DataCortex.event({
      kingdom: 'conference',
      phylum: 'in_conference',
      species: props.conference.conference_id,
    });

    this._onConferenceUpdate = this._onConferenceUpdate.bind(this);
    this._onFormatChange = this._onFormatChange.bind(this);
    this._onLocalStreamChange = this._onLocalStreamChange.bind(this);
    this._onPageChange = this._onPageChange.bind(this);
    this._onVolumeChange = this._onVolumeChange.bind(this);
    this._onToggleShare = this._onToggleShare.bind(this);
    this._onSharingDone = this._onSharingDone.bind(this);
  }
  componentDidMount() {
    ConferenceStore.addChangeListener(this._onConferenceUpdate);
    LocalStreamStore.addChangeListener(this._onLocalStreamChange);
  }
  componentWillUnmount() {
    ConferenceStore.removeChangeListener(this._onConferenceUpdate);
    LocalStreamStore.removeChangeListener(this._onLocalStreamChange);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.conference.conference_id != nextProps.conference.conference_id) {
      this.setState({ seq_page: false });
    }
  }

  _onConferenceUpdate() {
    const page_num = ConferenceStore.getPageNumber(this.props.conference);
    this.setState({ seq_page: page_num });
  }
  _onFormatChange(user_format) {
    this.setState({ user_format });
  }
  _onLocalStreamChange(tag) {
    this.setState({
      local_audio_state: LocalStreamStore.getLocalAudioState(),
      local_video_state: LocalStreamStore.getLocalVideoState(),
    });
  }
  _onPageChange(page_num) {
    ConferenceStore.sendPageNumber(this.props.conference, page_num);
  }
  _onVolumeChange({ volume, muted }) {
    this.setState({ volume, is_muted: muted });
    storage.set('mc.volume',volume);
    storage.set('mc.muted',muted);
  }
  _onToggleShare() {
    const is_sharing = !this.state.is_sharing;
    this.setState({ is_sharing });
  }
  _onSharingDone(err) {
    this.setState({ is_sharing: false });
    if(!err) {
      alert('Your share email(s) have been sent.');
    }
  }

  render() {
    const {
      volume,
      is_muted,
      is_sharing,
      local_audio_state,
      local_video_state,
    } = this.state;

    const {
      channel,
      conference,
      isCameraOff,
      isChatOpen,
      isFaded,
      isMuted,
      onChatClick,
      remotePeers,
      toggleAudio,
      toggleVideo,
      user,
    } = this.props;

    const page = this.state.seq_page || conference.slide_page_number || 1;
    const channel_name = channel.channel_name || "";
    const conference_name = conference.conference_name || "";
    const user_format = this.state.user_format || 'one-half';
    const container_class = user_format == 'one-half' ? 'conference-video-container' : 'slides-and-peers';
    const chat_sidebar_class = "channel-sidebar-container" + (isChatOpen ? " open" : "");
    const can_share =  user.is_admin || !channel.is_private;
    const slide_count = conference.slide_count || 0;
    const slide_list  = conference.slide_list || [];

    let page_container = "conference-page-container";
    if(isFaded) {
      page_container += " faded";
    }
    if(isChatOpen) {
      page_container += " chat-open";
    }

    let loader;
    let local_feeds_class = "local-feed";
    let remote_feeds;
    let slide_viewer;
    let slides_and_peers;
    let slide_format_controls;

    if(!remotePeers || !remotePeers.length) {
      loader = (
          <LoadingOverlay
            loadingText="Waiting for others to join..."
          />
      );
    } else {
      remote_feeds = <ConferenceRemoteFeeds remotePeers={remotePeers} />;
    }

    if (ConferenceStore.hasPresentation(conference)) {
      slide_format_controls = <FormatControls
         format={user_format}
         onFormatChange={this._onFormatChange}
      />;

      if(user_format != 'full') {
        let controls;

        if(ConferenceStore.hasPageControls(conference)) {
          controls = <PDFPageControls
                      slideCount={slide_count}
                      page={page}
                      onPageChange={this._onPageChange} />;
        }

        slide_viewer = (
          <div className='presentation-container'>
            <SlideViewer
              containerClass={container_class}
              format={user_format}
              page={page}
              slideList={slide_list}
            />
            { controls }
          </div>
        );

        if(user_format == 'no-video') {
          remote_feeds = null;
        }
      }
    }

    if(remote_feeds || slide_viewer) {
      local_feeds_class = "local-feed with-remote-feeds";
      slides_and_peers = (
        <div className="slides-and-peers">
          { remote_feeds }
          { slide_viewer }
        </div>
      );
    }

    let video_sharing = null;
    if (is_sharing) {
      loader = null;
      video_sharing = <ShareOverlay
                        onClose={ this._onToggleShare }
                        onComplete={ this._onSharingDone }
                        conference={ conference }
                        channel={ channel }
                      />;
    }

    let share_button;
    if(can_share) {
      share_button = (
        <div className="share-button-container">
          <div
            className="share-button"
            onClick={ this._onToggleShare }
            >
            <div />
          </div>
        </div>
      );
    }

    return (
      <div className={ page_container }>
        { loader }
        <div className={"conference-video-container " + user_format}>
          { slides_and_peers }
          <div className={ local_feeds_class }>
            <div className="local-feed-video">
              <ConferenceFeed
                muted={true}
                audioState={ local_audio_state }
                videoState={ local_video_state }
               />
            </div>
          </div>
          <div className="conference-video-channel-overlay">
            <ChannelTopBar
              channelName={channel_name}
              videoTitle={conference_name}
              onChatClick={onChatClick}
              isChatOpen={isChatOpen}
              />
              <div className="conference-video-controls auto-fade">
                <div className="left">
                  <div className="audio-video-buttons">
                  <div
                    className={"mic-on-off-button" + (isMuted ? " off" : "")}
                    onClick={toggleAudio}
                    >
                    <div />
                  </div>
                  <div
                    className={"camera-on-off-button" + (isCameraOff ? " off" : "")}
                    onClick={toggleVideo}
                    >
                    <div />
                  </div>
                  </div>
                  <VolumeSlider
                    volume={volume}
                    muted={is_muted}
                    onChange={this._onVolumeChange}
                  />
                  <CountUpTimer />
                </div>
                <div className="right">
                  {slide_format_controls}
                  {share_button}
                  <EmojiButtons
                    ref='emoji_buttons'
                    conference={ conference }
                  />
                </div>
              </div>
          </div>
        </div>
        <div className={chat_sidebar_class}>
          <CommentSidebar
            user={user}
            channel={channel}
            channelConference={conference}
          />
        </div>
        { video_sharing }
      </div>
    );
  }
}
