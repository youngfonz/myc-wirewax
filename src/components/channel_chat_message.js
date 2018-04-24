'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';

import Avatar from './avatar.js';

import ChatStore from '../stores/chat_store.js';
import ChannelVideoStore from '../stores/channel_video_store.js';

export default class ChannelChatMessage extends React.Component {
  constructor(props,context) {
    super(props,context);

    this.chat_store = ChatStore.getStore(props.channelVideo);
    this.video_store = ChannelVideoStore.getStore(props.channelVideo);

    this._onLikeClick = this._onLikeClick.bind(this);
    this._onPromoteClick = this._onPromoteClick.bind(this);
    this._onDeleteClick = this._onDeleteClick.bind(this);
    this._onPinClick = this._onPinClick.bind(this);
    this._onUnpinClick = this._onUnpinClick.bind(this);
    this._onApproveClick = this._onApproveClick.bind(this);
  }
  static propTypes = {
    message: React.PropTypes.object.isRequired,
  };
  static defaultProps = {
    className: "",
  };
  componentWillReceiveProps(newProps) {
    const old_channel_video_id = this.props.channelVideo.channel_video_id;
    const new_channel_video_id = newProps.channelVideo.channel_video_id;
    if (old_channel_video_id != new_channel_video_id) {
      this.chat_store = ChatStore.getStore(newProps.channelVideo);
    }
  }

  shouldComponentUpdate(nextProps,nextState) {
    const { props, state } = this;
    const diff = (
      props.className != nextProps.className
      || props.showSentiment != nextProps.showSentiment
      || !ChatStore.messageEqual(props.message,nextProps.message)
    );
    return diff;
  }

  _onLikeClick() {
    const { message } = this.props;
    const { message_id } = message;
    this.chat_store.likeMessage(message_id);

    this._fireEvent('like');
  }
  _onPromoteClick() {
    const { message } = this.props;
    const { message_id } = message;
    if (message.is_promoted) {
      this.chat_store.demoteMessage(message_id);
    } else {
      this.chat_store.promoteMessage({ message_id });
    }

    if (message.is_promoted) {
      this._fireEvent('demote');
    } else {
      this._fireEvent('promote');
    }
  }
  _onDeleteClick() {
    const { message } = this.props;
    const { message_id } = message;
    this.chat_store.deleteMessage(message_id);

    this._fireEvent('delete');
  }
  _onPinClick() {
    const { channelVideo } = this.props;
    if (channelVideo) {
      const { message } = this.props;
      const topic = message.message_text;
      this.video_store.setTopic(topic);

      this._fireEvent('pin');
    }
  }
  _onUnpinClick() {
    const { channelVideo } = this.props;
    if (channelVideo) {
      this.video_store.setTopic("");
      this._fireEvent('unpin');
    }
  }
  _onApproveClick() {
    const { message } = this.props;
    const { message_id } = message;
    this.chat_store.approveMessage(message_id);
    this._fireEvent('approve')
  }
  _fireEvent(phylum) {
    const { channelVideo, message } = this.props;
    if (channelVideo) {
      const { message_id } = message;
      const { channel_video_id } = channelVideo;
      const props = {
        kingdom: 'chat',
        phylum,
        genus: message_id,
        species: channel_video_id,
      };
      DataCortex.event(props);
    }
  }

  render() {
    const {
      message,
      user,
      showSentiment,
      channelVideo,
      topic,
    } = this.props;
    const { user: message_user } = message;

    let promote = null;
    let del = null;
    let pin = null;
    if (user.is_admin) {
      if (!message.is_promoted) {
        promote = (
          <div
            className='button promote'
            title="Ignite Message"
            onClick={this._onPromoteClick}
          >
            <div className='icon' />
          </div>
        );
      }
      if (message.message_text == topic) {
        pin = (
          <div
            className='button pin unpin'
            title="Unpin Message"
            onClick={this._onUnpinClick}
          >
            <div className='icon' />
          </div>
        );
      } else {
        pin = (
          <div
            className='button pin'
            title="Pin Message"
            onClick={this._onPinClick}
          >
            <div className='icon' />
          </div>
        );
      }
    }
    if (user.is_admin || user.user_id == message_user.user_id) {
      del = (
        <div
          className='button delete'
          title="Delete Message"
          onClick={this._onDeleteClick}
        >
          <div className='icon' />
        </div>
      );
    }
    if (!message.time_s) {
      message.time_s = moment(message.created_datetime).format("HH:mm:ss A");
    }
    let sentiment = null;
    if (showSentiment && message.sentiment_score != null) {
      const score = message.sentiment_score;
      let icon = <span className='icon neutral'></span>
      if (score> 0) {
        icon = <span className='icon happy'></span>
      } else if (score < 0) {
        icon = <span className='icon sad'></span>
      }
      sentiment = (
        <span className='sentiment'>
          <span>&#40;</span>
          {icon}
          <span>{message.sentiment_score}</span>
          <span>&#41;</span>
        </span>
      );
    }

    let like_reaction = null;
    let buttons = null;
    let moderate_action = null;
    if (message.like_count > 0) {
      let click = null;
      let cls = 'reaction like';
      let title;
      if (message.is_liked_by_me) {
        cls += ' active';
        title = 'Message sparked by you';
      } else {
        title = 'Click to spark message';
        click = this._onLikeClick;
      }
      like_reaction = (
        <div className={cls} title={title} onClick={click}>
          <div className='icon like' />
          <div className='count'>{message.like_count}</div>
        </div>
      );
    }
    if (channelVideo.is_moderated && user.is_admin && !message.is_moderator_approved) {
      moderate_action = (
        <div className='moderate' onClick={this._onApproveClick}>
          Approve Message
        </div>
      );
      buttons = (
        <div className='buttons'>
          {moderate_action}
          <div className='reject' onClick={this._onDeleteClick}>
            Reject
          </div>
        </div>
      );
    } else if (message.like_count == 0 || user.is_admin || !message.is_liked_by_me) {
      let like = null;
      if (!message.like_count) {
        like = (
          <div
            className='button like'
            title="Spark this message"
            onClick={this._onLikeClick}
          >
            <div className='icon spark' />
          </div>
        );
      }

      buttons = (
        <div className='buttons'>
          {promote}
          {pin}
          {del}
          {like}
        </div>
      );
    }

    let promote_reaction = null;
    if (message.is_promoted || (user.is_admin && like_reaction)) {
      let cls = 'reaction promote';
      let title;
      let click = null;
      if (!user.is_admin) {
        cls += ' active';
        title = 'Message was ignited';
      } else if (message.is_promoted) {
        cls += ' active';
        title = 'Click to un-ignite message';
        click = this._onPromoteClick;
      } else {
        title = 'Click to ignite message';
        click = this._onPromoteClick;
      }
      promote_reaction = (
        <div className={cls} title={title} onClick={click}>
          <div className='icon promote' />
        </div>
      );
    }

    return (
      <div className={"message " + this.props.className}>
        <Avatar user={message_user} />
        <div className='middle-chat-message'>
          <div className='user-time'>
            <div className='user'>@{message_user.user_name}</div>
            <div className='time'>{message.time_s}</div>
          </div>
          <div className='text'>
            {message.message_text}
            {sentiment}
          </div>
          <div className='reaction-list'>
            {moderate_action}
            {like_reaction}
            {promote_reaction}
          </div>
        </div>
        {buttons}
      </div>
    );
  }
}
