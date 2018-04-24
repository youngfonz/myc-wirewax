'use strict';

import EventEmitter from 'events';
import async from 'async';
import _ from 'lodash';

import util from '../util.js';
import UserStore from './user_store.js';

const CHANGE_EVENT = "change";

const g_eventEmitter = new EventEmitter();
let g_user = false;
let g_recentVideoList = false;
let g_featuredVideo = false;
let g_is_fetching = false;

UserStore.addChangeListener(_onUserUpdate);

function addChangeListener(callback) {
  g_eventEmitter.on(CHANGE_EVENT,callback);
}
function removeChangeListener(callback) {
  g_eventEmitter.removeListener(CHANGE_EVENT,callback);
}
function _onUserUpdate(tag) {
  g_user = UserStore.getUser();
  if (!g_user) {
    _updateRecentVideos(false);
    _updateFeaturedVideo(false);
    g_eventEmitter.emit(CHANGE_EVENT,tag);
  } else {
    fetchRecent(tag);
  }
}
function _updateRecentVideos(new_list,tag) {
  if (!util.deepEqual(g_recentVideoList,new_list)) {
    g_recentVideoList = new_list;
    g_eventEmitter.emit(CHANGE_EVENT,tag);
  }
}

function _updateFeaturedVideo(video,tag) {
  if (!util.deepEqual(g_featuredVideo,video)) {
    g_featuredVideo = video;
    g_eventEmitter.emit(CHANGE_EVENT,tag);
  }
}

function fetchRecent(tag,done = function() {}) {
  if (typeof tag == 'function') {
    done = tag;
    tag = null;
  }
  if (g_is_fetching) {
    //console.log("VideoStore.fetchRecent: skip");
  } else {
    g_is_fetching = true;

    const opts = {
      url: '/client/1/channel_video/recent',
    };
    UserStore.userGet(opts,(err,body) => {
      g_is_fetching = false;
      let video_list = [];
      if (err) {
        util.errorLog("VideoStore.fetchRecent: err:",err);
      } else if (!body.recent_video_list) {
        util.errorLog("VideoStore.fetchRecent: no list?",err,body);
        err = 'no_list';
      } else {
        if (body.recent_video_list) {
          video_list = body.recent_video_list;
          _updateRecentVideos(video_list,tag);
        }
        if (body.featured_video) {
          _updateFeaturedVideo(body.featured_video);
        }
      }
      done(err,video_list);
    });
  }
}
function getRecentVideos() {
  return g_recentVideoList || [];
}

function getFeaturedVideo() {
  return g_featuredVideo;
}

export default {
  addChangeListener,
  removeChangeListener,
  fetchRecent,
  getRecentVideos,
  getFeaturedVideo,
};
