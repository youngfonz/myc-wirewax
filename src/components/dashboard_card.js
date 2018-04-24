'use strict';

import React from 'react';

import PureComponent from './pure_component.js';
import DashboardCard from './dashboard_card.js';

export default class DashboardOverview extends PureComponent {
  static propTypes = {
    title: React.PropTypes.string.isRequired,
  };

  render() {
    const {
      title,
      children,
    } = this.props;
    return (
      <div className={'dashboard-card ' + title}>
        <div className={'card-header ' + title}>
          <div className={'icon ' + title} />
          <div className='text'>{title}</div>
        </div>
        <div className={'body ' + title}>
          {children}
        </div>
      </div>
    );
  }
}
