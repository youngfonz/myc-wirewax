'use strict';

import EventEmitter from 'events';

import UserStore from './user_store.js';
import util from '../util.js';

const CHANGE_EVENT = "change";
const g_slidePageMap = {};
const g_eventEmitter = new EventEmitter();

let g_recentList = [];

function _updateRecent(new_list,tag) {
  if (!util.deepEqual(g_recentList,new_list)) {
    g_recentList = new_list;
    g_eventEmitter.emit(CHANGE_EVENT,tag);
  }
}

function addChangeListener(callback) {
  g_eventEmitter.on(CHANGE_EVENT,callback);
}
function removeChangeListener(callback) {
  g_eventEmitter.removeListener(CHANGE_EVENT,callback);
}

function fetchRecent(tag,done = function() {}) {
  if (typeof tag == 'function') {
    done = tag;
    tag = null;
  }
  const opts = {
    url: '/client/1/conference/recent',
  };
  UserStore.userGet(opts,(err,body) => {
    let new_list = [];
    if (err) {
      util.errorLog("ConferenceStore.fetchRecent: err:",err);
    } else if (!body.conference_list) {
      util.errorLog("ConferenceStore.fetchRecent: no list?",err,body);
      err = 'no_list';
    } else {
      new_list = body.conference_list;
      _updateRecent(new_list,tag);
    }
    done(err,new_list);
  });
}
function getPageNumber(conference) {
  const { conference_id } = conference;
  return g_slidePageMap[conference_id];
}
function getRecent() {
  return g_recentList || [];
}
function hasPageControls(conference) {
  const user = UserStore.getUser();
  let ret = false;
  if (hasPresentation(conference)) {
    if (user.is_admin) {
      ret = true;
    } else if ('slide_admin_page_control' in conference && !conference.slide_admin_page_control) {
      ret = true;
    }
  }
  return ret;
}
function hasPresentation(conference) {
  return conference.slide_id && conference.slide_count > 0;
}
function sendPageNumber(conference,page_number) {
  const { conference_id } = conference;
  const opts = {
    url: '/client/1/conference/' +  + '/slide_page',
    body: { page_number },
  };
  UserStore.userPost(opts,(err) => {
    setPageNumber(conference, page_number);
  });
}
function setPageNumber(conference, page_number) {
  const curr_page = getPageNumber(conference);
  if (page_number != curr_page) {
    const { conference_id } = conference;
    g_slidePageMap[conference_id] = page_number;
    g_eventEmitter.emit(CHANGE_EVENT);
  }
}
function shareConference(channel, conference, user_list, done=function() { }) {
  const { channel_id, conference_id, conference_name } = conference;
  const opts = {
    url: '/client/1/channel/' + channel_id + '/share/conference/' + conference_id,
    body: {
      user_list,
      title: conference_name,
      is_private: channel.is_private,
    },
  };

  UserStore.userPost(opts, (err) => {
    if(err) {
      util.errorLog("ConferenceStore.shareConference: err:",err);
    }
    done(err);
  });
}

export default {
  addChangeListener,
  removeChangeListener,
  fetchRecent,
  getPageNumber,
  getRecent,
  hasPageControls,
  hasPresentation,
  sendPageNumber,
  setPageNumber,
  shareConference,
};
