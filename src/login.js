'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';

import util from './util.js';

import Input from './components/input.js';
import LoadingOverlay from './components/loading_overlay.js';

import UserStore from './stores/user_store.js';
import ContentStore from './stores/content_store.js';

export default class Login extends React.Component {
  constructor(props,context) {
    super(props,context);
    this.state = {
      in_progress: false,
      email: "",
      nextPathname: false,
    };

    DataCortex.event({ kingdom: 'page_view', phylum: 'login' });
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };
  componentDidMount() {
    const { location } = this.props;
    const nextPathname = location && location.state && location.state.nextPathname;
    this.setState({ nextPathname });
  }

  _onLoginSignupClick(e) {
    e && e.preventDefault && e.preventDefault();
    const { nextPathname } = this.state;
    const email = this.state.email.toLowerCase();
    if (!email) {
      alert("Please enter your email address.");
    } else if (!util.isValidEmail(email)) {
      alert("Please enter a valid email address.");
    } else if (!this.state.in_progress) {
      this.setState({ in_progress: true });
      UserStore.loginSignup(email,(err) => {
        this.setState({ in_progress: false });
        if (err == 'user_locked') {
          this.context.router.replace('/login-locked',{ email });
        } else if (err == 'token_mismatch') {
          alert("Login failed, please check you login code.");
        } else if (err == 'no_whitelist') {
          alert("Your email domain is not allowed. Please use your work email.");
        } else if (err) {
          alert("Login failed, please check your email address.");
        } else {
          this.context.router.push({
            pathname: '/login-confirm',
            state: {
              email,
              nextPathname,
            }
          });
        }
      });
    }
  }
  _onFocus() {
    IS_IPAD && util.scrollTo(0,155);
  }

  render() {
    const {
      email,
      in_progress,
    } = this.state;
    const loading = in_progress ? <LoadingOverlay position="absolute"/> : null;

    const content = (
      <div className="login-container sidebar-container">
        <div className="top-spacer" />
        <div className="title">{ContentStore.getString('login_text')}</div>
        <div className="title-spacer" />
        <div className="over-input">Email</div>
        <form onSubmit={this._onLoginSignupClick.bind(this)}>
          <Input
            type="email"
            placeholder="user@email.com"
            autoFocus={!IS_IPAD}
            onTextChange={(email) => this.setState({ email })}
            value={email}
            onFocus={this._onFocus}
            />
        </form>
        <div className="under-input">{ContentStore.getString('login_subtext')}</div>
        <div className="middle-spacer" />
        <div
          className="button"
          onClick={this._onLoginSignupClick.bind(this)}
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
