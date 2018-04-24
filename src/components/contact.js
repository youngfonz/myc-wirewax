'use strict';

import React from 'react';

import Avatar from './avatar.js';

export default class Contact extends React.Component {
  static propTypes = {
    user: React.PropTypes.object.isRequired,
    onClick: React.PropTypes.func,
  };
  static defaultProps = {
    onClick: function() {},
  };

  _onClick() {
    this.props.onClick(this.props.user);
  }

  render() {
    const { user } = this.props;

    return (
      <div className="contact" onClick={this._onClick.bind(this)}>
        <div className='top'>
          <Avatar user={user} />
          <div className='name-email'>
            <div className='name'>{user.user_name}</div>
            <div className='email'>{user.email}</div>
          </div>
        </div>
        <div className='hr' />
      </div>
    );
  }
}
