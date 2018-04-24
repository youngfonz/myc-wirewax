'use strict';

import React from 'react';

import util from '../util.js';

import Input from './input.js';
import PureComponent from './pure_component.js';
import LoadingOverlay from './loading_overlay.js';

import ContactStore from '../stores/contact_store.js';

require('../../css/invite_list.less');

export default class InviteList extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      is_ready: false,
      match_list: [],
      search: "",
    };

    this._onUserAdded = this._onUserAdded.bind(this);
    this._onUserSearchChange = this._onUserSearchChange.bind(this);
    this._onContactUpdate = this._onContactUpdate.bind(this);
  }
  static propTypes = {
    inviteList: React.PropTypes.array,
    onAdded: React.PropTypes.func.isRequired,
    onRemoved: React.PropTypes.func.isRequired,
    supressCurrentUser: React.PropTypes.bool,
    user: React.PropTypes.object,
  };
  static defaultProps = {
    inviteList: [],
    supressCurrentUser: false,
    user: {},
  };

  componentDidMount() {
    ContactStore.addChangeListener(this._onContactUpdate)
    ContactStore.fetch();
    this._onContactUpdate();
  }
  componentWillUnmount() {
    ContactStore.removeChangeListener(this._onContactUpdate);
  }
  _onContactUpdate() {
    const is_ready = ContactStore.isReady();
    this.setState({ is_ready });

    const { search } = this.state;
    this._onUserSearchChange(search);
  }
  _onUserAdded(user) {
    this.props.onAdded(user);
    this.setState({
      match_list: [],
      search: "",
    });
  }
  _onUserSearchChange(search) {
    let match_list = [];
    if (search.length > 0) {
      match_list = ContactStore.getTopContacts(search);
    }
    this.setState({
      match_list,
      search,
    });
  }

  render() {
    const {
      user,
      supressCurrentUser,
      inviteList,
      onAdded,
      onRemoved,
    } = this.props;

    const {
      is_ready,
      match_list,
      search,
    } = this.state;

    let content = <LoadingOverlay />;
    if (is_ready) {
      let marches = null;
      if (search && match_list) {
        let user_rows;

        if (match_list.length < 1) {
          user_rows = (
            <div className="user-search-no-match-row">No matches found.</div>
          );
        } else {
          user_rows = _.map(match_list,(user) => {
            return (
              <div
                key={user.email}
                className="user-search-match-row"
                onClick={this._onUserAdded.bind(this,user)}
              >
                {user.email}
              </div>
            );
          });
        }

        marches = (
          <div className="user-search-matches">
            {user_rows}
          </div>
        );
      }

      let invited_users = null;
      if (inviteList && inviteList.length > 0) {
        let reversed = inviteList.slice();
        if (user && supressCurrentUser) {
          reversed = _.filter(reversed,(u) => u.email != this.props.user.email);
        }

        const invited_users_rows = _.map(reversed.reverse(),(user) => {
          return (
            <div key={user.email} className="invited-user-row">
              <div
                className="delete-user"
                onClick={onRemoved.bind(null,user.email)}
              >
                <div/>
              </div>
              <div className="user-text">{user.email}</div>
            </div>
          );
        });

        invited_users = (
          <div className="invited-users">
            {invited_users_rows}
          </div>
        );
      }

      content = (
        <div className='contact-suggestion-container' onClick={util.stopAll}>
          <div className='input'>
            {marches}
            <div className='label'>Add Users</div>
            <Input
              placeholder="Search for users by email"
              onTextChange={this._onUserSearchChange}
              value={search}
            />
          </div>
          <div className='added-users'>
            {invited_users}
          </div>
        </div>
      );
    }

    return content;
  }
}
