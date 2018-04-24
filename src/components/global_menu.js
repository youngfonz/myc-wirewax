'use strict';

import React from 'react';
import PureComponent from './pure_component.js';

import Avatar from './avatar.js';

import UserStore from '../stores/user_store.js';
import ContentStore from '../stores/content_store.js';

import util from '../util.js';
import GlobalEvent from '../global_event.js';

const HOME_ACTIVE_REGEX = /\/home/;
const CHANNEL_ACTIVE_REGEX = /\/channel\/[^/]*$/;
const DASHBOARD_ACTIVE_REGEX = /\/dashboard/;
const PROFILE_ACTIVE_REGEX = /\/profile/;
const ADMIN_ACTIVE_REGEX = /\/admin/;

const CHANNEL_REGEX = /\/channel\/[^/]*/;
const CHANNEL_VIDEO_REGEX = /\/channel\/[^/]*\/video\/.*/;

export default class GlobalMenu extends PureComponent {
  constructor(props,context) {
    super(props,context);
    this.state = {
      user: false,
      pathname: false,
    };
    this._onHomeClick = this._onHomeClick.bind(this);
    this._onHelpClick = this._onHelpClick.bind(this);
    this._onDashboardClick = this._onDashboardClick.bind(this);
    this._onProfileClick = this._onProfileClick.bind(this);

    this._onUserUpdate = this._onUserUpdate.bind(this);
    this._onLocationChange = this._onLocationChange.bind(this);
    this._onAnalyticsClick = this._onAnalyticsClick.bind(this);
    this._onAdminClick = this._onAdminClick.bind(this);
    this._onChannelClick = this._onChannelClick.bind(this);
    this._onProfileClick = this._onProfileClick.bind(this);
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  componentDidMount() {
    UserStore.addChangeListener(this._onUserUpdate);
    this._onUserUpdate();

    this.context.router.listen(this._onLocationChange);
  }
  componentWillUnmount() {
    this.context.router.unregisterTransitionHook(this._onLocationChange);

    UserStore.removeChangeListener(this._onUserUpdate);
  }
  _onLocationChange(arg) {
    if (arg && arg.pathname) {
      const { pathname } = arg;
      this.setState({ pathname });
    }
  }
  _onUserUpdate() {
    const user = UserStore.getUser();
    this.setState({ user });
  }

  _onAdminClick() {
    this.context.router.push('/admin');
  }
  _onHelpClick() {
    const url = "mailto:help@myc.tv";
    window.open(url);
  }
  _onDashboardClick() {
    this.context.router.push('/dashboard');
  }
  _onHomeClick() {
    this.context.router.push('/home');
  }
  _onProfileClick() {
    UserStore.logout(() => {
      window.location.href = "/";
    });
  }
  _onAnalyticsClick() {
    GlobalEvent.emit('GLOBAL-MENU','analytics-click');
  }
  _onChannelClick() {
    const { pathname } = this.state;
    const match = pathname.match(CHANNEL_REGEX);
    if (match && match.length > 0) {
      const url = match[0];
      this.context.router.push(url);
    }
  }
  _onProfileClick() {
    this.context.router.push('/profile');
  }

  render() {
    const {
      user,
      pathname,
    } = this.state;
    const header_logo_text = ContentStore.get('header_logo_text');

    function test_active(regex) {
      return regex.test(pathname) ? " active" : "";
    }

    let dashboard = null;
    let home = null;
    let profile = null;
    let admin_panel = null;
    let channel = null;

    if (user) {
      const home_active = test_active(HOME_ACTIVE_REGEX);
      const dash_active = test_active(DASHBOARD_ACTIVE_REGEX);
      const profile_active = test_active(PROFILE_ACTIVE_REGEX);
      const admin_active = test_active(ADMIN_ACTIVE_REGEX);

      home = (
        <a className={'item' + home_active} onClick={this._onHomeClick}>
          <div className='icon home'/>
          <div className='label'>Home</div>
        </a>
      );

      profile = (
        <a className={'item' + profile_active} onClick={this._onProfileClick}>
          <div className='icon profile'/>
          <div className='label'>Profile</div>
        </a>
      );

      if (user.is_admin) {
        dashboard = (
          <a className={'item' + dash_active} onClick={this._onDashboardClick}>
            <div className='icon dashboard'/>
            <div className='label'>Moodboard</div>
          </a>
        );

        admin_panel = (
          <a className={'item' + admin_active} onClick={this._onAdminClick}>
            <div className='icon admin'/>
            <div className='label'>Admin</div>
          </a>
        );
      }

      let analytics = null;
      if (CHANNEL_VIDEO_REGEX.test(pathname)) {
        analytics = (
          <a className='item' onClick={this._onAnalyticsClick}>
            <div className='icon analytics'/>
            <div className='label'>Analytics</div>
          </a>
        );
      }

      if (CHANNEL_REGEX.test(pathname)) {
        const channel_active = test_active(CHANNEL_ACTIVE_REGEX);
        channel = (
          <a className={'item' + channel_active} onClick={this._onChannelClick}>
            <div className='icon channel'/>
            <div className='label'>Channel</div>
          </a>
        );
      }
    }
    let donate = null;
    const donate_url = ContentStore.getString('donate_url',false);
    if (donate_url) {
      donate = (
        <a className='item dontate' href={donate_url} target='_blank'>
          <div className='icon donate'/>
          <div className='label'>Donate</div>
        </a>
      );
    }
    let brand_icon = null;
    const brand_url = ContentStore.getString('brand_url',false);
    if (brand_url) {
      brand_icon = (
        <a className='brand-icon' href={brand_url} target='_blank'>
          <div className='icon'/>
          <div className='label'>{header_logo_text}</div>
        </a>
      );
    } else {
      brand_icon = (
        <div className='brand-icon'>
          <div className='icon'/>
          <div className='label'>{header_logo_text}</div>
        </div>
      );
    }

    return (
      <div className="global-menu-container">
        <div className='header'>
          {brand_icon}
        </div>
        {home}
        {channel}
        {donate}
        <div className='spacer' />
        {dashboard}
        {profile}
        {admin_panel}
        <a className='item' onClick={this._onHelpClick}>
          <div className='icon help'/>
          <div className='label'>Help</div>
        </a>
      </div>
    );
  }
}
