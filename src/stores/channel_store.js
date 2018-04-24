'use strict';

import EventEmitter from 'events';
import async from 'async';
import _ from 'lodash';

import util from '../util.js';
import UserStore from './user_store.js';
import MycApi from '../myc_api.js';

const CHANGE_EVENT = "change";

class ChannelStore {
  constructor() {
    this.eventEmitter = new EventEmitter();
    this.user = false;
    this.channelList = false;
    this.channelDetailMap = {};
    this.channelVideoViewMap = {};

    UserStore.addChangeListener(this._onUserUpdate.bind(this));
  }
  addChangeListener(callback) {
    this.eventEmitter.on(CHANGE_EVENT,callback);
  }
  removeChangeListener(callback) {
    this.eventEmitter.removeListener(CHANGE_EVENT,callback);
  }
  _onUserUpdate(tag) {
    this.user = UserStore.getUser();
    if (!this.user) {
      this._updateChannels(false);
      this.eventEmitter.emit(CHANGE_EVENT,tag);
    } else {
      this.fetch(tag);
    }
  }
  _updateChannels(channelList,tag) {
    if (!util.deepEqual(this.channelList,channelList)) {
      this.channelList = channelList;
      this.eventEmitter.emit(CHANGE_EVENT,tag);
    }
  }
  _updateChannelDetails(channel,tag) {
    const { channel_id } = channel;
    const old_channel = this.channelDetailMap[channel_id];
    if (!util.deepEqual(old_channel,channel)) {
      this.channelDetailMap[channel_id] = channel;
      this.eventEmitter.emit(CHANGE_EVENT,tag);
    }
  }

  fetch(tag,done = function() {}) {
    if (typeof tag == 'function') {
      done = tag;
      tag = null;
    }

    if (this.is_fetching) {
      //console.log("ChannelStore.fetch skip");
    } else {
      this.is_fetching = true;
      const opts = {
        url: '/client/1/channel',
      };
      UserStore.userGet(opts,(err,body) => {
        this.is_fetching = false;

        let channel_list = [];
        if (err) {
          util.errorLog("ChannelStore.fetch: err:",err);
        } else if (!body.channel_list) {
          util.errorLog("ChannelStore.fetch: no channel list?",err,body);
          err = "no_channels";
        } else {
          channel_list = body.channel_list;
          this._updateChannels(channel_list,tag);
        }
        done(err,channel_list);
      });
    }
  }

  fetchUserList(channel_id,done) {
    const opts = {
      url: '/client/1/channel/' + channel_id + '/user',
    };
    UserStore.userGet(opts, (err,body) => {
      let user_list;
      if (err) {
        util.errorLog("ChannelStore.fetchUserList: err:",err);
      } else if (!body.user_list) {
        util.errorLog("ChannelStore.fetchUserList: no user list?", err, body);
        err = "no_users";
      } else {
        user_list = body.user_list;
      }
      done(err,user_list);
    });
  }

  getChannels() {
    return this.channelList || [];
  }
  getChannel(channel_id) {
    const channel = _.find(this.channelList,(c) => c.channel_id == channel_id);
    return channel || false;
  }

  isReady() {
    return this.channelList !== false;
  }

  getChannelUserList(channel_id, done=() => {}) {
    const opts = {
      url: '/client/1/channel/' + channel_id + '/user'
    };

    UserStore.userGet(opts, (err,body) => {
      if (err) {
        util.errorLog("ChannelStore.getChannelUserList: err:",err);
      } else if (!body.user_list) {
        util.errorLog("ChannelStore.getChannelUserList: no user list?", err, body);
        err = "no_users";
      } else {
        const channel = _.find(this.channelList,(c) => c.channel_id == channel_id);
        if (channel) {
          channel.user_list = body.user_list;
          this.channelDetailMap[channel_id].user_list = body.user_list;
          this.eventEmitter.emit(CHANGE_EVENT, null);
        } else {
          util.errorLog("ChannelStore.getChannelUserList: no channel?",{ err, body });
          err = "no_channel";
        }
      }
      done(err);
    });
  }

  deleteChannel(channel,done) {
    const { channel_id } = channel;
    const opts = {
      url: '/client/1/channel/' + channel_id,
    };
    UserStore.userDelete(opts, (err, body) => {
      if (err) {
        util.errorLog("ChannelStore.deleteChannel: err:",err,body);
      }
      this.fetch('delete',done);
    });
  }

  saveChannel(params, done) {
    let {
      channel_id,
      channel_name,
      image_file,
      user_list,
      is_private,
    } = params;
    const track_progress = params.track_progress || function() {};

    let url = '/client/1/channel';
    if (channel_id) {
      url += '/' + channel_id;
    }

    const body = new FormData();
    if (channel_name) {
      body.append('channel_name',channel_name);
    }
    if (image_file) {
      body.append('image_file',image_file);
    }
    if (user_list) {
      const user_id_list = _.map(user_list,(c) => c.user_id);
      body.append('user_list_json',JSON.stringify(user_id_list));
    }
    if (is_private !== undefined) {
      body.append('is_private',is_private);
    }

    const opts = { url, body, track_progress };
    UserStore.userPost(opts, (err, body) => {
      if (err) {
        util.errorLog("ChannelStore.saveChannel: err:",err,body);
        done(err);
      } else {
        if (!channel_id) {
          channel_id = body.channel_id;
        }
        this.fetch('new');
        done(null,channel_id);
      }
    });
  }

  shareChannel(opts,done) {
    const {
      channel,
      user_list,
    } = opts;

    const { channel_id } = channel;
    const user_id_list = _.map(user_list,(c) => c.user_id);
    const post_opts = {
      url: '/client/1/channel/' + channel_id + '/share',
      body: {
        user_list: user_id_list,
      },
    };
    UserStore.userPost(post_opts,(err,body) => {
      if (err) {
        util.errorLog("ChannelStore.shareChannel: err:",err,body);
      }
      done(err);
    });
  }
  leaveChannel(channel_id,done) {
    const post_opts = {
      url: '/client/1/channel/' + channel_id + '/leave',
    };
    UserStore.userPost(post_opts,(err,body) => {
      if (err) {
        util.errorLog("ChannelStore.leaveChannel: err:",err,body);
        done(err);
      } else {
        this.fetch('leave',() => done(null));
      }
    });
  }
  channelVideoLikeCount(channel_video) {
    return channel_video.like_count;
  }
  viewChannelVideo(channel_video_id) {
    if (!(channel_video_id in this.channelVideoViewMap)) {
      this.channelVideoViewMap[channel_video_id] = true;
      const post_opts = {
        url: '/client/1/channel_video/' + channel_video_id + '/view',
      };
      UserStore.userPost(post_opts,(err,body) => {
        if (err) {
          util.errorLog("ChannelStore.viewChannelVideo: err:",err,body);
        }
      });
    }
  }
  getChannelPreview({ channel_id, invite_token },done = function() {}) {
    const opts = {
      url: '/client/1/channel/' + channel_id + '/preview',
      body: {
        invite_token,
      },
    };
    MycApi.post(opts,(err,body) => {
      let preview_video;
      if (err) {
        util.errorLog("ChannelStore.getChannelPreview: err:",err,body);
      } else {
        preview_video = body.preview_video;
      }
      done(err,preview_video);
    });
  }

  createConference({ channel_id, conference_name },done = function() {}) {
    const opts = {
      url: '/client/1/channel/' + channel_id + '/conference',
      body: {
        conference_name,
      },
    };
    UserStore.userPost(opts,(err,body) => {
      let conference_id;
      if (err) {
        util.errorLog("ChannelStore.createConference: err:",err,body);
      } else {
        conference_id = body.conference_id;
      }
      done(err,conference_id);
    });
  }
  saveVideo(params,done = function() {}) {
    const {
      channel_id,
      video_id,
      track_progress,
      slide_script,
    } = params;

    const props = ['title','tags','topic','stream_name','is_moderated',
      'video_file','image_file','slide_file','hold_image_file',
      'remove_slide_file','remove_hold_image_file',
      'start_datetime','end_datetime'];

    const form_data = new FormData();
    _.each(props,(p) => {
      if (p in params) {
        form_data.append(p,params[p]);
      }
    });

    if (slide_script) {
      form_data.append('slide_script_json',JSON.stringify(slide_script));
    }

    let url = '';
    if (video_id) {
      url = '/client/1/channel_video/' + video_id;
    } else {
      url = '/client/1/channel/' + channel_id + '/video';
    }
    const opts = {
      url,
      body: form_data,
      track_progress,
    };
    UserStore.userPost(opts,(err,body) => {
      let channel_video_id;
      if (err) {
        util.errorLog("ChannelStore.saveVideo: err:",err,body);
      } else {
        channel_video_id = body.channel_video_id;
      }
      done(err,channel_video_id);
    });
  }
  createVideoReply(params,done = function() {}) {
    const {
      channel_video_id,
      track_progress,
      video_file,
      duration,
    } = params;

    const form_data = new FormData();
    form_data.append('video_file', video_file);
    form_data.append('duration', duration);

    const opts = {
      url: '/client/1/channel_video/' + channel_video_id + '/reply',
      body: form_data,
      track_progress,
    };
    UserStore.userPost(opts,(err,body) => {
      let channel_video_reply_id;
      if (err) {
        util.errorLog("ChannelStore.createVideoReply: err:", err, body);
      } else {
        channel_video_reply_id = body.channel_video_reply_id;
      }
      done(err, channel_video_reply_id);
    });
  }
  trimVideo(params,done = function() {}) {
    const {
      channel_id,
      video_id,
      head_seconds,
      tail_seconds,
      track_progress,
    } = params;

    const url = '/client/1/channel_video/' + video_id + '/video_trim';
    const body = {
      head_seconds,
      tail_seconds,
    };
    const opts = {
      url,
      body,
      track_progress,
    };
    UserStore.userPost(opts,(err,body) => {
      if (err) {
        util.errorLog("ChannelStore.trimVideo: err:",err,body);
      }
      done(err);
    });
  }
  modifyUserList(params,done = function() {}) {
    const {
      channel_id,
      add_email_list,
      remove_user_list
    } = params;
    const url  = '/client/1/channel/' + channel_id + '/user_list';
    const body = {};
    if (add_email_list) {
      body.add_email_list = add_email_list;
    }
    if (remove_user_list) {
      body.remove_user_list = remove_user_list;
    }

    const opts = {
      url,
      body,
    };
    UserStore.userPost(opts,(err,body) => {
      if (err) {
        util.errorLog("ChannelStore.addUsers: err:",err,body);
      }
      done(err);
    });
  }
}

const g_store = new ChannelStore();

export default g_store;
