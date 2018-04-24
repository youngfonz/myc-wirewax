'use strict';

import React from 'react';

import PureComponent from './pure_component.js';

export default class TrendScore extends PureComponent {
  static defaultProps = {
    size: 'small',
  };

  render() {
    let {
      title,
      size,
      score,
      trend,
    } = this.props;

    if (typeof score == 'number') {
      score = score.toFixed(0);
    }

    let trend_div = null;
    if (trend >= 0) {
      trend_div = (
        <div className='trend increase'>
          <div className='icon'/>
          <div className='text'>
            {trend.toFixed(0)}% Increase
          </div>
        </div>
      );
    } else {
      trend_div = (
        <div className='trend decrease'>
          <div className='icon'/>
          <div className='text'>
            {trend.toFixed(0)}% Decrease
          </div>
        </div>
      );
    }

    return (
      <div className={'trend-score ' + size}>
        <div className='title'>{title}</div>
        <div className='score'>{score}</div>
        {trend_div}
      </div>
    );
  }
}
