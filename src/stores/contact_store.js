'use strict';

import EventEmitter from 'events';
import async from 'async';
import _ from 'lodash';

import util from '../util.js';

import UserStore from './user_store.js';

const CHANGE_EVENT = "change";

const g_eventEmitter = new EventEmitter();
let g_contactList = false;
UserStore.addChangeListener(_onUserUpdate);
_onUserUpdate();

function addChangeListener(callback) {
  g_eventEmitter.on(CHANGE_EVENT,callback);
}
function removeChangeListener(callback) {
  g_eventEmitter.removeListener(CHANGE_EVENT,callback);
}
function _onUserUpdate() {
  const user = UserStore.getUser();
  if (!user) {
    g_contactList = false;
  }
}
function _updateContacts(contactList,tag) {
  if (!util.deepEqual(g_contactList,contactList)) {
    g_contactList = contactList;
    g_eventEmitter.emit(CHANGE_EVENT,tag);
  }
}

function fetch(tag,done) {
  if (typeof tag == 'function') {
    done = tag;
    tag = null;
  }
  if (!done) {
    done = function() {};
  }
  const args = {
    url: '/client/2/user',
  };
  UserStore.userGet(args,(err,body) => {
    let contact_list = [];
    if (err) {
      util.errorLog("ContactStore.fetch: err:",err);
    } else if (!body.user_list) {
      util.errorLog("ContactStore.fetch: no user list?",err,body);
      err = "no_users";
    } else {
      contact_list = body.user_list;
      _updateContacts(contact_list,tag);
    }
    done(err,contact_list);
  });
}
function getContacts() {
  return g_contactList || [];
}
function isReady() {
  return g_contactList !== false;
}
function getTopContacts(args) {
  let search = "";
  let count = 20;
  let exclude_list = false;
  if (typeof args == 'object') {
    search = args.search || "";
    count = args.count || 20;
    exclude_list = args.exclude_list || false;
  } else {
    search = args;
  }
  search = search.toLowerCase();

  const contact_list = getContacts();
  let diff_list = contact_list;
  if (exclude_list && exclude_list.length > 0) {
    diff_list = _.filter(contact_list,(c) => {
      return !_.findWhere(exclude_list,{ user_id: c.user_id });
    });
  }
  let list = _.map(diff_list,_scoreContact.bind(null,search));
  if (search) {
    list = _.filter(list,(c) => c.score > 1);
  }
  _.sortBy(list,(o) => {
    let score = o.score;
    if (score < 10) {
      score = "0" + score;
    }
    return score + o.email;
  });
  list = list.slice(0,count);
  return list;
}

function _scoreContact(search,c) {
  let score = c.user_photo_url ? 1 : 0;

  if (search) {
    const PROPS = ['user_name','email'];
    _.each(PROPS,(prop) => {
      const value = (c[prop] || "").toLowerCase();
      let index = value.indexOf(search);
      if (index == 0) {
        score += 20;
      } else if (index > 0) {
        score += 10
      }
    });
  }
  return _.extend({},c,{
    score: Math.min(21,score),
  });
}

export default {
  addChangeListener,
  removeChangeListener,
  fetch,
  getContacts,
  getTopContacts,
  isReady,
};
