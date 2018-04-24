'use strict';

import EventEmitter from 'events';
import _ from 'lodash';

import util from '../util.js';
import ServerPush from '../server_push.js';

import UserStore from './user_store.js';
import ChannelVideoStore from './channel_video_store.js';

const CHANGE_EVENT = "change";

const LIKE_VALUE_MAP = {
  LOVE: 1,
  LIKE: 1,
  NEUTRAL: 0,
  HATE: -1,
};

class LikeStore {
  constructor(channel_video_id) {
    this.eventEmitter = new EventEmitter();
    this.channel_video_id = channel_video_id;
    this.like_list = [];
    this.server_push = null;
    this.is_fetching = false;
    this._onPushMessage = this._onPushMessage.bind(this);
  }

  addChangeListener(callback) {
    this.eventEmitter.on(CHANGE_EVENT,callback);
    this._checkSubscribe();
  }
  removeChangeListener(callback) {
    this.eventEmitter.removeListener(CHANGE_EVENT,callback);
    this._checkSubscribe();
  }
  _checkSubscribe() {
    const listeners = this.eventEmitter.listenerCount(CHANGE_EVENT);
    if (listeners > 0) {
      this._subscribe();
    } else {
      this._unsubscribe();
    }
  }
  _subscribe() {
    if (!this.server_push) {
      this.server_push = ServerPush.getChannel(this.channel_video_id);
      this.server_push.addListener(ServerPush.LIKE_PUSH_EVENT,this._onPushMessage);
    }
  }
  _unsubscribe() {
    if (this.server_push) {
      this.server_push.removeListener(ServerPush.LIKE_PUSH_EVENT,this._onPushMessage);
      this.server_push = null;
    }
  }
  _updateList(like_list,new_likes) {
    if (!util.deepEqual(this.like_list,like_list)) {
      this.like_list = like_list.slice();
      this.eventEmitter.emit(CHANGE_EVENT,new_likes);
    }
  }

  _onPushMessage(data) {
    if (data && data.like_list) {
      const push_like_list = data.like_list;
      const like_list = this.like_list.slice();
      const new_likes = [];

      _.each(push_like_list,(like) => {
        if (like.channel_video_id == this.channel_video_id) {
          const found = _.find(like_list,(l) => l.channel_video_like_id == like.channel_video_like_id);
          if (!found) {
            like_list.push(like);
            new_likes.push(like);
          }
        }
      });

      if (new_likes.length > 0) {
        this._updateList(like_list,new_likes);
      }
    }
  }

  isReady() {
    return true;
  }
  fetch() {
    if (this.is_fetching) {
      //console.log("LikeStore.fetch skip");
    } else {
      this.is_fetching = true;
      const opts = {
        url: '/client/1/channel_video/' + this.channel_video_id + '/like_list',
      };
      UserStore.userGet(opts,(err,body) => {
        this.is_fetching = false;
        if (err) {
          util.errorLog("LikeStore.fetch: err:",err,body);
        } else if (body && body.like_list) {
          this._updateList(body.like_list);
        }
      });
    }
  }

  getLikesInWindow(start_offset,end_offset) {
    const ret = [];
    _.each(this.like_list,(l) => {
      if (l.offset_seconds >= start_offset && l.offset_seconds < end_offset) {
        ret.push(l);
      }
    });
    return ret;
  }

  getLikeGraph() {
    const BUCKET_TARGET = 60;
    const like_list = this.like_list;
    const video = ChannelVideoStore.getVideo(this.channel_video_id);
    const {
      start_datetime,
      end_datetime,
      is_live_only,
    } = video;

    let duration_seconds = video.duration_seconds;
    let start_m = false;
    if (is_live_only && start_datetime) {
      start_m = moment(start_datetime);
      if (end_datetime) {
        const diff_secs = moment(end_datetime).diff(start_m)/1000;
        duration_seconds = between(60,2*60*60,diff_secs);
      } else {
        duration_seconds = 2*60*60;
      }
    }

    const bucket_secs = Math.max(Math.floor(duration_seconds / BUCKET_TARGET),1.0);
    const bucket_count = Math.ceil(duration_seconds/bucket_secs);

    const value_list = [];

    if (bucket_count > 0 && bucket_secs > 0) {
      _.times(bucket_count,(i) => {
        value_list[i] = {
          time: bucket_secs * i,
          count: 0,
          sum: 0,
        };
      });

      _.each(like_list,(l) => {
        let offset_seconds = -1;
        if (l.offset_seconds > 0) {
          offset_seconds = l.offset_seconds;
        } else if (is_live_only && l.created_datetime && start_m) {
          const m = moment(l.created_datetime);
          offset_seconds = m.diff(start_m)/1000;
        }
        const like_value = LIKE_VALUE_MAP[l.like_type];

        if (offset_seconds >= 0 && typeof like_value == 'number') {
          let i = Math.floor(offset_seconds/bucket_secs);
          i = between(0,bucket_count - 1,i);
          const v = value_list[i];
          v.sum += like_value;
          v.count++;
        }
      });
      const max = _.reduce(value_list,(memo,v) => Math.max(Math.abs(v.sum),memo),0);
      _.each(value_list,(v) => {
        v.normalized = (max > 0) ? (v.sum / max) : 0;
        v.avg = (v.count > 0) ? (v.sum / v.count) : 0;
      });
    }
    return value_list;
  }

  addUserLike(params,done = function() {}) {
    const {
      created_datetime,
      like_type,
      offset_seconds,
    } = params;
    const like = {
      created_datetime,
      like_type,
      like_count: 1,
    };
    if (offset_seconds) {
      like.offset_seconds = offset_seconds;
    }

    const opts = {
      url: '/client/1/channel_video/' + this.channel_video_id + '/like',
      body: {
        like_list: [like],
      },
    };
    UserStore.userPost(opts,(err,body) => {
      if (err) {
        util.errorLog("LikeStore.addUserLike: err:",err,body);
      }
      done(err);
    });
    like.client_side_like = true;
    this.eventEmitter.emit(CHANGE_EVENT,[like]);
  }
}

function between(min,max,val) {
  if (isNaN(val)) {
    val = 0;
  }

  return Math.max(min,Math.min(max,val));
}

function addLikes(arg,new_list) {
  const store = getStore(arg);
  store.addLikes(new_list);
}

const g_storeMap = {};

function getStore(arg) {
  let channel_video_id;
  if (arg.channel_video_id) {
    channel_video_id = arg.channel_video_id;
  } else {
    channel_video_id = arg;
  }
  if (!(channel_video_id in g_storeMap)) {
    g_storeMap[channel_video_id] = new LikeStore(channel_video_id);
  }
  return g_storeMap[channel_video_id];
}

export default {
  getStore,
  addLikes,
};
