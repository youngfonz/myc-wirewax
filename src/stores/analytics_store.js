'use strict';

import EventEmitter from 'events';

import UserStore from './user_store.js';
import util from '../util.js';

const CHANGE_EVENT = "change";

const g_eventEmitter = new EventEmitter();

let g_overviewData = null;

const g_channelData = {};

function addChangeListener(callback) {
  g_eventEmitter.on(CHANGE_EVENT,callback);
}
function removeChangeListener(callback) {
  g_eventEmitter.removeListener(CHANGE_EVENT,callback);
}

function _updateOverviewData(new_data) {
  if (!util.deepEqual(new_data,g_overviewData)) {
    g_overviewData = new_data;
    g_eventEmitter.emit(CHANGE_EVENT,'overview');
  }
}

function fetch() {
  const opts = {
    url: '/client/1/analytics/overview',
  };
  UserStore.userGet(opts,(err,body) => {
    if (err) {
      util.errorLog("AnalyticsStore.fetch: err:",err,body);
    } else {
      _updateOverviewData(body);
    }
  });
}

function getOverviewData() {
  return g_overviewData;
}

function _updateChannelData(channel_id,new_data) {
  const curr_data = g_channelData[channel_id];
  if (!util.deepEqual(curr_data,new_data)) {
    g_channelData[channel_id] = new_data;
    g_eventEmitter.emit(CHANGE_EVENT,'channel');
  }
}

function fetchChannelVideo(video) {
  const { channel_video_id, channel_id } = video;
  const opts = {
    url: '/client/1/analytics/channel/' + channel_id,
    query: {
      channel_video_id,
    }
  };
  UserStore.userGet(opts,(err,body) => {
    if (err) {
      util.errorLog("AnalyticsStore.fetch: err:",err,body);
    } else {
      _updateChannelData(channel_id,body);
    }
  });
}
function getChannelData(channel_id) {
  return g_channelData[channel_id];
}

function broadcastChannel(channel) {
  const opts = {
    url: '/client/1/analytics/broadcast_channel',
    body: {
      channel_id: channel.channel_id,
    }
  };
  UserStore.userPost(opts,(err,body) => {
    if (err) {
      util.errorLog("AnalyticsStore.broadcastChannel: err:",err,body);
    } else {
      fetch();
    }
  });
}
function broadcastMessage(message,done = function() {}) {
  const opts = {
    url: '/client/1/analytics/broadcast_message',
    body: {
      message_id: message.message_id,
    }
  };
  UserStore.userPost(opts,(err,body) => {
    if (err) {
      util.errorLog("AnalyticsStore.broadcastMessage: err:",err,body);
    } else {
      fetch();
      done(err);
    }
  });
}

export default {
  addChangeListener,
  removeChangeListener,
  fetch,
  getOverviewData,
  fetchChannelVideo,
  getChannelData,
  broadcastChannel,
  broadcastMessage,
};
