'use strict';

import EventEmitter from 'events';
import async from 'async';
import _ from 'lodash';
import DataCortex from 'browser-data-cortex';

import util from '../util.js';
import MycApi from '../myc_api.js';
import storage from '../storage.js';

const RETRY_MS = 500;
const CHANGE_EVENT = "change";

const g_eventEmitter = new EventEmitter();
let g_user_session_key = false;
let g_user = false;
let g_is_ready = false;

storage.get('user_session_key',(err,value) => {
  if (!err && value) {
    g_user_session_key = value;
  }
  fetch('startup');
});

function once(callback) {
  g_eventEmitter.once(CHANGE_EVENT,callback);
}
function addChangeListener(callback) {
  g_eventEmitter.on(CHANGE_EVENT,callback);
}
function removeChangeListener(callback) {
  g_eventEmitter.removeListener(CHANGE_EVENT,callback);
}

function _updateUser(user,tag) {
  const user_tag = (user && user.user_id) || false;
  DataCortex.addUserTag(user_tag);

  if (!util.deepEqual(g_user,user)) {
    g_user = user;
    g_eventEmitter.emit(CHANGE_EVENT,tag);
  } else if (tag == 'startup') {
    g_eventEmitter.emit(CHANGE_EVENT,tag);
  }
}

function getSessionKey() {
  return g_user_session_key;
}

function userRequest(opts,done) {
  if (!g_user_session_key) {
    done('not_logged_in');
  } else {
    opts.headers = opts.header || {};
    opts.headers['X-MC-User-Session-Key'] = g_user_session_key;
    MycApi.request(opts,done);
  }
}
function userGet(opts,done) {
  opts.method = 'GET';
  userRequest(opts,done);
}
function userPost(opts,done) {
  opts.method = 'POST';
  userRequest(opts,done);
}
function userDelete(opts,done) {
  opts.method = 'DELETE';
  userRequest(opts,done);
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
    url: '/client/1/user/current',
  };
  userGet(args,(err,body) => {
    let user = false;

    if (err == 'not_logged_in' || err == 403) {
      // Not logged in
      user = false;
      err = null;
    } else if (err) {
      util.errorLog("UserStore.fetch: unknown err",err,body);
    } else if (!body.user || !body.user.user_id) {
      util.errorLog("UserStore.fetch: no user?",err,body);
      err = 'no_user';
    } else {
      user = body.user;
    }

    if (err) {
      // retry flow
      //setTimeout(fetch.bind(null,tag,done),RETRY_MS);
    } else {
      g_is_ready = true;
      _updateUser(user,tag);
    }
    done(err,user);
  });
}

function getUser() {
  return g_user;
}
function isLoggedIn() {
  return !!g_user;
}
function isReady() {
  return g_is_ready;
}
function loginSignup(email,done) {
  const opts = {
    url: '/client/1/user_login_signup',
    body: {
      email,
    },
  };
  MycApi.post(opts,(err,body) => {
    if (err && body && body.user_locked) {
      err = 'user_locked';
    } else if (err == 412) {
      err = 'no_whitelist';
    } else if (err) {
      util.errorLog("UserStore.loginSignup failed err:",err,"body:",body);
    }
    done(err);
  });
}

function loginToken({ email, login_token },done) {
  login_token = login_token.replace(/[^\d]/g,'');

  const opts = {
    url: '/client/1/user_login_token',
    body: {
      email,
      login_token,
    },
  };
  MycApi.post(opts,(err,body) => {
    if (err && body && body.user_locked) {
      err = 'user_locked';
    } else if (err && body && body.token_mismatch) {
      err = 'token_mismatch';
    } else if (err) {
      util.errorLog("UserStore.loginToken failed err:",err,"body:",body);
    } else if (body && body.user && body.user_session_key) {
      g_user_session_key = body.user_session_key;
      storage.set('user_session_key',g_user_session_key);

      _updateUser(body.user,'login');
    } else {
      err = 'no_user';
    }
    done(err,g_user);
  });
}
function loginInviteToken({ email, invite_token },done) {
  const opts = {
    url: '/client/1/user_login_invite_token',
    body: {
      email,
      invite_token,
    },
  };
  MycApi.post(opts,(err,body) => {
    if (err && err == 404) {
      err = 'not_found';
    } else if (err) {
      util.errorLog("UserStore.loginToken failed err:",err,"body:",body);
    } else if (body && body.user && body.user_session_key) {
      g_user_session_key = body.user_session_key;
      storage.set('user_session_key',g_user_session_key);

      _updateUser(body.user,'login');
    } else {
      err = 'no_user';
    }
    done(err,g_user);
  });
}
function logout(done = function() {}) {
  const opts = {
    url: '/client/1/user_logout',
  };
  userPost(opts,(err,body) => {
    if (err) {
      util.errorLog("UserStore.logout failed, err:",err,body);
    }
    g_user_session_key = false;
    storage.set('user_session_key',false);

    _updateUser(false,'logout');
    done();
  });
}
function updateOtherUser(opts, done=()=>{}) {
  const post_opts = {
    url: '/client/1/user/' + opts.user_id,
    body: opts.body,
  }
  userPost(post_opts, (err,body) => {
    if (err) {
      if (err == 409) {
        err = 'dup';
      } else {
        util.errorLog("UserStore.updateOtherUser failed, err:",err,body);
      }
      done(err);
    } else {
      fetch('update',() => done(err));
    }
  });
}

function updateUser(values,done = function() {}) {
  const opts = {
    url: '/client/1/user/current',
    body: values,
  };
  userPost(opts,(err,body) => {
    if (err) {
      if (err == 409) {
        err = 'dup';
      } else {
        util.errorLog("UserStore.updateUser failed, err:",err,body);
      }
      done(err);
    } else {
      fetch('update',() => done(err));
    }
  });
}
function clearInviteToken(token) {
  const opts = {
    url: '/client/1/user_clear_invite_token',
    body: {
      token,
    },
  };
  userPost(opts,(err,body) => {
    if (err) {
      util.errorLog("UserStore.clearInviteToken failed, err:",err,body);
    }
  });
}

export default {
  addChangeListener,
  removeChangeListener,
  once,
  getSessionKey,
  updateOtherUser,
  updateUser,
  loginSignup,
  loginToken,
  loginInviteToken,
  logout,
  fetch,
  getUser,
  isLoggedIn,
  isReady,
  userRequest,
  userGet,
  userPost,
  userDelete,
  clearInviteToken,
};
