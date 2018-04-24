'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';
import uuid from 'node-uuid';

import util from '../util.js';

import Avatar from './avatar.js';
import ChannelChatMessage from './channel_chat_message.js';
import Input from './input.js';
import Loading from './loading.js';
import PureComponent from './pure_component.js';

import ChannelVideoStore from '../stores/channel_video_store.js';
import ChatStore from '../stores/chat_store.js';

require('../../css/comment_sidebar.less');

const CHAT_TYPES = [
  { type: 'promoted', text: 'Ignite', title: 'Ignited Messages' },
  { type: 'liked', text: 'Spark', title: 'Sparked Messages' },
  { type: 'all', text: 'Chat', title: 'All Messages' },
];

export default class CommentSidebar extends PureComponent {
  constructor(props,context) {
    super(props,context);

    this.state = {
      selected_type: 'all',
      topic: null,
      is_sentiment_enabled: false,
      is_message_sending: false,
      message_list: false,
    };
    this.should_scroll_bottom = true;
    this._newMessage();
    this.video_id = props.channelVideo.channel_video_id;

    this.chat_store = null;
    this.video_store = null;

    this._onChatUpdate = this._onChatUpdate.bind(this);
    this._onVideoUpdate = this._onVideoUpdate.bind(this);

    this._focusInput = this._focusInput.bind(this);
    this._onSendClick = this._onSendClick.bind(this);
  }
  static propTypes = {
    channel: React.PropTypes.object.isRequired,
    channelVideo: React.PropTypes.object,
    channelConference: React.PropTypes.object
  };
  static defaultProps = {
    channelVideo: null,
    channelConference: null
  };

  componentWillReceiveProps(newProps) {
    const new_video_id = newProps.channelVideo.channel_video_id;

    if (this.video_id != new_video_id) {
      this._removeListener();
      this.setState({ topic: null, message_list: false });
      this.should_scroll_bottom = true;
      this.video_id = new_video_id;

      this._addListener();
    }
  }
  componentDidMount() {
    this._addListener();
  }
  componentWillUnmount() {
    this._removeListener();
  }
  _addListener() {
    if (!this.chat_store) {
      this.chat_store = ChatStore.getStore(this.video_id);
      this.chat_store.addChangeListener(this._onChatUpdate);
      this.chat_store.fetch();
      this._onChatUpdate();
    }
    if (!this.video_store) {
      this.video_store = ChannelVideoStore.getStore(this.video_id);
      this.video_store.addChangeListener(this._onVideoUpdate);
      this.video_store.fetch();
      this._onVideoUpdate();
    }
  }
  _removeListener() {
    if (this.chat_store) {
      this.chat_store.removeChangeListener(this._onChatUpdate);
      this.chat_store = null;
    }
    if (this.video_store) {
      this.video_store.removeChangeListener(this._onVideoUpdate);
      this.video_store = false;
    }
  }
  componentWillUpdate() {
    if (!this.should_scroll_bottom && 'comment_list' in this.refs) {
      const node = this.refs.comment_list;
      this.should_scroll_bottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
    }
  }
  componentDidUpdate() {
    if (this.should_scroll_bottom && 'comment_list' in this.refs) {
      this.should_scroll_bottom = false;
      const node = this.refs.comment_list;
      node.scrollTop = node.scrollHeight;
    }
  }
  scrollToBottom() {
    this.should_scroll_bottom = true;
  }
  _newMessage() {
    this.message_guid = uuid.v4();
    this.created_datetime = false;
  }
  _onChatUpdate() {
    const message_list = this.chat_store.getMessageList();
    this.setState({ message_list });
  }
  _onVideoUpdate() {
    const video = this.video_store.getVideo();
    if (video) {
      this.setState({ topic: video.topic });
    }
  }
  _focusInput(e) {
    e && e.stopPropagation && e.stopPropagation();
    this.refs.input.focus();
  }
  _onSendClick(e) {
    util.stopAll(e);
    const { channelVideo, channelConference } = this.props;
    const message_text = this.refs.input.value;

    if (message_text == '/sentiment') {
      const is_sentiment_enabled = !this.state.is_sentiment_enabled;
      this.setState({ is_sentiment_enabled });

      this.chat_store.enableSentimentBot(is_sentiment_enabled);
      DataCortex.event({
        kingdom: 'chat',
        phylum: 'sentiment_toggle',
        genus: is_sentiment_enabled,
        species: this.video_id
      });

    } else {
      const { message_guid } = this;

      if (message_text) {
        if (!this.created_datetime) {
          this.created_datetime = new Date();
        }
        const opts = {
          created_datetime: this.created_datetime,
          message_guid,
          message_text,
        };
        this.setState({ is_message_sending: true });
        this.chat_store.sendMessage(opts,(err) => {
          this.setState({ is_message_sending: false });
          if (err) {
            window.alert("Failed to send message, please try again.");
          } else {
            this.scrollToBottom();
            this._newMessage();
            DataCortex.event({
              kingdom: 'chat',
              phylum: 'new_message',
              species: this.video_id,
            });
          }
        });
      }
    }

    this.refs.input.value = "";
  }

  render() {
    const {
      messageText,
      channel,
      channelVideo,
      channelConference,
      user,
    } = this.props;
    const {
      selected_type,
      topic,
      is_sentiment_enabled,
      is_message_sending,
      message_list,
    } = this.state;
    const disabled = is_message_sending;

    let chat = null;
    let topic_header = null;
    if (!message_list) {
      chat = <Loading />;
    } else {
      let list = _.filter(message_list,(m) => {
        let ret;
        if (m.is_deleted) {
          ret = false;
        } else if (m.message_text.length == 0) {
          ret = false;
        } else if (channelVideo.is_moderated && !m.is_moderator_approved && !user.is_admin) {
          ret = false;
        } else {
          ret = true;
        }
        return ret;
      });
      if (selected_type == 'liked') {
        list = _.filter(list,(m) => m.like_count > 0);
      } else if (selected_type == 'promoted') {
        list = _.where(list,{ is_promoted: true });
      }
      chat = _.map(list,(m,i) => {
        return (
          <ChannelChatMessage
            key={m.message_guid}
            className={i == message_list.length - 1 ? "last" : ""}
            channel={channel}
            channelVideo={channelVideo}
            message={m}
            user={user}
            showSentiment={is_sentiment_enabled}
            topic={topic}
          />
        );
      });

    }
    if (topic) {
      topic_header = (
        <div className='pinned'>
          <div className='topic'>Discussion Topic</div>
          <div className='message-text'>{topic}</div>
        </div>
      );
    }

    const types = _.map(CHAT_TYPES,(t) => {
      return (
        <div
          key={t.type}
          className={'chat-type ' + t.type + (t.type == selected_type ? ' active' : '')}
          onClick={() => this.setState({ selected_type: t.type })}
          title={t.title}
        >
          <div className='text-icon'>
            <div className='icon'/>
            <div className='text'>{t.text}</div>
          </div>
          <div className='line' />
        </div>
      );
    });

    const content = (
      <div className="comment-container" onClick={util.stopAll}>
        <div className="header">
          {types}
        </div>
        {topic_header}
        <div className='middle'>
          <div ref="comment_list" className="comment-list">
            {chat}
          </div>
        </div>
        <div
          className="input-container"
          onClick={this._focusInput}
        >
          <div className='avatar-input'>
            <Avatar user={user} />
            <form onSubmit={this._onSendClick}>
              <input
                ref="input"
                placeholder="add your comment here"
                autoFocus={!window.IS_IPHONE}
                />
            </form>
          </div>
          <div className='button-container'>
            <div className='send-button' onClick={this._onSendClick}>
              Send
            </div>
          </div>
        </div>
      </div>
    );
    return content;
  }
}
