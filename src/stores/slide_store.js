'use strict';

import EventEmitter from 'events';
import async from 'async';
import _ from 'lodash';

import util from '../util.js';

import UserStore from './user_store.js';
import ChannelVideoStore from './channel_video_store.js';

const CHANGE_EVENT = "change";

const g_storeMap = {};

class SlideStore {
  constructor(video_id) {
    this.eventEmitter = new EventEmitter();
    this.user = UserStore.getUser();
    this.video_id = video_id;
    this.video = false;
    this.page_number = 0;
    this.slide_script = false;
    this.current_time = 0;
    this.video_store = ChannelVideoStore.getStore(this.video_id);
    this.video_store.addChangeListener(this._onVideoUpdate.bind(this));
    this._onVideoUpdate();
  }
  _onVideoUpdate() {
    const video = this.video_store.getVideo();
    this._updateVideo(video);
  }

  _updateVideo(video) {
    if (!util.deepEqual(this.video,video)) {
      this.video = _.extend({},video);
      if (video.slide_script && video.slide_script.length > 0) {
        this.slide_script = video.slide_script;
        this.updateTime(this.current_time);
      } else {
        this.slide_script = false;
        this._internalUpdate(video.slide_page_number);
      }
    }
  }
  addChangeListener(callback) {
    this.eventEmitter.on(CHANGE_EVENT,callback);
  }
  removeChangeListener(callback) {
    this.eventEmitter.removeListener(CHANGE_EVENT,callback);
  }
  _internalUpdate(page_number) {
    if (this.page_number != page_number) {
      this.page_number = page_number;
      this.eventEmitter.emit(CHANGE_EVENT);
    }
  }
  updateSlidePage(page_number) {
    if (!this.slide_script) {
      this._internalUpdate(page_number);
    }
  }
  updateTime(current_time) {
    this.current_time = current_time;
    if (this.slide_script) {
      let script_page = 1;
      _.all(this.slide_script,(s) => {
        if (s.time <= current_time) {
          script_page = s.page_number;
          return true;
        } else {
          return false;
        }
      });
      this._internalUpdate(script_page);
    }
  }
  isReady() {
    return true;
  }
  getSlidePage() {
    return this.page_number;
  }

  hasPresentation() {
    return this.video.slide_count > 0;
  }
  hasPageControls() {
    let ret = false;
    if (!this.video.slide_script && this.hasPresentation()) {
      if (this.user.is_admin) {
        ret = true;
      } else if (!this.video.slide_admin_page_control) {
        ret = true;
      }
    }
    return ret;
  }
  sendPageNumber(page_number) {
    const opts = {
      url: '/client/1/channel_video/' + this.video_id + '/slide_page',
      body: {
        page_number,
      },
    };
    this._internalUpdate(page_number);
    UserStore.userPost(opts,(err) => {
      if (err) {
        util.errorLog("SlideStore.sendPageNumber: err:",err);
      }
    });
  }
}

function getStore(arg) {
  let channel_video_id;
  if (arg.channel_video_id) {
    channel_video_id = arg.channel_video_id;
  } else {
    channel_video_id = arg;
  }

  if (!(channel_video_id in g_storeMap)) {
    g_storeMap[channel_video_id] = new SlideStore(channel_video_id);
  }
  return g_storeMap[channel_video_id];
}
function updateSlidePage(arg,page_number) {
  const store = getStore(arg);
  store.updateSlidePage(page_number);
}
function updateTime(arg,current_time) {
  const store = getStore(arg);
  store.updateTime(current_time);
}

export default {
  getStore,
  updateSlidePage,
  updateTime,
};
