'use strict';

import React from 'react';

import Avatar from './avatar.js';

import util from '../util.js';

export default class HomeUserPane extends React.Component {
  static propTypes = {
    user: React.PropTypes.object.isRequired,
  };

  render() {
    const { user } = this.props;
    const style = {
      backgroundImage: "url(" + user.user_photo_url + ")",
    };
    return (
      <div className='home-user-pane' style={style}>
        <div className='cover'>
          <div className='name'>{user.user_name}</div>
          <div className='stat-list'>
            <div className='stat'>
              <div className='number'>{user.promoted_count || 0}</div>
              <div className='label'>Ignites</div>
            </div>
            <div className='stat'>
              <div className='number'>{user.like_count || 0}</div>
              <div className='label'>Sparks</div>
            </div>
            <div className='stat'>
              <div className='number'>{user.message_count || 0}</div>
              <div className='label'>Comments</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
