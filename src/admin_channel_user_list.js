'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';

import ContentFrame from './components/content_frame.js';
import LoadingOverlay from './components/loading_overlay.js';
import Loading from './components/loading.js';
import InviteList from './components/invite_list.js';
import Button from './components/button.js';

import ChannelVideoStore from './stores/channel_video_store.js';
import ChannelStore from './stores/channel_store.js';
import UserStore from './stores/user_store.js';

import util from './util.js';

require('../css/admin_channel.less');

export default class AdminChannelUserList extends React.Component {
  constructor(props, context) {
    super(props, context);

    const { user, channel_id } = props.params;
    this.state = {
      user,
      channel: false,
      in_progress: false,
      text_area: "",
      user_list: [],
      user_count: 0,
    };
    this.channel_id = channel_id;
    this.in_progress = false;

    this._onChannelUpdate = this._onChannelUpdate.bind(this);

    this._onAddClick = this._onAddClick.bind(this);
    this._onTextChange = this._onTextChange.bind(this);

    DataCortex.event({
      kingdom: 'page_view',
      phylum: 'admin_channel_user_list',
      species: channel_id,
    });
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };
  componentDidMount() {
    ChannelStore.addChangeListener(this._onChannelUpdate);
    ChannelStore.fetch();
    this._onChannelUpdate();

    this._fetchUserList();
  }
  componentWillUnmount() {
    ChannelStore.removeChangeListener(this._onChannelUpdate);
    this.setState({ channel: false });
  }

  _onChannelUpdate() {
    const channel = ChannelStore.getChannel(this.channel_id);
    this.setState({ channel });
  }

  _fetchUserList() {
    ChannelStore.fetchUserList(this.channel_id,(err,user_list) => {
      if (!err) {
        const user_count = user_list.length;
        this.setState({ user_list, user_count });
      }
    });
  }

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

  _onUserUpdate() {
    const user = UserStore.getUser();
    this.setState({ user });
  }

  _onSaveClick(error) {
    const { user, channel, user_list } = this.state;

    let tmp_list = user_list.slice();
    tmp_list.push(user);
    tmp_list = _.uniq(tmp_list,'user_id');

    const opts = {
      channel_id: channel.channel_id,
      user_list: tmp_list,
    };
    ChannelStore.saveChannel(opts,(err,channel_id) => {
      this._clearBusy();
      if (err) {
        alert('Channel could not be saved, please try again.');
      } else {
        alert('Channel saved.');
        this.context.router.goBack();
      }
    });
  }
  _onAddClick() {
    const { channel, text_area } = this.state;
    const add_email_list = [];

    const items = text_area.split(/[\s,;]/);
    if (items && items.length > 0) {
      _.each(items,(item) => {
        if (item && util.isValidEmail(item)) {
          add_email_list.push(item.toLowerCase());
        }
      });
    }

    if (add_email_list.length == 0) {
      window.alert("No valid email addresses to add.");
    } else {
      const opts = {
        channel_id: channel.channel_id,
        add_email_list,
      };
      this._setBusy();
      ChannelStore.modifyUserList(opts,(err) => {
        this._clearBusy();
        if (err) {
          window.alert("Failed to add users.");
        } else {
          this.setState({ text_area: "" });
          this._fetchUserList();
        }
      });
    }
  }
  _deleteUser(user) {
    const { channel, text_area } = this.state;
    const opts = {
      channel_id: channel.channel_id,
      remove_user_list: [user.user_id],
    };
    this._setBusy();
    ChannelStore.modifyUserList(opts,(err) => {
      this._clearBusy();
      if (err) {
        window.alert("Failed to delete users.");
      } else {
        const user_list = _.filter(this.state.user_list,(u) => u.user_id != user.user_id);
        this.setState({ user_list });
        this._fetchUserList();
      }
    });
  }
  _onTextChange(event) {
    const text_area = event.target.value;
    this.setState({ text_area });
  }

  render() {
    const {
      user,
      channel,
      user_list,
      user_count,
      text_area,
      in_progress,
      is_loading_users,
    } = this.state;

    let content = null;
    if(!channel) {
      content = <LoadingOverlay />;
    } else {
      let users = null;
      let user_loading = null;
      if (in_progress) {
        user_loading = <Loading />;
      } else {
        users = _.map(user_list,(user,i) => {
          return (
            <tr key={i} className='user-list-item'>
              <td className='user-email'>{user.email}</td>
              <td
                className='delete'
                onClick={this._deleteUser.bind(this,user)}
              >delete</td>
            </tr>
          );
        });
      }

      let overlay = null;
      if (in_progress) {
        overlay = <LoadingOverlay />;
      }

      content = (
        <ContentFrame
          className='admin-channel-container overlay-form-container'
          title={"Channel Admin - " + channel.channel_name}
        >
          <div className='channel-edit-container'>
            <div className='title'>Add Users</div>
            <textarea value={text_area} onChange={this._onTextChange}/>
            <div className='save-button-container'>
              <Button
                text="Add Users"
                disabled={in_progress}
                onClick={this._onAddClick}
              />
            </div>
            <hr/>
            <div className='title'>Channel User List</div>
            <div className='user-count'>{user_count} users</div>
            <table className='user-list-container'>
              <tbody>
                {users}
              </tbody>
            </table>
            {user_loading}
          </div>
          {overlay}
        </ContentFrame>
      );
    }

    return content;
  }
}
