'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';

import PureComponent from './components/pure_component.js';
import ContentFrame from './components/content_frame.js';
import DashboardOverview from './components/dashboard_overview.js';
import DashboardHelpOverlay from './components/dashboard_help_overlay.js';

import util from './util.js';

require('../css/dashboard.less');

export default class Dashboard extends PureComponent {
  constructor(props,context) {
    super(props,context);
    this.state = {
      user: this.props.params.user,
      selectedPage: 'overview',
    };

    DataCortex.event({ kingdom: 'page_view', phylum: 'dashboard' });

    this._onBackClick = this._onBackClick.bind(this);
    this._onMenuItemClick = this._onMenuItemClick.bind(this);
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };
  _onBackClick() {
    this.context.router.push("/home");
  }
  _onMenuItemClick(selectedPage) {
    this.setState({ selectedPage });
  }
  render() {
    const {
      user,
      selectedPage,
    } = this.state;

    const content = (
      <ContentFrame
        className='dashboard-container'
        title="Sentiment Analysis Dashboard"
      >
        <DashboardOverview />
        <DashboardHelpOverlay />
      </ContentFrame>
    );
    return content;
  }
}
