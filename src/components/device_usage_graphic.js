'use strict';

import React from 'react';

import PureComponent from './pure_component.js';

export default class DeviceUsageGraphic extends PureComponent {
  render() {
    const {
      phone,
      tablet,
      desktop,
    } = this.props;

    return (
      <div className='device-usage-graphic'>
        <div className='title'>Device Usage</div>
        <div className='devices'>
          <div className='device phone'>
            <div className='icon phone'/>
            <div className='value'>{phone}%</div>
            <div className='label'>Phone</div>
          </div>
          <div className='device tablet'>
            <div className='icon tablet'/>
            <div className='value'>{tablet}%</div>
            <div className='label'>Tablet</div>
          </div>
          <div className='device desktop'>
            <div className='icon desktop'/>
            <div className='value'>{desktop}%</div>
            <div className='label'>Desktop</div>
          </div>
        </div>
      </div>
    );
  }
}
