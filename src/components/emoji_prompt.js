'use strict';

import React from 'react';

import PureComponent from './pure_component.js';
import ActivityPrompt from './activity_prompt.js';

import LikeStore from '../stores/like_store.js';
import UserStore from '../stores/user_store.js';

import util from '../util.js';

require('../../css/emoji.less');

export default class EmojiPrompt extends PureComponent {
  constructor(props, context) {
    super(props,context);
    this.state = {
      last_activity_time: Date.now(),
    };

    this.video_id = props.video.channel_video_id;
    this.like_store = null;

    this._onLikeUpdate = this._onLikeUpdate.bind(this);
  }
  componentDidMount() {
    this._addListener();
  }
  componentWillUnmount() {
    this._removeListener();
  }
  componentWillReceiveProps(nextProps) {
    const video_id = nextProps.video.channel_video_id;
    if (this.video_id != video_id) {
      this._removeListener();
      this.video_id = video_id;
      this._addListener();
      this.setState({ last_activity_time: Date.now() });
    }
  }

  _addListener() {
    if (!this.like_store) {
      this.like_store = LikeStore.getStore(this.video_id);
      this.like_store.addChangeListener(this._onLikeUpdate);
    }
  }
  _removeListener() {
    if (this.like_store) {
      this.like_store.removeChangeListener(this._onLikeUpdate);
      this.like_store = null;
    }
  }
  _onLikeUpdate(new_likes) {
    if (new_likes && new_likes.length > 0) {
      _.some(new_likes,(l) => {
        if (l.client_side_like) {
          this.setState({ last_activity_time: Date.now() });
        }
        return l.client_side_like;
      });
    }
  }
  render() {
    const { video } = this.props;
    const { last_activity_time } = this.state;

    let content = null;
    if (video.is_live_only) {
      content = (
        <ActivityPrompt
          className='emoji-prompt'
          text="Make sure to give us your sentiment by clicking the emoji below."
          lastActivityTime={last_activity_time}
        />
      );
    }

    return content;
  }
}
