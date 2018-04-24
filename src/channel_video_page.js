'use strict';

import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router';
import DataCortex from 'browser-data-cortex';

import util from './util.js';
import storage from './storage.js';
import GlobalEvent from './global_event.js';

import VideoAnalytics from './components/video_analytics.js';
import ChannelTopBar from './components/channel_top_bar.js';
import ChannelVideo from './components/channel_video.js';
import ShareOverlay from './components/share_overlay.js';
import CommentSidebar from './components/comment_sidebar.js';
import EmojiButtons from './components/emoji_buttons.js';
import EmojiBubbles from './components/emoji_bubbles.js';
import EmojiPrompt from './components/emoji_prompt.js';
import ChatPrompt from './components/chat_prompt.js';
import FormatControls from './components/format_controls.js';
import LoadingOverlay from './components/loading_overlay.js';
import MenuButton from './components/menu_button.js';
import PlayPauseButton from './components/play_pause_button.js';
import TrackerBar from './components/tracker_bar.js';
import VideoTime from './components/video_time.js';
import VolumeSlider from './components/volume_slider.js';
import VideoEnd from './components/video_end.js';
import NextVideo from './components/next_video.js';
import ChannelVideoHelpOverlay from './components/channel_video_help_overlay.js';

import Input from './components/input.js';
import Button from './components/button.js';

import ChannelStore from './stores/channel_store.js';
import ChannelVideoStore from './stores/channel_video_store.js';
import VideoRecorderStore from './stores/video_recorder_store.js';

require('../css/channel_video_page.less');
require('../css/overlay_forms.less');
require('../css/buttons.less');

const VIDEO_FORMAT_LIST = [
  'one-quarter',
  'one-half',
  'full',
  'no-video',
];

const FADE_TIMEOUT_MS = 4*1000;

export default class ChannelVideoPage extends React.Component {
  constructor(props,context) {
    super(props,context);

    this.state = {
      channel: false,
      video: false,
      is_paused: IS_IPAD ? true : false,
      is_ended: false,
      is_chat_open: false,
      is_admin_chat_open: false,
      is_analytics_open: false,
      user: props.params.user,
      share_channel: false,
      share_video: false,
      user_format: VIDEO_FORMAT_LIST[1],
      is_faded: false,
      is_muted: storage.getSync('mc.muted',false),
      volume: storage.getSync('mc.volume',1.0),
      is_sharing: false,
    };

    const { channel_id, video_id } = props.params;
    this.channel_id = channel_id;
    this.video_id = video_id;
    this.channel_video_store = false;
    this.fadeTimeout = false;
    this.currentTime = 0;

    if (video_id) {
      ChannelStore.viewChannelVideo(video_id);
    }

    this.timeEventInterval = null;
    this._sendTimeEvent = this._sendTimeEvent.bind(this);

    this._onMenuClick = this._onMenuClick.bind(this);
    this._onAnalyticsToggle = this._onAnalyticsToggle.bind(this);

    this._onChannelUpdate = this._onChannelUpdate.bind(this);
    this._onVideoUpdate = this._onVideoUpdate.bind(this);

    this._onMouseMove = this._onMouseMove.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);

    this._onVideoEnded = this._onVideoEnded.bind(this);
    this._onTimeUpdate = this._onTimeUpdate.bind(this);

    this._onPauseToggle = this._onPauseToggle.bind(this);
    this._onFormatChange = this._onFormatChange.bind(this);
    this._onChatClick = this._onChatClick.bind(this);
    this._onVolumeChange = this._onVolumeChange.bind(this);

    this._onShareToggle = this._onShareToggle.bind(this);
    this._onSharingDone = this._onSharingDone.bind(this);
    this._onGlobalEvent = this._onGlobalEvent.bind(this);

    this._onReplyClick = this._onReplyClick.bind(this);
    this._onSeek = this._onSeek.bind(this);

    DataCortex.event({
      kingdom: 'page_view',
      phylum: 'channel_video_page',
      species: video_id,
    });
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };
  componentWillReceiveProps(newProps) {
    const { channel_id, video_id } = newProps.params;
    if (video_id != this.video_id) {
      this.channel_id = channel_id;
      this.video_id = video_id;

      this.setState({ channel: false, video: false, is_faded: false, is_ended: false, is_paused: false });
      ChannelStore.fetch();
      this._onChannelUpdate();

      this._removeVideoListener();
      this._addVideoListener();
      this._startFadeTimeout();
    }
  }
  componentDidMount() {
    GlobalEvent.on('GLOBAL-MENU',this._onGlobalEvent);
    ChannelStore.addChangeListener(this._onChannelUpdate);
    ChannelStore.fetch();

    this._onChannelUpdate();
    this._startFadeTimeout();
    this._addVideoListener();
    document.addEventListener('mousemove',this._onMouseMove);
    document.addEventListener('keyup',this._onKeyUp);

    this.timeEventInterval = setInterval(this._sendTimeEvent, 30000);
    this._sendTimeEvent();
  }
  componentWillUnmount() {
    GlobalEvent.removeListener('GLOBAL-MENU',this._onGlobalEvent);
    this._clearFadeTimeout();
    clearInterval(this.timeEventInterval);
    document.removeEventListener('mousemove',this._onMouseMove);
    document.removeEventListener('keyup',this._onKeyUp);
    ChannelStore.removeChangeListener(this._onChannelUpdate);
    this._removeVideoListener();

    DataCortex.event({
      kingdom: 'page_leave',
      phylum: 'channel_video_page',
      species: this.video_id,
    });
  }
  _addVideoListener() {
    if (!this.channel_video_store) {
      this.channel_video_store = ChannelVideoStore.getStore(this.video_id);
      this.channel_video_store.addChangeListener(this._onVideoUpdate);
      this.channel_video_store.fetch();
      this._onVideoUpdate();
    }
  }
  _removeVideoListener() {
    if (this.channel_video_store) {
      this.channel_video_store.removeChangeListener(this._onVideoUpdate);
      this.channel_video_store = null;
    }
  }
  _onGlobalEvent(reason) {
    if (reason == 'analytics-click') {
      this._onAnalyticsToggle();
    }
  }
  _onChannelUpdate(tag) {
    const { channel_id, video_id } = this;
    const channel = ChannelStore.getChannel(channel_id);
    if (channel) {
      this.setState({ channel });
    }
  }
  _onVideoUpdate() {
    const video = this.channel_video_store.getVideo();
    if (video) {
      this.setState({ video });
    }
  }

  _startFadeTimeout() {
    this._clearFadeTimeout();
    this.fadeTimeout = setTimeout(() => {
      this.setState({ is_faded: true });
    },FADE_TIMEOUT_MS);
  }
  _clearFadeTimeout() {
    if (this.fadeTimeout) {
      clearTimeout(this.fadeTimeout);
      this.fadeTimeout = false;
    }
  }
  _onMouseMove() {
    if (!this.state.is_paused) {
      this._startFadeTimeout();
      this.setState({ is_faded: false });
    }
  }
  _onKeyUp(e) {
    if (e.keyCode == 0x20 && !this.state.is_chat_open) {
      this._onPauseToggle();
    }
  }
  _onPauseToggle() {
    const { video } = this.state;
    if (!video.is_live_only) {
      const is_paused = !this.state.is_paused;
      this.setState({ is_paused, is_faded: false, is_ended: false });
      if (!is_paused) {
        this._startFadeTimeout();
      }

      DataCortex.event({
        kingdom: 'view',
        phylum: 'channel_video_page',
        class: (is_paused ? 'pause' : 'play'),
        species: this.video_id,
      });
    }
  }
  _onVideoEnded() {
    this.setState({ is_ended: true, is_paused: true });
    this._sendTimeEvent();

    DataCortex.event({
      kingdom: 'view',
      phylum: 'channel_video_page',
      class: 'end',
      species: this.video_id,
    });
  }
  _onChatClick(e) {
    util.stopAll(e);
    let { user, is_chat_open, is_admin_chat_open } = this.state;
    if (user.is_admin) {
      if (is_chat_open && is_admin_chat_open) {
        is_chat_open = false;
        is_admin_chat_open = false;
      } else if (is_chat_open) {
        is_admin_chat_open = true;
      } else {
        is_chat_open = true;
        is_admin_chat_open = false;
      }
    } else {
      is_chat_open = !is_chat_open;
    }
    this.setState({ is_chat_open, is_admin_chat_open });

    _.times(10,(n) => {
      util.fireResizeLater('chat-click-' + n,n*100);
    });

  }
  _onFormatChange() {
    let { user_format } = this.state;
    let index = VIDEO_FORMAT_LIST.indexOf(user_format);
    if (index < 0) {
      index = 0;
    }
    index++;
    index = index % VIDEO_FORMAT_LIST.length;
    user_format = VIDEO_FORMAT_LIST[index];

    this.setState({ user_format });
  }
  _onTimeUpdate({ currentTime, bufferedTime }) {
    if (this.refs.tracker_bar) {
      this.refs.tracker_bar.updateState({ currentTime, bufferedTime });
    }
    if (this.refs.emoji_buttons) {
      this.refs.emoji_buttons.updateState({ currentTime });
    }
    if (this.refs.emoji_bubbles) {
      this.refs.emoji_bubbles.updateState({ currentTime });
    }
    if (this.refs.video_time) {
      this.refs.video_time.updateState({ currentTime });
    }
    this.currentTime = currentTime;
  }
  _onVolumeChange({ volume, muted }) {
    this.setState({ volume, is_muted: muted });
    storage.set('mc.volume',volume);
    storage.set('mc.muted',muted);
  }
  _onMenuClick(e) {
    util.stopAll(e);
  }
  _onAnalyticsToggle(e) {
    const is_analytics_open = !this.state.is_analytics_open;
    this.setState({
      is_sharing: false,
      is_analytics_open
    });
  }
  _onShareToggle(e) {
    util.stopAll(e);
    const { is_sharing } = this.state;
    this.setState({
      is_sharing: !is_sharing,
      is_analytics_open: false,
    });
  }
  _onSharingDone(err) {
    this.setState({ is_sharing: false });
    if(!err) {
      alert('Your share email(s) have been sent.');
    }
  }
  _onReplyClick() {
    const { channel_id, video_id } = this;
    this.navigating_away = true;
    const url = "/channel/" + channel_id + "/video/" + video_id + "/reply";
    this.context.router.push(url);
  }
  _sendTimeEvent() {
    DataCortex.event({
      kingdom: 'view',
      phylum: 'channel_video_page',
      class: 'view_time',
      species: this.video_id,
      float1: this.currentTime,
    });
  }
  _onSeek(time) {
    const { video } = this.refs;
    video.seek(time);
  }

  render() {
    const {
      user,
      channel,
      video,
      message_list,
      is_ended,
      is_paused,
      is_chat_open,
      is_admin_chat_open,
      share_channel,
      share_video,
      user_format,
      is_faded,
      is_muted,
      volume,
      is_analytics_open,
      is_sharing,
    } = this.state;
    const disabled = this.state.is_message_sending;

    const { is_admin } = user;

    let content = null;
    if (video && channel) {
      let format_controls = null;
      const like_count = ChannelStore.channelVideoLikeCount(video);
      const can_share = is_admin || !video.is_private;

      if (video.slide_count > 0) {
        format_controls = (
          <FormatControls
            format={user_format}
            onFormatChange={this._onFormatChange}
          />
        );
      }

      let fade = '';
      if (!is_paused && is_faded && !is_analytics_open && !is_ended) {
        fade = ' faded';
      }
      let tracker_bar = null;
      let pauseToggle;
      let play_pause = null;
      let live = null;
      let video_time = null;
      if (!video.is_live_only) {
        pauseToggle = this._onPauseToggle;
        play_pause = [
          <PlayPauseButton
            key='play_pause'
            paused={is_paused}
            ended={is_ended}
            onClick={this._onPauseToggle}
          />,
          <NextVideo
            key='next_video'
            channel={channel}
            video={video}
          />
        ];
        tracker_bar = (
          <TrackerBar
            ref="tracker_bar"
            video={video}
            onSeek={this._onSeek}
          />
        );
        video_time = (
          <VideoTime
            ref="video_time"
            video={video}
          />
        )
      } else {
        live = <div className='live'>LIVE</div>;
      }

      let video_analytics = null;
      let video_end = null;
      let video_sharing = null;
      if (is_analytics_open) {
        video_analytics = (
          <VideoAnalytics
            channel={channel}
            video={video}
            onCloseClick={this._onAnalyticsToggle}
          />
        );
      } else if (is_sharing) {
        video_sharing = (
          <ShareOverlay
            onClose={this._onShareToggle}
            onComplete={this._onSharingDone}
            channel={channel}
            video={video}
          />
        );
      } else if (is_ended) {
        video_end = (
          <VideoEnd
            channel={channel}
            video={video}
            canDisplayVideoReply={ VideoRecorderStore.isSupported() }
            onReplay={ this._onPauseToggle }
            onReply={ this._onReplyClick }
            onShare={ this._onShareToggle }
            user={ user }
          />
        );
      }

      let share_button = null;
      if (can_share) {
        share_button = (
          <div
            className="share-button"
            title="Share Video"
            onClick={ this._onShareToggle }
          >
            <div />
          </div>
        );
      }

      let onAnalyticsClick = null;
      if (is_admin) {
        onAnalyticsClick = this._onAnalyticsToggle;
      }
      let sidebar_cls = 'channel-sidebar-container';
      if (is_chat_open) {
        sidebar_cls += ' open';
      }
      if (is_admin_chat_open) {
        sidebar_cls += ' admin';
      }

      content = (
        <div
          className={'channel-video-page-container' + fade}
          onClick={pauseToggle}
        >
          <div className='channel-left-container'>
            <ChannelVideo
              ref="video"
              userFormat={user_format}
              paused={is_paused}
              ended={is_ended}
              volume={volume}
              muted={is_muted}
              video={video}
              user={user}
              onVideoClick={pauseToggle}
              onEnded={this._onVideoEnded}
              onTimeUpdate={this._onTimeUpdate}
            />
            <div
              className='channel-overlay'
              onClick={pauseToggle}
            >
              {video_end}
              <ChannelTopBar
                channelName={video.channel_name}
                videoTitle={video.title}
                onChatClick={this._onChatClick}
                isChatOpen={is_chat_open}
                onAnalyticsClick={onAnalyticsClick}
                />
              {video_analytics}
              {video_sharing}
              <div className='bottom-bar auto-fade' onClick={util.stopAll}>
                {tracker_bar}
                <div className='button-bar'>
                  {live}
                  {play_pause}
                  <VolumeSlider
                    volume={volume}
                    muted={is_muted}
                    onChange={this._onVolumeChange}
                  />
                  {video_time}
                  <div className='min-spacer' />
                  {format_controls}
                  {share_button}
                  <div className='emoji-spacer' />
                </div>
              </div>
              <EmojiButtons
                ref='emoji_buttons'
                video={video}
                paused={is_paused}
              />
              <EmojiBubbles
                ref='emoji_bubbles'
                video={video}
              />
              <EmojiPrompt video={video} />
              <ChatPrompt video={video} />
            </div>
          </div>
          <div className={sidebar_cls}>
            <CommentSidebar
              user={user}
              channel={channel}
              channelVideo={video}
            />
          </div>
          <ChannelVideoHelpOverlay />
        </div>
      );
    } else {
      content = <LoadingOverlay />;
    }
    return content;
  }
}
