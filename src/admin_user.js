'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';

import util from './util.js';

import Avatar from './components/avatar.js';
import ContentFrame from './components/content_frame.js';
import LoadingOverlay from './components/loading_overlay.js';
import PureComponent from './components/pure_component.js';

import ContactStore from './stores/contact_store.js';
import UserStore from './stores/user_store.js';

require('../css/admin_user.less');

export default class AdminUser extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      is_ready: false,
      showing_admin_only: false,
    };
    this.available_contacts = [];

    DataCortex.event({ kingdom: 'page_view', phylum: 'admin_user' });

    this._onContactUpdate = this._onContactUpdate.bind(this);
    this._toggleAdminsOnly = this._toggleAdminsOnly.bind(this);
  }
  componentDidMount() {
    ContactStore.addChangeListener(this._onContactUpdate)
    ContactStore.fetch();
    this._onContactUpdate();
  }
  componentWillUnmount() {
    ContactStore.removeChangeListener(this._onContactUpdate);
  }

  _onContactUpdate() {
    const all_contacts = ContactStore.getContacts();
    if(all_contacts.length > 0) {
      const sort_options = {numeric: true, sensitivity: 'base'};
      this.available_contacts = all_contacts.slice();
      this.available_contacts.sort((a, b) => {
        const a_name = a.email || "";
        const b_name = b.email || "";
        return a_name.localeCompare(b_name, undefined, sort_options);
      });
      this.setState({ is_ready: true });
    }
  }
  _toggleAdminsOnly() {
    const showing_admin_only = !this.state.showing_admin_only;
    this.setState({ showing_admin_only });
  }

  render() {
    let content;
    const showing_admin_only = this.state.showing_admin_only;

    if(this.state.is_ready) {
      let user_rows = _.map(this.available_contacts, (user, i) => {
        if(user.is_admin || !showing_admin_only) {
          let admin_user;
          if(user.is_admin) {
            admin_user = <div className="icon-show" />;
          }

          return (
            <div className="admin-user-row" key={ user.user_id }>
              <div className="number">{ i + 1 }</div>
              <div className="image">
                <Avatar user={user} />
              </div>
              <div className="email">
                <div className="user-admin-icon-container">
                  { admin_user }
                </div>
                <div className="user-email">{ user.email }</div>
              </div>
              <div className="name">{ user.user_name }</div>
            </div>
          );
        }
      });

      let toggle_title = "Show Admins";
      if(showing_admin_only) {
        toggle_title = "Show All";
      }

      content = (
        <ContentFrame
          className='user-admin'
          title="User Admin"
          >
          <div className="admin-user-list">
            <div className='top'>
              <div className='title'>Users</div>
              <div className='sub-title'>Currently configured users ({user_rows.length})</div>
              <div className='admin-toggle'>
                <div
                  className='toggle-button'
                  onClick={ this._toggleAdminsOnly }>
                  { toggle_title }
                </div>
              </div>
            </div>
            <div className='admin-user-row title-row'>
              <div className='number'>&nbsp;</div>
              <div className='image'>&nbsp;</div>
              <div className='email'>Email</div>
              <div className='name'>Name</div>
            </div>
            {user_rows}
          </div>
        </ContentFrame>
      );
    } else {
      content = <LoadingOverlay />;
    }

    return content;
  }
}
