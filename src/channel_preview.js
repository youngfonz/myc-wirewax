'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';

import util from './util.js';

import Input from './components/input.js';
import Loading from './components/loading.js';

import ChannelStore from './stores/channel_store.js';
import UserStore from './stores/user_store.js';

require('../css/channel_preview.less');

export default class ChannelPreview extends React.Component {
  constructor(props,context) {
    super(props,context);
    this.state = {
      email: "",
      channel_id: false,
      nextPathname: false,
      invite_token: false,
      previewVideo: false,
      needLoginToken: false,
      login_token: "",
    };

    DataCortex.event({
      kingdom: 'page_view',
      phylum: 'channel_preview',
      species: props.params.channel_id,
    });

    this._onEmailChange = this._onEmailChange.bind(this);
    this._onTokenChange = this._onTokenChange.bind(this);
    this._onLoginSignupClick = this._onLoginSignupClick.bind(this);
    this._onLoginTokenClick = this._onLoginTokenClick.bind(this);
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  componentDidMount() {
    const { location, params } = this.props;

    const channel_id = params && params.channel_id;
    const nextPathname = location && location.state && location.state.nextPathname;
    const invite_token = location && location.state && location.state.invite_token;
    if (!invite_token) {
      this.context.router.replace({
        pathname: '/login',
        state: {
          nextPathname,
        },
      });
    } else {
      this.setState({ nextPathname, invite_token, channel_id });
      ChannelStore.getChannelPreview({ channel_id, invite_token },(err,previewVideo) => {
        if (err) {
          this.context.router.replace({
            pathname: '/login',
            state: {
              nextPathname,
            },
          });
        } else {
          this.setState({ previewVideo });
        }
      });
    }
  }
  _onEmailChange(email) {
    this.setState({ email });
  }
  _onTokenChange(login_token) {
    this.setState({ login_token });
  }
  _onLoginSignupClick(e) {
    const email = this.state.email.toLowerCase();
    const { invite_token, nextPathname } = this.state;
    if (!util.isValidEmail(email)) {
      alert("Please enter a valid email address.");
    } else {
      UserStore.loginInviteToken({ email, invite_token},(err,user) => {
        if (err == 'not_found') {
          UserStore.loginSignup(email,(err) => {
            if (err) {
              console.error("ChannelPreview: loginSignup err:",err);
              this.context.router.replace({
                pathname: '/login',
                state: {
                  nextPathname,
                },
              });
            } else {
              this.setState({ needLoginToken: true });
            }
          });
        } else if (err) {
          alert("Login failed, please try again.");
        } else {
          this.context.router.replace(nextPathname);
        }
      });
    }
  }
  _onLoginTokenClick() {
    const { email, login_token, nextPathname } = this.state;
    UserStore.loginToken({ email, login_token },(err,user) => {
      if (err) {
        alert("Login failed, please try again.");
      } else {
        this.context.router.replace(nextPathname);
      }
    });
  }

  render() {
    const {
      email,
      previewVideo,
      needLoginToken,
      login_token,
    } = this.state;

    let content = null;
    if (previewVideo) {
      const video_src = previewVideo.media_list[0].url;

      let inner = null;
      if (needLoginToken) {
        inner = (
          <div className='inner'>
            <div className='description'>
              Your login token was emailed to you. Please enter
              your code below.
            </div>
            <div className='input-container'>
              <form onSubmit={this._onLoginTokenClick}>
                <Input
                  type="number"
                  placeholder="123456"
                  autoFocus={true}
                  onTextChange={this._onTokenChange}
                  value={login_token}
                  />
              </form>
            </div>
            <div
              className="button"
              onClick={this._onLoginTokenClick}
            >
              JOIN
            </div>
          </div>
        );
      } else {
        inner = (
          <div className='inner'>
            <div className='description'>
              The Optum Engagement Network (OEN) is a social video platform
              that gives YOU the power to follow your company's trends and ENGAGE
              in a new way.  SUBMIT your work email address to JOIN the revolution
              in workplace engagement.
            </div>
            <div className='input-container'>
              <form onSubmit={this._onLoginSignupClick}>
                <Input
                  type="email"
                  placeholder="user@email.com"
                  autoFocus={true}
                  onTextChange={this._onEmailChange}
                  value={email}
                  />
              </form>
            </div>
            <div
              className="button"
              onClick={this._onLoginSignupClick}
            >
              JOIN
            </div>
          </div>
        );
      }

      content = (
        <div className='channel-preview-container'>
          <div className='video-container'>
            <video
              autoPlay
              muted
              loop
              src={video_src}
            />
          </div>
          <div className='login-overlay'>
            <div className='inset'>
              <div className='brand-icon' />
              <div className='title'>JOIN the OEN</div>
              {inner}
            </div>
          </div>
        </div>
      );
    } else {
      content = (
        <div className='channel-preview-container'>
          <Loading />
        </div>
      );
    }
    return content;
  }
}
