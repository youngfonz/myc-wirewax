'use strict';

import _ from 'lodash';
import React from 'react';
import DataCortex from 'browser-data-cortex';

import util from './util.js';

import ContentFrame from './components/content_frame.js';
import LoadingOverlay from './components/loading_overlay.js';
import Avatar from './components/avatar.js';
import Button from './components/button.js';
import Input from './components/input.js';
import FileInput from './components/file_input.js';

import UserStore from './stores/user_store.js';

const USER_NAME_REGEX = /^[A-Za-z0-9._\-]+$/;

export default class Profile extends React.Component {
  constructor(props,context) {
    super(props,context);

    const { user } = this.props.params;
    this.state = {
      user,
      in_progress: false,
      user_name: user.user_name,
      has_image: false,
      img_src: null,
    };

    DataCortex.event({
      kingdom: 'page_view',
      phylum: 'profile',
      species: user.user_id,
    });

    this.release_list = [];

    this._onUserUpdate = this._onUserUpdate.bind(this);

    this._onSaveClick = this._onSaveClick.bind(this);
    this._onUserNameChange = this._onUserNameChange.bind(this);
    this._onImageChange = this._onImageChange.bind(this);
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };
  componentDidMount() {
    UserStore.addChangeListener(this._onUserUpdate);
    this._onUserUpdate();
  }
  componentWillUnmount() {
    UserStore.removeChangeListener(this._onUserUpdate);
  }
  _onUserUpdate() {
    const user = UserStore.getUser();
    this.setState({ user });
  }
  _setBusy() {
    const ret = !this.busy;
    if (!this.busy) {
      this.busy = true;
      this.setState({ in_progress: true });
    }
    return ret;
  }
  _clearBusy() {
    this.busy = false;
    this.setState({ in_progress: false });
  }

  _onSaveClick(e) {
    const { user, user_name, has_image } = this.state;
    if (!USER_NAME_REGEX.test(user_name)) {
      alert("Usernames can only contain letters, numbers, periods, hyphens, and underscores.");
    } else if ((user.user_name != user_name || has_image )) {
      if (this._setBusy()) {
        const fd = new FormData();
        if (user.user_name != user_name) {
          fd.append('user_name',user_name);
        }
        if (has_image) {
          const file = this.refs.image.getFile();
          fd.append('avatar_file',file);
        }
        UserStore.updateUser(fd,(err) => {
          this._clearBusy();
          if (err) {
            alert("User update failed, please try again.");
          } else {
            this.setState({ has_image: false, img_src: null });
            alert("User updated.");
          }
        });
      }
    } else {
      alert("Nothing changed.");
    }
  }
  _onUserNameChange(user_name) {
    this.setState({ user_name });
  }
  _onImageChange(filename) {
    if (this.refs.image) {
      const file = this.refs.image.getFile();
      const img_src = URL.createObjectURL(file);

      this.release_list.push(img_src);
      this.setState({ img_src });
    }
    this.setState({ has_image: !!filename });
  }
  _onLogoutClick() {
    if (confirm("Are you sure you want to logout?")) {
      UserStore.logout(() => {
        window.location.href = "/";
      });
    }
  }

  render() {
    const {
      in_progress,
      user,
      user_name,
      img_src,
    } = this.state;

    let loading = null;
    if (in_progress) {
      loading = <LoadingOverlay />;
    }

    let disabled = false;

    const content = (
      <ContentFrame
        className='profile-container overlay-form-container'
        title="MyChannel Network"
      >
        <div className='title'>Edit Profile Info</div>
        <div className='left-right-container'>
          <div className='left'>
            <div className="image-upload">
              <Avatar user={user} src={img_src} />
              <div className='image-overlay'>
                <div className='icon'/>
                <div className='text'>Replace Image</div>
              </div>
              <FileInput ref='image' onChange={this._onImageChange}/>
            </div>
          </div>
          <div className='right'>
            <div className='input'>
              <div className='label'>User Name</div>
              <Input
                placeholder="user name"
                onTextChange={this._onUserNameChange}
                value={user_name}
              />
            </div>
          </div>
        </div>
        <div className='save-button-container'>
          <Button
            text="Save"
            disabled={in_progress}
            onClick={this._onSaveClick}
          />
          <Button
            text="Cancel"
            className="ghost"
            disabled={in_progress}
            onClick={this.context.router.goBack}
          />
          <div className='spacer'/>
          <Button
            text="Logout"
            className="ghost"
            onClick={this._onLogoutClick}
          />
        </div>
        {loading}
      </ContentFrame>
    );
    return content;
  }
}
