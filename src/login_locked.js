'use strict';

import React from 'react';
import { Link } from 'react-router';

import UserStore from './stores/user_store.js';

export default class LoginLocked extends React.Component {
  constructor(props,context) {
    super(props,context);
    this.state = {
      email: "",
    };
  }

  render() {
    const {
      email,
    } = this.state;

    const content = (
      <div className="login-locked-container sidebar-container">
        <h1>myc login</h1>
        <hr/>
        <p>Email: {email}</p>
        <hr/>
        <p>
          Your user has been locked. Please contact an administrator to have
          your account unlocked.
        </p>
        <Link to="/login">Not You?</Link>
      </div>
    );
    return content;
  }
}
