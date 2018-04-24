'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import { browserHistory, Router } from 'react-router';
import DataCortex from 'browser-data-cortex';

import UserStore from './stores/user_store.js';

import Root from './root.js';

import Splash from './splash.js';
import Welcome from './welcome.js';
import MobileWelcome from './mobile_welcome.js';

import Login from './login.js';
import LoginConfirm from './login_confirm.js';
import LoginLocked from './login_locked.js';
import Logout from './logout.js';
import Onboarding from './onboarding.js';
import Dashboard from './dashboard.js';
import Profile from './profile.js';

import Conference from './conference.js';

import AdminHome from './admin_home.js';

import AdminChannelList from './admin_channel_list.js';
import AdminChannel from './admin_channel.js';
import AdminChannelUserList from './admin_channel_user_list.js';
import AdminChannelVideo from './admin_channel_video.js';
import AdminSlideScript from './admin_slide_script.js';
import AdminVideoTrim from './admin_video_trim.js';

import AdminUser from './admin_user.js';

import UserHome from './user_home.js';
import Channel from './channel.js';
import ChannelAddContent from './channel_add_content.js';
import ChannelVideoPage from './channel_video_page.js';
import ChannelVideoReply from './channel_video_reply.js';
import ChannelPreview from './channel_preview.js';
import ChannelNewConference from './channel_new_conference.js';

import NewPrivateChannel from './new_private_channel.js';

require('../css/org_optum.less');
require('../css/org_intel.less');
require('../css/org_aetna.less');
require('../css/org_fandm.less');
require('../css/org_kdc.less');
require('../css/org_blackrock.less');
require('../css/org_bok.less');
require('../css/org_morehouse.less');
require('../css/org_georgia.less');
require('../css/org_trinityhealth.less');
require('../css/org_willis_towers.less');

function handleUser(user_callback) {
  function _inner(nextState,replace,callback) {
    if (UserStore.isReady()) {
      user_callback(nextState,replace,callback);
    } else {
      UserStore.once(() => {
        _inner(nextState,replace,callback);
      });
    }
  };
  return _inner;
}

const requireAuth = handleUser((nextState,replace,callback) => {
  const { invite_token } = nextState.location.query;

  if (UserStore.isLoggedIn()) {
    nextState.params.user = UserStore.getUser();
    if (invite_token) {
      UserStore.clearInviteToken(invite_token);
    }
  } else {
    const nextPathname = nextState.location.pathname;
    let pathname = "/login";
    const state = {
      nextPathname,
    };
    const match = nextPathname.match(/^\/channel\/(\d*)/);
    if (match && match.length > 1 && invite_token) {
      pathname = "/channel-preview/" + match[1];
      state.invite_token = invite_token;
    }

    replace({
      pathname,
      state,
    });
  }
  callback();
});
const forwardLoggedIn = handleUser((nextState,replace,callback) => {
  if (UserStore.isLoggedIn()) {
    const user = UserStore.getUser();
    if (user.user_name) {
      replace({
        pathname: '/home',
      });
    } else {
      replace({
        pathname: '/onboarding',
      });
    }
  }
  callback();
});

const routes = [
  {
    path: '',
    component: Root,
    childRoutes: [
      {
        path: '/splash',
        component: Splash,
        childRoutes: [
          { path: '/', component: Welcome, onEnter: forwardLoggedIn },
          { path: '/login', component: Login, onEnter: forwardLoggedIn },
          { path: '/login-confirm', component: LoginConfirm, onEnter: forwardLoggedIn },
          { path: '/login-locked', component: LoginLocked, onEnter: forwardLoggedIn },
          { path: '/onboarding', component: Onboarding, onEnter: requireAuth },
        ],
      },
      { path: '/mobile-welcome', component: MobileWelcome, },
      { path: '/logout', component: Logout, onEnter: requireAuth },
      { path: '/home', component: UserHome, onEnter: requireAuth },
      { path: '/profile', component: Profile, onEnter: requireAuth },
      { path: '/channel/:channel_id', component: Channel, onEnter: requireAuth },
      { path: '/channel/:channel_id/add', component: ChannelAddContent, onEnter: requireAuth },
      { path: '/channel/:channel_id/new_video', component: AdminChannelVideo, onEnter: requireAuth },
      { path: '/channel/:channel_id/new_conference', component: ChannelNewConference, onEnter: requireAuth },
      { path: '/channel/:channel_id/conference/:conference_id', component: Conference, onEnter: requireAuth },
      { path: '/channel/:channel_id/video/:video_id', component: ChannelVideoPage, onEnter: requireAuth },
      { path: '/channel/:channel_id/video/:video_id/reply', component: ChannelVideoReply, onEnter: requireAuth },
      { path: '/dashboard', component: Dashboard, onEnter: requireAuth },
      { path: '/channel-preview/:channel_id', component: ChannelPreview },
      { path: '/new_private_channel', component: NewPrivateChannel, onEnter: requireAuth },

      { path: '/admin', component: AdminHome, onEnter: requireAuth },

      { path: '/admin/channel', component: AdminChannelList, onEnter: requireAuth },
      { path: '/admin/channel/:channel_id', component: AdminChannel, onEnter: requireAuth },
      { path: '/admin/channel/:channel_id/user_list', component: AdminChannelUserList, onEnter: requireAuth },
      { path: '/admin/channel/:channel_id/video/:video_id', component: AdminChannelVideo, onEnter: requireAuth },
      { path: '/admin/channel/:channel_id/video/:video_id/slide_script', component: AdminSlideScript, onEnter: requireAuth },
      { path: '/admin/channel/:channel_id/video/:video_id/video_trim', component: AdminVideoTrim, onEnter: requireAuth },

      { path: '/admin/user', component: AdminUser, onEnter: requireAuth },
    ]
  }
];

const router = (
  <Router history={browserHistory} children={routes} />
);

require('../css/font.less');
require('../css/default.less');

ReactDOM.render(router,document.getElementById('root'));

DataCortex.init({ org_name: 'mychannel', api_key: appConfig.dcAPIKey });
