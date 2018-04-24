
import EventEmitter from 'events';
import async from 'async';
import _ from 'lodash';

import MycApi from './myc_api.js';
import util from './util.js';

import UserStore from './stores/user_store.js';

const VIDEO_PUSH_EVENT = 'video-update';
const CHAT_PUSH_EVENT = 'chat-update';
const LIKE_PUSH_EVENT = 'like-update';

const EVENT_NAME = "message";

let g_pusher = null;
const g_channelMap = {};

function getPusherClient() {
  if (!g_pusher) {
    const pusher_app_key = window.appConfig.pusherAppKey;
    const base_url = MycApi.getBaseUrl();
    const url =  base_url + '/client/1/pusher/auth';
    const api_key = MycApi.getApiKey();
    const session_key = UserStore.getSessionKey();

    const opts = {
      encrypted: true,
      authEndpoint: url,
      auth: {
        headers: {
          'X-MC-API-Key': api_key,
          'X-MC-User-Session-Key': session_key,
        }
      }
    };
    const pusher = new Pusher(pusher_app_key,opts);
    pusher.connection.bind('error',(err) => {
      util.errorLog("pusher connection err:",err);
    });
    g_pusher = pusher;
  }
  return g_pusher;
}

class ServerChannel {
  constructor(channel_video_id) {
    this.eventEmitter = new EventEmitter();

    this.channel_name = _getChannelName(channel_video_id);
    this.admin_channel_name = _getChannelName(channel_video_id,true);

    this.channel = false;
    this.admin_channel = false;
    this.is_subscribed = false;

    this._onEvent = this._onEvent.bind(this);
  }

  addListener(event,callback) {
    this.eventEmitter.on(event,callback);
    this._checkSubscribe();
  }
  removeListener(event,callback) {
    this.eventEmitter.removeListener(event,callback);
    this._checkSubscribe();
  }
  _checkSubscribe() {
    const event_names = Object.keys(this.eventEmitter._events);
    const listeners = _.reduce(event_names,(memo,e) => {
      return memo + this.eventEmitter.listenerCount(e);
    },0);

    if (listeners > 0) {
      this._subscribe();
    } else {
      this._unsubscribe();
    }
  }

  _subscribe() {
    if (!this.channel) {
      const pusher = getPusherClient();
      const channel = pusher.subscribe(this.channel_name);
      channel.bind('pusher:subscription_succeeded',() => {
        this.is_subscribed = true;
      });
      channel.bind('pusher:subscription_error',(err) => {
        this.is_subscribed = false;
        util.errorLog("ServerChannel: subcription error:",err);
      });
      channel.bind_all(this._onEvent);
      this.channel = channel;
    }
    const user = UserStore.getUser();
    if (!this.admin_channel && user.is_admin) {
      const pusher = getPusherClient();
      const admin_channel = pusher.subscribe(this.admin_channel_name);
      admin_channel.bind_all(this._onEvent);
      this.admin_channel = admin_channel;
    }
  }
  _unsubscribe() {
    if (this.channel) {
      const pusher = getPusherClient();
      pusher.unsubscribe(this.channel_name);
      this.channel = false;
      this.is_subscribed = false;
    }
    if (this.admin_channel) {
      const pusher = getPusherClient();
      pusher.unsubscribe(this.admin_channel_name);
      this.admin_channel = false;
    }
  }
  _onEvent(event_name,data) {
    this.eventEmitter.emit(event_name,data);
  }
  isSubscribed() {
    return this.is_subscribed;
  }
}

function _getChannelName(channel_video_id,admin_only) {
  let channel_name = "private-video-" + channel_video_id;
  if (admin_only) {
    channel_name += '-admin';
  }
  return channel_name;
}

function getChannel(arg) {
  let channel_video_id;
  if (arg.channel_video_id) {
    channel_video_id = arg.channel_video_id;
  } else {
    channel_video_id = arg;
  }
  if (!(channel_video_id in g_channelMap)) {
    g_channelMap[channel_video_id] = new ServerChannel(channel_video_id);
  }
  return g_channelMap[channel_video_id];
}

export default {
  getPusherClient,
  getChannel,
  VIDEO_PUSH_EVENT,
  CHAT_PUSH_EVENT,
  LIKE_PUSH_EVENT,
};
