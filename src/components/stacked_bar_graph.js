'use strict';

import React from 'react';
import _ from 'lodash';

import PureComponent from './pure_component.js';

export default class StackedBarGraph extends PureComponent {
  render() {
    const {
      dataset
    } = this.props;

    const bars = _.map(dataset,(data,i) => {
      const top = parseInt(data.bars[1].toFixed(0));
      const bottom = parseInt(data.bars[0].toFixed(0));

      let top_bar = null;
      if (top > 0) {
        top_bar = (
          <div className='top bar-part' style={{ flexGrow: top}}>
            <div className='text'>-{top}%</div>
          </div>
        );
      }
      let bottom_bar = null;
      if (bottom > 0) {
        bottom_bar = (
          <div className='bottom bar-part' style={{ flexGrow: bottom}}>
            <div className='text'>+{bottom}%</div>
          </div>
        );
      }

      return (
        <div key={'bar_' + i} className='bar'>
          {top_bar}
          {bottom_bar}
        </div>
      );
    });
    const labels = _.map(dataset,(data,i) => {
      return (
        <div key={'label_' + i} className='label'>{data.label}</div>
      );
    });

    return (
      <div className='stacked-bar-graph'>
        <div className='bars'>
          {bars}
        </div>
        <div className='labels'>
          {labels}
        </div>
      </div>
    );
  }
}
