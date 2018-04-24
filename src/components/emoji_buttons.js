'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';

import PureComponent from './pure_component.js';

import LikeStore from '../stores/like_store.js';
import UserStore from '../stores/user_store.js';

import util from '../util.js';

const REMOVE_MS = 5*1000;

let g_userLikeCount = 0;

require('../../css/emoji.less');

export default class EmojiButtons extends PureComponent {
  constructor(props, context) {
    super(props, context);
    this.video_id = props.video.channel_video_id;
    this.like_store = null;
    this.currentTime = false;

    this._onEmojiLoveClick = this._onEmojiClick.bind(this,'LOVE');
    this._onEmojiNeutralClick = this._onEmojiClick.bind(this,'NEUTRAL');
    this._onEmojiHateClick = this._onEmojiClick.bind(this,'HATE');
  }
  static propTypes = {
    video: React.PropTypes.object,
  };
  static defaultProps = {
    video: {},
  };
  componentDidMount() {
    this.like_store = LikeStore.getStore(this.video_id);
  }

  componentWillReceiveProps(nextProps) {
    const video_id = nextProps.video.channel_video_id;
    if (this.video_id != video_id) {
      this.currentTime = false;
      this.like_store = LikeStore.getStore(this.video_id);
    }
  }
  updateState({ currentTime }) {
    this.currentTime = currentTime;
  }

  _onEmojiClick(like_type,e) {
    util.stopAll(e);

    const { video } = this.props;
    const { channel_video_id } = video;
    const like = {
      like_type,
      channel_video: video,
      channel_video_id,
      created_datetime: new Date(),
    };
    if (!video.is_stream && this.currentTime !== false) {
      like.offset_seconds = this.currentTime;
    }
    this.like_store.addUserLike(like);

    DataCortex.event({
      kingdom: 'like',
      phylum: like_type.toLowerCase(),
      species: channel_video_id,
    });
  }

  render() {
    return (
      <div className='emoji-buttons'>
        <div
          className='love'
          title="Like"
          onClick={this._onEmojiLoveClick}
        />
        <div
          className='neutral'
          title="Neutral"
          onClick={this._onEmojiNeutralClick}
        />
        <div
          className='hate'
          title="Dislike"
          onClick={this._onEmojiHateClick}
        />
      </div>
    );
  }
}
