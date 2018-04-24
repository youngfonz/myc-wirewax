'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';

import util from './util.js';

import ChannelEdit from './components/channel_edit.js';
import ContentFrame from './components/content_frame.js';
import LoadingOverlay from './components/loading_overlay.js';
import PureComponent from './components/pure_component.js';

import ChannelStore from './stores/channel_store.js';
import ChannelVideoStore from './stores/channel_video_store.js';
import UserStore from './stores/user_store.js';

require('../css/admin_channel.less');

export default class AdminChannel extends PureComponent {
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    const { user, channel_id } = props.params;
    this.state = {
      channel: false,
      channel_id,
      user,
    };

    DataCortex.event({
      kingdom: 'page_view',
      phylum: 'admin_channel',
      species: channel_id,
    });

    this._onUserUpdate = this._onUserUpdate.bind(this);
    this._onChannelUpdate = this._onChannelUpdate.bind(this);

    this._onCancelEdit = this._onCancelEdit.bind(this);
    this._onSaveClick = this._onSaveClick.bind(this);
    this._onAddContent = this._onAddContent.bind(this);
  }
  componentWillReceiveProps(newProps) {
    const { channel_id } = newProps.params;
    this.setState({ channel_id });
    ChannelStore.fetch();

    this._onChannelUpdate();
    this._onUserUpdate();
  }
  componentDidMount() {
    UserStore.addChangeListener(this._onUserUpdate);

    const { channel_id } = this.props.params;
    ChannelStore.addChangeListener(this._onChannelUpdate);
    ChannelStore.fetch();

    this._onChannelUpdate();
    this._onUserUpdate();
  }
  componentWillUnmount() {
    ChannelStore.removeChangeListener(this._onChannelUpdate);
    UserStore.removeChangeListener(this._onUserUpdate);
  }
  _onChannelUpdate(tag) {
    const { channel_id } = this.state;
    const channel = ChannelStore.getChannel(channel_id);
    this.setState({ channel });
  }
  _onUserUpdate() {
    const user = UserStore.getUser();
    this.setState({ user });
  }

  _onCancelEdit() {
    this.context.router.goBack();
  }
  _onSaveClick(error) {
    if(!error) {
      this.context.router.goBack();
    }
  }
  _onAddContent() {
    const { channel_id } = this.state;
    this.context.router.push('/channel/' + channel_id + '/add');
  }

  _onVideoEdit(video) {
    this.context.router.push('/admin/channel/' + video.channel_id + '/video/' + video.channel_video_id);
  }
  _onVideoDelete(video,e) {
    util.stopAll(e);
    const { channel_id } = this.state;
    const ok_to_delete = confirm("Are you sure you want to delete this video?");
    if (ok_to_delete) {
      ChannelVideoStore.deleteVideo(video,(err) => {
        if(err) {
          alert('Video could not be deleted, please try again.');
        } else {
          alert('Video deleted.');
        }
      });
    }
  }

  render() {
    const { channel } = this.state;

    let content;
    if(!channel) {
      content = <LoadingOverlay />;
    } else {
      const videos = _.map(channel.video_list,(video) => {
        const channel_video_id = video.channel_video_id;
        const style = {
          backgroundImage: "url(" + video.channel_video_image_url + ")",
        };

        return (
          <div
            key={channel_video_id}
            className="admin-channel-row"
            onClick={this._onVideoEdit.bind(this,video)}
          >
            <div className="image-column image" style={style}>
              <div className="image-filler" />
            </div>
            <div className="name">{video.title}</div>
            <div className="edit">Edit</div>
            <div className="delete" onClick={this._onVideoDelete.bind(this,video)}>
              <div className="icon" title="Delete" />
            </div>
          </div>
        );
      });

      content = (
        <ContentFrame
          className='admin-channel-container overlay-form-container'
          title={"Channel Admin - " + channel.channel_name}
        >
          <ChannelEdit
            channel={channel}
            inviteList={channel.user_list}
            onCancel={this._onCancelEdit}
            onSave={this._onSaveClick}
            user={this.state.user}
          />
          <div className='admin-channel-list'>
            <div className='top'>
              <div className='title'>Video List</div>
              <div className="header-button-container">
                <div
                  className='header-button'
                  onClick={this._onAddContent}
                >
                  Add Video
                </div>
              </div>
            </div>
            <div className='admin-channel-row title-row'>
              <div className='image-column'>Video Image</div>
              <div className='name'>Name</div>
              <div className='edit'>&nbsp;</div>
              <div className='delete'>&nbsp;</div>
            </div>
            {videos}
          </div>
        </ContentFrame>
      );
    }

    return content;
  }
}
