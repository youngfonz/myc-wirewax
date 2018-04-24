'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';

import LoadingOverlay from './components/loading_overlay.js';

import UserStore from './stores/user_store.js';

export default class Logout extends React.Component {
  constructor(props,context) {
    super(props,context);
    this.state = {
      in_progress: false,
    };
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  _onLogoutClick() {
    this.setState({ in_progress: true });
    UserStore.logout((err) => {
      this.setState({ in_progress: false });
      if (err) {
        alert("Login failed, please check your credentials and try again.")
      } else {
        this.context.router.replace("/login");
        DataCortex.event({kingdom: 'logout'});
      }
    });
  }

  render() {
    const { in_progress } = this.state;
    const disabled = in_progress;

    const loading = in_progress ? <LoadingOverlay /> : null;

    const content = (
      <div className="login-container">
        <h1>myc logout</h1>
        <div>
          <button
            disabled={disabled}
            onClick={this._onLogoutClick.bind(this)}
          >
            Logout
          </button>
        </div>
        {loading}
      </div>
    );
    return content;
  }
}
