'use strict';

import EventEmitter from 'events';
import async from 'async';
import _ from 'lodash';

import storage from '../storage.js';
import util from '../util.js';
import ServerPush from '../server_push.js';

import UserStore from './user_store.js';
import SlideStore from './slide_store.js';
import ChannelVideoStore from './channel_video_store.js';

const CHANGE_EVENT = "change";
const POLL_MS = 5*1000;

const g_storeMap = {};

class ChatStore {
  constructor(video_id) {
    this.eventEmitter = new EventEmitter();
    this.fetch_lock = false;
    this.timer = false;
    this.is_sentiment_bot_enabled = false;
    this.max_datetime = false;
    this.user = UserStore.getUser();
    this.message_list = [];
    this.video_id = video_id;

    this.server_push = ServerPush.getChannel(video_id);
    this._onPushMessage = this._onPushMessage.bind(this);
  }
  addChangeListener(callback) {
    this.eventEmitter.on(CHANGE_EVENT,callback);
    this._checkPoll();
  }
  removeChangeListener(callback) {
    this.eventEmitter.removeListener(CHANGE_EVENT,callback);
    this._checkPoll();
  }
  _checkPoll() {
    const listeners = this.eventEmitter.listenerCount(CHANGE_EVENT);
    if (listeners > 0) {
      this._startPoll();
    } else {
      this._stopPoll();
    }
  }
  _stopPoll() {
    if (this.timer) {
      this.server_push.removeListener(ServerPush.CHAT_PUSH_EVENT,this._onPushMessage);
      clearInterval(this.timer);
      this.timer = false;
    }
  }
  _startPoll() {
    if (!this.timer) {
      this.timer = setInterval(this._poll.bind(this),POLL_MS);
      this.server_push.addListener(ServerPush.CHAT_PUSH_EVENT,this._onPushMessage);
    }
  }
  _poll() {
    if (this.server_push.isSubscribed()) {
      // Should be low frequency poll here
    } else {
      this.fetch("periodic");
    }
  }
  _onPushMessage(data) {
    if (data.message) {
      this._updateMessageList([data.message]);
    }
  }

  _updateMessageList(message_list,tag) {
    const old_message_list = this.message_list;
    const new_message_list = _mergeLists(old_message_list,message_list);
    _.each(new_message_list,(m) => {
      if (_isMessageLiked(m.message_id)) {
        m.is_liked_by_me = true;
      }
    });

    if (!util.deepEqual(old_message_list,new_message_list)) {
      this.message_list = new_message_list;
      this.eventEmitter.emit(CHANGE_EVENT,tag,message_list);
    }
  }
  _getMessage(message_id) {
    let ret = _.findWhere(this.message_list,{ message_id });
    if (ret) {
      ret = _.extend({},ret);
    }
    return ret;
  }
  _pushMessage(message) {
    const message_list = this.message_list;
    let message_id = 0;
    if (message_list.length > 0) {
      message_id = message_list[message_list.length - 1].message_id + 0.1;
    }
    const new_mesage = _.extend({},message,{
      message_id,
      message_guid: uuid.v4(),
      is_client_side: true,
      update_datetime: new Date(),
    });
    this._updateMessageList([new_message],"manual");
  }
  fetch(tag,done) {
    if (typeof tag == 'function') {
      done = tag;
      tag = null;
    }
    if (!done) {
      done = function() {};
    }

    if (this.fetch_lock) {
      done('skip');
    } else {
      this.fetch_lock = true;

      const channel_video_id = this.video_id;
      const max_datetime = this.max_datetime;
      const query = {
        channel_video_id,
      };
      if (max_datetime) {
        query.start_datetime = max_datetime;
      }

      const url = '/client/1/message';
      const opts = {
        url,
        query,
      };
      UserStore.userGet(opts,(err,body) => {
        this.fetch_lock = false;
        if (err) {
          util.errorLog("ChatStore.fetch: err:",err);
        } else if (body) {
          const {
            message_list,
            slide_page_number,
            max_datetime,
            topic,
          } = body;

          if (message_list) {
            this._updateMessageList(message_list,tag);
          }
          if (slide_page_number >= 0) {
            SlideStore.updateSlidePage(this.video_id,slide_page_number);
          }
          if (max_datetime) {
            this.max_datetime = max_datetime;
          }
          if (topic) {
            ChannelVideoStore.updateTopic(this.video_id,topic);
          }
        } else {
          util.errorLog("ChatStore.fetch: bad body");
        }
        done(err);
      });
    }
  }
  isReady() {
    return true;
  }
  getMessageList() {
    return this.message_list;
  }
  sendMessage(params,done = function() {}) {
    params.channel_video_id = this.video_id;
    const opts = {
      url: '/client/1/message',
      body: params,
    };
    UserStore.userPost(opts,(err,body) => {
      if (err && err == 409) {
        util.errorLog("ChatStore.sendMessage: dup for guid:",params.message_guid);
        err = null;
      } else if (err) {
        util.errorLog("ChatStore.sendMessage: err:",err,body);
      } else {
        const message = _.extend({},params,{
          updated_datetime: params.created_datetime,
          user: this.user,
          is_client_side: true,
          message_id: body.message_id,
          message_text: body.message_text,
          sentiment_score: body.sentiment_score,
        });
        const message_list = [message];
        if (body.is_filtered) {
          const bot_message = {
            updated_datetime: params.created_datetime,
            user: {
              user_name: "ContentBot",
            },
            is_client_side: true,
            message_id: body.message_id + 0.5,
            message_guid: uuid.v4(),
            message_text: FILTERED_MESSAGE,
          };
          message_list.push(bot_message);
        }
        this._updateMessageList(message_list,"send");
      }
      done(err);
    });
  }

  likeMessage(message_id,done = function() {}) {
    const opts = {
      url: '/client/1/message/' + message_id + '/like',
    };
    UserStore.userPost(opts,(err,body) => {
      if (err) {
        util.errorLog("ChatStore.likeMessage: err:",err,body);
      } else {
        const message = this._getMessage(message_id);
        if (message) {
          message.like_count++;
          message.is_liked_by_me = true;
          this._updateMessageList([message],"like");
        }
        _addMessageLike(message_id);
      }
      done(err);
    });
  }
  promoteMessage({ message_id, demote },done = function() {}) {
    const opts = {
      url: '/client/1/message/' + message_id + '/promote',
    };
    const func = demote ? UserStore.userDelete : UserStore.userPost;
    func(opts,(err,body) => {
      if (err) {
        util.errorLog("ChatStore.promoteMessage: err:",err,body);
      } else {
        const message = this._getMessage(message_id);
        if (message) {
          message.is_promoted = !demote;
          this._updateMessageList([message],"promote");
        }
      }
      done(err);
    });
  }
  demoteMessage(message_id,done) {
    this.promoteMessage({ message_id, demote: true },done);
  }
  deleteMessage(message_id,done = function() {}) {
    const opts = {
      url: '/client/1/message/' + message_id,
    };
    UserStore.userDelete(opts,(err,body) => {
      if (err) {
        util.errorLog("ChatStore.deleteMessage: err:",err,body);
      } else {
        const message = this._getMessage(message_id);
        if (message) {
          message.is_deleted = true;
          this._updateMessageList([message],"delete");
        }
      }
      done(err);
    });
  }
  approveMessage(message_id,done = function() {}) {
    const opts = {
      url: '/client/1/message/' + message_id + '/approve',
    };
    UserStore.userPost(opts,(err,body) => {
      if (err) {
        util.errorLog("ChatStore.approveMessage: err:",err,body);
      } else {
        const message = this._getMessage(message_id);
        if (message) {
          message.is_moderator_approved = true;
          this._updateMessageList([message],"approve");
        }
      }
      done(err);
    });
  }
  isSentimentBotEnabled() {
    return this.is_sentiment_bot_enabled;
  }
  enableSentimentBot(enable) {
    this.is_sentiment_bot_enabled = enable;
    const bot_message = {
      user: {
        user_name: "SentimentBot",
      },
      message_text: "Sentiment scores disabled.",
    };
    if (enable) {
      bot_message.message_text = "Sentiment scores enabled.";
    }
    this._pushMessage(bot_message);
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
    g_storeMap[channel_video_id] = new ChatStore(channel_video_id);
  }
  return g_storeMap[channel_video_id];
}

function _mergeLists(old_list = [],new_list = []) {
  const output = new_list.slice();
  _.each(old_list,(m) => {
    const { message_guid } = m;
    const other = _.findWhere(output,{ message_guid });
    if (!other) {
      output.push(m);
    }
  });
  output.sort((a,b) => a.message_id - b.message_id);
  return output;
}

function messageEqual(a,b) {
  util.deepEqual(a,b);
}

let g_messageLikeMap = {};
storage.get('myc.message-like-map',(err,result) => {
  if (!err && typeof result == 'object') {
    g_messageLikeMap = result;
  }
});

function _addMessageLike(message_id) {
  g_messageLikeMap[message_id] = true;
  storage.set('myc.message-like-map',g_messageLikeMap);
}
function _isMessageLiked(message_id) {
  return g_messageLikeMap[message_id] || false;
}

export default {
  getStore,
  messageEqual,
};
