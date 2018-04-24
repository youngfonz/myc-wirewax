'use strict';

import React from 'react';

import PureComponent from './pure_component.js';

import LikeStore from '../stores/like_store.js';
import UserStore from '../stores/user_store.js';

import util from '../util.js';

const REMOVE_MS = 5*1000;

let g_userLikeCount = 0;

require('../../css/emoji.less');

export default class EmojiBubbles extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      like_list: [],
    };
    this.user = UserStore.getUser();
    this.video_id = props.video.channel_video_id;
    this.disarm = true;
    this.currentTime = 0.0;
    this.last_time = 0.0;
    this.like_store = null;

    this._onLikeUpdate = this._onLikeUpdate.bind(this);
  }
  static propTypes = {
    video: React.PropTypes.object,
  };
  static defaultProps = {
    video: {},
  };
  componentDidMount() {
    this.disarm = false;
    this._addListener();
  }
  componentWillUnmount() {
    this.disarm = true;
    this._removeListener();
  }

  componentWillReceiveProps(nextProps) {
    const video_id = nextProps.video.channel_video_id;
    if (this.video_id != video_id) {
      this._removeListener();
      this.video_id = video_id;
      this.last_time = 0.0;
      this.setState({ like_list: [] });
      this._addListener();
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    const { video } = this.props;
    const { like_list } = this.state;
    return like_list != nextState.like_list
      || video.channel_video_id != nextProps.video.channel_video_id;
  }
  _addListener() {
    if (!this.like_store) {
      this.like_store = LikeStore.getStore(this.video_id);
      this.like_store.addChangeListener(this._onLikeUpdate);

      const { video } = this.props;
      if (!video.is_stream) {
        this.like_store.fetch();
      }
      this._onLikeUpdate();
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
      const { video } = this.props;
      const { channel_video_id, is_stream } = video;

      const add_like_list = _.filter(new_likes,(l) => {
        let ret;
        if (l.client_side_like) {
          ret = true;
        } else if (is_stream && l.user_id != this.user.user_id) {
          ret = true;
        } else {
          ret = false;
        }
        return ret;
      });

      if (add_like_list.length > 0) {
        this._addLikes(add_like_list);
      }
    }
  }

  _addLikes(new_like_list) {
    const { like_list } = this.state;
    const start_count = like_list.length;
    const new_list = like_list.slice();

    _.each(new_like_list,(like) => {
      if (!like.channel_video_like_id) {
        like.channel_video_like_id = "user_" + g_userLikeCount++;
      }
      const found = _.find(new_list,(l) => l.channel_video_like_id == like.channel_video_like_id);
      if (!found) {
        new_list.push(like);
      }
    })

    const end_count = new_list.length;
    const delta = end_count - start_count;
    if (delta > 0) {
      this.setState({ like_list: new_list });
      setTimeout(this._removeEmoji.bind(this,delta),REMOVE_MS);
    }
  }

  updateState({ currentTime }) {
    this.currentTime = currentTime;

    const { video } = this.props;
    if (false && !video.is_stream && this.like_store) {
      const likes = this.like_store.getLikesInWindow(this.last_time,currentTime);
      this.last_time = currentTime;
      if (likes.length > 0) {
        this._addLikes(likes);
      }
    }
  }
  _removeEmoji(remove_count) {
    if (!this.disarm) {
      let new_list = this.state.like_list.slice();
      if (new_list.length > remove_count) {
        new_list.splice(0,remove_count);
      } else {
        new_list = [];
      }
      this.setState({ like_list: new_list });
    }
  }

  render() {
    const { like_list } = this.state;
    const emojis = _.map(like_list,(l) => {
      const key = l.channel_video_like_id;
      return (
        <div
          key={key}
          className={'emoji ' + l.like_type.toLowerCase()}
        />
      );
    });

    return (
      <div className='emoji-bubbles'>
        {emojis}
      </div>
    );
  }
}
