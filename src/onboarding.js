'use strict';

import _ from 'lodash';
import React from 'react';

import LoadingOverlay from './components/loading_overlay.js';
import Input from './components/input.js';

import UserStore from './stores/user_store.js';

const USER_NAME_REGEX = /^[A-Za-z0-9._\-]+$/;

export default class Onboarding extends React.Component {
  constructor(props,context) {
    super(props,context);
    this.state = {
      user: this.props.params.user,
      in_progress: false,
      user_name: "",
      nextPathname: false,
    };
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };
  componentWillReceiveProps(nextProps) {
    this.setState({ user: nextProps.params.user });
  }
  componentDidMount() {
    const { location } = this.props;
    const nextPathname = location && location.state && location.state.nextPathname;
    this.setState({ nextPathname });
  }

  _onSaveClick(e) {
    e && e.preventDefault && e.preventDefault();
    const { user_name, nextPathname } = this.state;
    if (user_name && USER_NAME_REGEX.test(user_name)) {
      this.setState({ in_progress: true });
      UserStore.updateUser({ user_name},(err) => {
        this.setState({ in_progress: false });
        if (err == 'dup') {
          alert("Username already taken, please try again.");
        } else if (err) {
          alert("Update failed, please try again.");
        } else {
          this.context.router.replace(nextPathname || "/home");
        }
      });
    } else if (user_name) {
      alert("Usernames can only contain letters, numbers, periods, hyphens, and underscores.");
    }
  }

  render() {
    const { user, user_name, in_progress } = this.state;

    const loading = in_progress ? <LoadingOverlay position="absolute"/> : null;

    const content = (
      <div className="onboarding-container sidebar-container">
        <div className="top-spacer" />
        <div className="title">welcome!</div>
        <div className="title-spacer" />
        <div className="over-input">User Name</div>
        <form onSubmit={this._onSaveClick.bind(this)}>
          <Input
            placeholder="User Name"
            autoFocus={true}
            onTextChange={(user_name) => this.setState({ user_name })}
            value={user_name}
            />
        </form>
        <div className="under-input">Usernames can only contain letters, numbers, periods, hyphens, and underscores.</div>
        <div className="middle-spacer" />
        <div
          className="button"
          onClick={this._onSaveClick.bind(this)}
        >
          Next
          <div className="right-arrow" />
        </div>
        <div className="bottom-spacer" />
        {loading}
      </div>
    );
    return content;
  }
}
