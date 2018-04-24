'use strict';

import React from 'react';

import storage from './storage.js';
import util from './util.js';

import Input from './components/input.js';
import LoadingOverlay from './components/loading_overlay.js';

import ContentStore from './stores/content_store.js';
import UserStore from './stores/user_store.js';

const NUM_COUNT = 6;

export default class LoginConfirm extends React.Component {
  constructor(props,context) {
    super(props,context);
    this.state = {
      in_progress: false,
      code_sent: false,
      email: "",
      nextPathname: false,
    };
    _.times(NUM_COUNT,(i) => this.state["input_" + i] = "");

    this._onPaste = this._onPaste.bind(this);
    this._onFocus = this._onFocus.bind(this);

    this.disarm = false;
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  componentDidMount() {
    const { location } = this.props;

    const nextPathname = location && location.state && location.state.nextPathname;
    this.setState({ nextPathname });

    const email = location && location.state && location.state.email;
    if (email) {
      this.setState({ email });
      storage.set('login.email',email);
    } else {
      storage.get('login.email',(err,email) => {
        if (email) {
          this.setState({ email });
        } else {
          this.context.router.push('/login');
        }
      });
    }
  }
  _onResendClick(e) {
    e && e.preventDefault && e.preventDefault();
    const { email } = this.state;
    this.setState({ in_progress: true });
    UserStore.loginSignup(email,(err) => {
      if (err == 'user_locked') {
        this.context.router.push('/user-locked');
      } else if (err) {
        this.setState({ in_progress: false });
        alert("Failed to send code, please try again.");
      } else {
        this.setState({ in_progress: false, code_sent: true });
      }
    });
  }
  _getToken() {
    let login_token = "";
    _.times(NUM_COUNT,(i) => {
      login_token += this.state["input_" + i];
    });
    return login_token;
  }

  _onSendClick(e) {
    e && e.preventDefault && e.preventDefault();
    const { email } = this.state;
    const login_token = this._getToken();
    if (!login_token) {
      alert("Please enter the login token from your email.");
    } else if (login_token.length != 6) {
      alert("The login token is a 6 digit number that has been sent to your email address.");
    } else {
      this.setState({ in_progress: true });
      UserStore.loginToken({ email, login_token },(err) => {
        if (err == 'user_locked') {
          this.context.router.push({ pathname: '/user-locked', state: { email }});
        } else if (err == 'token_mismatch') {
          this.setState({ in_progress: false });
          alert("Login failed, please check you login code.");
        } else if (err) {
          this.setState({ in_progress: false });
          alert("Login failed, please try again.");
        } else {
          this._handleSuccess();
        }
      });
    }
  }
  _handleSuccess() {
    const user = UserStore.getUser();
    const { nextPathname } = this.state;
    if (user.user_name) {
      this.context.router.replace(nextPathname || "/home");
    } else {
      this.context.router.replace({
        pathname: "/onboarding",
        state: {
          nextPathname,
        },
      });
    }
  }
  _onTextChange(i,text) {
    const next_input = this.refs["input_" + (i + 1)];
    const prev_input = this.refs["input_" + (i - 1)];

    if (text.length < 2) {
      const state = {};
      state["input_" + i] = text;
      this.setState(state);
    }

    if (text.length == 0 && prev_input) {
      //console.log("_onTextChange: prev focus");
      //prev_input.focus();
    } else if (text.length == 1 && next_input) {
      next_input.focus();
    }
  }
  _onKeyDown(i,e) {
    const prev_input = this.refs["input_" + (i - 1)];
    if (e.keyCode == 8 && e.target.value.length == 0 && prev_input) {
      const state = {};
      state["input_" + (i - 1)] = "";
      this.setState(state);
      prev_input.focus();
    } else if (e.keyCode == 13) {
      const token = this._getToken();
      if (token.length == 6) {
        this._onSendClick();
      }
    }
  }
  _onPaste(e) {
    util.stopAll(e);
    let text;
    if (window.clipboardData && window.clipboardData.getData) { // IE
      text = window.clipboardData.getData('Text');
    } else if (e.clipboardData && e.clipboardData.getData) {
      text = e.clipboardData.getData('text/plain');
    }

    if (text) {
      text = text.replace(/[^\d]/g,'');
      if (text) {
        const state = {};
        text.split('').forEach((d,i) => {
          state["input_" + i] = d;
        })
        this.setState(state);
      }
    }
  }
  _onFocus(e) {
    if (IS_IPAD && !this.disarm) {
      this.disarm = true;
      $('.login-confirm-container.sidebar-container').css({ 'padding-bottom': 250 });
    }
  }

  render() {
    const {
      email,
      in_progress,
      code_sent,
    } = this.state;
    const disabled = in_progress;

    const inputs = _.times(NUM_COUNT,(i) => {
      const ref = "input_" + i;
      const clear_state = {};
      clear_state[ref] = "";
      return (
        <div key={ref} className="input-container">
          <Input
            ref={ref}
            type="number"
            inputMode="numeric"
            placeholder="#"
            autoFocus={!IS_IPAD && i == 0}
            maxLength={1}
            onClick={() => this.setState(clear_state)}
            onKeyDown={this._onKeyDown.bind(this,i)}
            onTextChange={this._onTextChange.bind(this,i)}
            onFocus={this._onFocus}
            onPaste={this._onPaste}
            value={this.state[ref]}
            />
          </div>
        );
    });

    let resend = null;
    if (code_sent) {
      resend = (
        <div className="resent">Sent!</div>
      );
    } else {
      resend = (
        <div
          className="button"
          onClick={this._onResendClick.bind(this)}
        >
          Resend Code
          <div className="circle-arrow" />
        </div>
      );
    }

    const loading = in_progress ? <LoadingOverlay position="absolute" /> : null;
    const content = (
      <div className="login-confirm-container sidebar-container">
        <div className="top-spacer" />
        <div className="title">let's go!</div>
        <div className="title-spacer" />
        <div className="email">{email}</div>
        <a className="button not-you" href="/login">Not You?</a>
        <div className="input-spacer" />
        <div className="over-input">Login Code</div>
        <form onSubmit={this._onSendClick.bind(this)}>
          {inputs}
        </form>
        <div className="under-input">{ContentStore.getString('login_confirm_subtext')}</div>
        <div className="middle-spacer" />
        <div
          className="button"
          onClick={this._onSendClick.bind(this)}
        >
          Next
          <div className="right-arrow" />
        </div>
        <div className="bottom-spacer" />
        {resend}
        <div className="bottom2-spacer" />
        {loading}
      </div>
    );
    return content;
  }
}
