'use strict';

import React from 'react';
import { Link } from 'react-router';

import util from './util.js';

import MobileWelcome from './mobile_welcome.js';

import ContentStore from './stores/content_store.js';

export default class Welcome extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };
  componentDidMount() {
    const has_apps = MobileWelcome.hasMobileApps();
    const { os } = util.getDevice();
    if (has_apps && (os == 'ios' || os == 'android')) {
      this.context.router.replace("/mobile-welcome");
    }
  }
  render() {
    const content = (
      <div className='welcome-container sidebar-container'>
        <div className='top-spacer' />
        <div className='welcome-to'>welcome to</div>
        <div className='logo' />
        <div className='brand'>{ContentStore.getString('logo_text')}</div>
        <div className='middle-spacer' />
        <Link className='login-button' to="/login">get started</Link>
        <div className='bottom-spacer' />
        <div className='footer'>
          <a className='corporate' href='https://corp.myc.tv' target="_blank">
            <div className='icon' />
            <div className='text'>{ContentStore.getString('splash_corporate_link')}</div>
          </a>
          <a className='privacy' href='https://corp.myc.tv/privacy.html'  target="_blank">
            <div className='text'>privacy</div>
          </a>
        </div>
      </div>
    );
    return content;
  }
}
