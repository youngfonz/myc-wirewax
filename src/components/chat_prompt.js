'use strict';

import React from 'react';

import PureComponent from './pure_component.js';
import ActivityPrompt from './activity_prompt.js';

import ChatStore from '../stores/chat_store.js';
import UserStore from '../stores/user_store.js';

import util from '../util.js';

require('../../css/emoji.less');

export default class ChatPrompt extends PureComponent {
  constructor(props, context) {
    super(props,context);
    this.state = {
      last_activity_time: Date.now(),
    };

    this.video_id = props.video.channel_video_id;
    this.chat_store = null;

    this._onChatUpdate = this._onChatUpdate.bind(this);
  }
  componentDidMount() {
    this._addListener();
  }
  componentWillUnmount() {
    this._removeListener();
  }
  componentWillReceiveProps(nextProps) {
    const video_id = nextProps.video.channel_video_id;
    if (this.video_id != video_id) {
      this._removeListener();
      this.video_id = video_id;
      this._addListener();
      this.setState({ last_activity_time: Date.now() });
    }
  }

  _addListener() {
    if (!this.chat_store) {
      this.chat_store = ChatStore.getStore(this.video_id);
      this.chat_store.addChangeListener(this._onChatUpdate);
    }
  }
  _removeListener() {
    if (this.chat_store) {
      this.chat_store.removeChangeListener(this._onChatUpdate);
      this.chat_store = null;
    }
  }
  _onChatUpdate(tag,message_list) {
    if (message_list && message_list.length > 0) {
      _.some(message_list,(m) => {
        if (m.is_client_side) {
          this.setState({ last_activity_time: Date.now() });
        }
        return m.is_client_side;
      });
    }
  }
  render() {
    const { video } = this.props;
    const { last_activity_time } = this.state;

    let content = null;
    if (video.is_live_only) {
      content = (
        <ActivityPrompt
          className='chat-prompt'
          text="Your the conversation! Hit the chat icon and join in."
          lastActivityTime={last_activity_time}
        />
      );
    }
    return content;
  }
}
