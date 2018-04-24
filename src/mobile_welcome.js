'use strict';

import React from 'react';
import { Link } from 'react-router';

import ContentStore from './stores/content_store.js';

require('../css/mobile_welcome.less');

export default class MobileWelcome extends React.Component {

  static hasMobileApps() {
    const itunes_url = ContentStore.getString('itunes_url');
    return !!itunes_url;
  }

  render() {
    const site_name = ContentStore.getString('site_name');

    const itunes_url = ContentStore.getString('itunes_url');
    const google_play_url = ContentStore.getString('google_play_url');

    const content = (
      <div className='mobile-welcome-container sidebar-container'>
        <div className='header'>
          <div className='brand-icon'/>
        </div>
        <div className='body'>
          <div className='header-text'>Welcome to {site_name}</div>
          <div className='body-text'>
            Download the {site_name} app for your mobile device.
          </div>
          <div className='device-image'/>
        </div>
        <div className='footer'>
          <div className='buttons'>
            <a className='button itunes' href={itunes_url} />
            <a className='button google-play' href={google_play_url} />
          </div>
          <div className='continue'>
            <Link to='/login'>
              Or go to mobile <span className='link-color'>{site_name}</span>
            </Link>
          </div>
        </div>
      </div>
    );
    return content;
  }
}
