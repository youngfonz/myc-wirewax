'use strict';

import EventEmitter from 'events';
import _ from 'lodash';

import UserStore from './user_store.js';
import ChannelStore from './channel_store.js';

import ServerPush from '../server_push.js';
import util from '../util.js';

const CHANGE_EVENT = "change";

class ChannelVideoStore {
  constructor(channel_video_id) {
    this.eventEmitter = new EventEmitter();
    this.channel_video_id = channel_video_id;
    this.video = false;
    this.server_push = false;
    this.is_fetching = false;

    this._onPushMessage = this._onPushMessage.bind(this);
    this.fetch();
  }
  addChangeListener(callback) {
    this.eventEmitter.on(CHANGE_EVENT,callback);
    this._checkPush();
  }
  removeChangeListener(callback) {
    this.eventEmitter.removeListener(CHANGE_EVENT,callback);
    this._checkPush();
  }
  _addPush() {
    if (!this.server_push) {
      this.server_push = ServerPush.getChannel(this.channel_video_id);
      this.server_push.addListener(ServerPush.VIDEO_PUSH_EVENT,this._onPushMessage);
    }
  }
  _removePush() {
    if (this.server_push) {
      this.server_push.removeListener(ServerPush.VIDEO_PUSH_EVENT,this._onPushMessage);
      this.server_push = false;
    }
  }
  _checkPush() {
    const listeners = this.eventEmitter.listenerCount(CHANGE_EVENT);
    if (listeners > 0) {
      this._addPush();
    } else {
      this._removePush();
    }
  }
  _onPushMessage(data) {
    if (data && data.channel_video) {
      const { channel_video_id } = data.channel_video;
      if (this.channel_video_id == channel_video_id) {
        const new_video = _.extend({},this.video,data.channel_video);
        this._update(new_video);
      }
    }
  }
  _update(video) {
    if (!util.deepEqual(this.video,video)) {
      this.video = video;
      this.eventEmitter.emit(CHANGE_EVENT);
    }
  }
  _updateTopic(topic) {
    const new_video = _.extend({},this.video,{ topic });
    this._update(new_video);
  }
  fetch(done = function() {}) {
    if (!this.is_fetching) {
      this.is_fetching = true;

      const url = '/client/1/channel_video/' + this.channel_video_id;
      const opts = {
        url,
      };
      UserStore.userGet(opts,(err,body) => {
        this.is_fetching = false;
        if (err) {
          util.errorLog("ChannelVideoStore.fetch:",{ err, body });
        } else if (!body) {
          util.errorLog("ChannelVideoStore.fetch missing body:",{ channel_video_id });
        } else {
          this._update(body);
        }
        done();
      });
    } else {
      //console.log("ChannelVideoStore.fetch skip");
    }
  }

  getVideo() {
    return this.video;
  }
  isReady() {
    return this.video !== false;
  }

  shareVideo(user_list,done = function() { }) {
    const { channel_id, channel_video_id, title } = this.video;
    const opts = {
      url: '/client/1/channel/' + channel_id + '/share/video/' + channel_video_id,
      body: {
        user_list,
        title,
      },
    };

    UserStore.userPost(opts,(err) => {
      if(err) {
        util.errorLog("ChannelVideoStore.shareVideo: err:",err);
      }
      done(err);
    });
  }
  setTopic(topic,done = function() {}) {
    const opts = {
      url: '/client/1/channel_video/' + this.channel_video_id,
      body: {
        topic,
      },
    };
    UserStore.userPost(opts,(err,body) => {
      if (err) {
        util.errorLog("ChannelVideoStore.setTopic: err:",err,body);
      } else {
        const new_video = _.extend({},this.video,{ topic });
        this._update(new_video);
      }
      done(err);
    });
  }

}

function deleteVideo(video,done = function() {}) {
  const { channel_id, channel_video_id } = video;
  const opts = {
    url: '/client/1/channel_video/' + channel_video_id,
  };

  UserStore.userDelete(opts, (err) => {
    if(err) {
      util.errorLog("ChannelVideoStore.deleteVideo: err:",err);
    }
    done(err);
  });
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
    g_storeMap[channel_video_id] = new ChannelVideoStore(channel_video_id);
  }
  return g_storeMap[channel_video_id];
}

function getVideo(arg) {
  const store = getStore(arg);
  return store.getVideo();
}

function updateTopic(arg,topic) {
  const store = getStore(arg);
  store._updateTopic(topic);
}

export default {
  getStore,
  getVideo,
  deleteVideo,
  updateTopic,
};
