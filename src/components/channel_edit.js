'use strict';

import React from 'react';

import Button from './button.js';
import CoverImage from './cover_image.js';
import Input from './input.js';
import InputImage from './input_image.js';
import InputCheckbox from './input_checkbox.js';
import InviteList from './invite_list.js';
import LoadingOverlay from './loading_overlay.js';
import PureComponent from './pure_component.js';

import ChannelStore from '../stores/channel_store.js';

export default class ChannelEdit extends PureComponent {
  constructor(props,context) {
    super(props,context);

    const channel = props.channel || false;
    const channel_name = channel ? channel.channel_name : "";
    const img_src = channel ? channel.channel_image_url : false;
    let is_private = false;
    if (channel && channel.is_private) {
      is_private = true;
    } else if (props.createPrivate) {
      is_private = true;
    }

    this.state = {
      channel,
      channel_name,
      img_src,
      is_private,
      in_progress: false,
      progress_percent: 0,
      user: props.user,
    };

    this._onSaveClick = this._onSaveClick.bind(this);
    this._onUploadProgress = this._onUploadProgress.bind(this);
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };
  static propTypes = {
    channel: React.PropTypes.object,
    createPrivate: React.PropTypes.bool,
    inviteList: React.PropTypes.array,
    onCancel: React.PropTypes.func,
    onSave: React.PropTypes.func,
    user: React.PropTypes.object.isRequired,
  };
  static defaultProps = {
    createPrivate: false,
    onCancel: null,
    onSave: () => {},
  };

  _setBusy() {
    const ret = !this.in_progress;
    if (ret) {
      this.setState({ in_progress: true });
    }
    return ret;
  }
  _clearBusy() {
    this.in_progress = false;
    this.setState({ in_progress: false });
  }

  _onSaveClick() {
    const { user, channel_name, is_private } = this.state;
    const { channel, createPrivate } = this.props;

    if (!channel_name) {
      window.alert("Channel name can not be blank.");
    } else {
      const channel_props = {};

      if (channel) {
        if (channel_name != channel.channel_name) {
          channel_props.channel_name = channel_name;
        }
        if (is_private != channel.is_private) {
          channel_props.is_private = is_private;
        }
      } else {
        channel_props.channel_name = channel_name;
        channel_props.is_private = createPrivate || is_private;
      }

      const image_file = this.refs.image.getFile();
      if (image_file) {
        channel_props.image_file = image_file;
      }

      if (Object.keys(channel_props) == 0) {
        alert("Nothing changed.");
      } else if (this._setBusy()) {
        const opts = _.extend({},channel_props,{
          track_progress: this._onUploadProgress,
        });
        if (channel && channel.channel_id) {
          opts.channel_id = channel.channel_id;
        }

        ChannelStore.saveChannel(opts,(err,channel_id) => {
          this._clearBusy();
          if (err) {
            alert('Channel could not be saved, please try again.');
          } else {
            alert('Channel saved.');
          }
          this.props.onSave(err,channel_id);
        });
      }
    }
  }
  _onUploadProgress(progress_percent) {
    this.setState({ progress_percent });
  }

  render() {
    const {
      createPrivate,
    } = this.props;
    const {
      channel,
      channel_name,
      img_src,
      in_progress,
      progress_percent,
      is_private,
    } = this.state;

    const save_disabled = in_progress;

    let page_title = 'Add Channel';
    if(channel && channel.channel_id) {
      page_title = 'Edit Channel';
    }

    let loading = null;
    if(in_progress) {
      loading = (
        <LoadingOverlay
          loadingText="Updating Channel..."
          progressPercent={progress_percent}
        />
      );
    }

    let user_list_link = null;
    if (!createPrivate && channel && channel.channel_id) {
      const url = '/admin/channel/' + channel.channel_id + '/user_list';
      user_list_link = (
        <div className='input'>
          <a href={url}>User List</a>
        </div>
      );
    }

    let visibility = null;
    if (!createPrivate) {
      visibility = (
        <div className='input'>
          <div className='label'>Visiblity</div>
          <InputCheckbox
            label="Private Channel"
            onChange={(is_private) => this.setState({ is_private })}
            value={is_private}
          />
        </div>
      );
    }

    return (
      <div className="channel-edit-container">
        <div className='title'>{page_title}</div>
        <div className='edit-container'>
          <div className='input-list'>
            <div className='input'>
              <div className='label'>Channel Name</div>
              <Input
                placeholder="channel name"
                onTextChange={(channel_name) => this.setState({ channel_name })}
                value={channel_name || ""}
              />
            </div>
            <div className='input'>
              <div className='label'>Channel Image</div>
              <InputImage
                ref='image'
                image={channel.channel_image_url}
              />
            </div>
            {visibility}
            {user_list_link}
          </div>
          <div className='save-button-container'>
            <Button
              text="Save"
              disabled={save_disabled}
              onClick={this._onSaveClick}
            />
            <Button
              text="Cancel"
              className="ghost"
              disabled={in_progress }
              onClick={this.props.onCancel}
            />
          </div>
        </div>
        {loading}
      </div>
    );
  }
}
