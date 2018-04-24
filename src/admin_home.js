'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';

import ContentFrame from './components/content_frame.js';
import PureComponent from './components/pure_component.js';

import UserStore from './stores/user_store.js';

require('../css/channel_add_content.less');

export default class AdminHome extends PureComponent {
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    const user = this.props.params.user;
    this.state = {
      user,
    };

    DataCortex.event({ kingdom: 'page_view', phylum: 'admin_home' });

    this._onChannelClick = this._onChannelClick.bind(this);
    this._onUserClick = this._onUserClick.bind(this);
    this._onUserUpdate = this._onUserUpdate.bind(this);
  }
  componentDidMount() {
    UserStore.addChangeListener(this._onUserUpdate);
    this._onUserUpdate();
  }
  componentWillUnmount() {
    UserStore.removeChangeListener(this._onUserUpdate);
  }

  _onChannelClick() {
    this.context.router.push('/admin/channel');
  }
  _onUserClick() {
    this.context.router.push('/admin/user');
  }
  _onUserUpdate() {
    this.setState({ user: UserStore.getUser() });
  }

  render() {
    return (
      <ContentFrame className='admin-home channel-add-container' title="Admin">
        <div className='static-sized-css-fix'>
          <div className='title'>
            <div className='title-text'>Select from one of the options below</div>
          </div>
          <div className='option-list big'>
            <div className='option channel' onClick={this._onChannelClick}>
              <div className='icon channel'/>
              <div className='text'>Channels</div>
            </div>
            <div className='option users' onClick={this._onUserClick}>
              <div className='icon users'/>
              <div className='text'>Users</div>
            </div>
          </div>
          <div className='spacer'/>
        </div>
      </ContentFrame>
    );
  }
}
