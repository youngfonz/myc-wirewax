'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import GlobalMenu from './components/global_menu.js';

require('../css/root.less');

export default class Root extends React.Component {
  render() {
    const segment = this.props.location.pathname || 'root';
    const content = (
      <div className="root-container">
        <div className="global-content-container">
          {this.props.children}
        </div>
        <GlobalMenu />
      </div>
    );
    return content;
  }
}
