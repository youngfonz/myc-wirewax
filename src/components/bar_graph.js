'use strict';

import React from 'react';
import _ from 'lodash';

import PureComponent from './pure_component.js';

export default class BarGraph extends PureComponent {
  static propTypes = {
    fraction: React.PropTypes.number.isRequired,
  };
  static defaultProps = {
    isVertical: false,
    number: false,
  };

  render() {
    const {
      className,
      fraction,
      isVertical,
      number,
    } = this.props;

    const percent = (fraction * 100).toFixed(2) + "%";
    const style = {};
    if (isVertical) {
      style.height = percent;
    } else {
      style.width = percent;
    }

    let inner_cls = 'inner';
    if (fraction < 0.4) {
      inner_cls += ' red';
    } else if (fraction < 0.6) {
      inner_cls += ' yellow';
    }


    let cls = 'bar-graph';
    if (className) {
      cls += " " + className;
    }
    let label = null;
    if (number !== false) {
      label = (
        <div className='label-container'>
          <div className='label'>{number}</div>
        </div>
      );
    }

    return (
      <div className={cls}>
        <div className={inner_cls} style={style} />
        {label}
      </div>
    );
  }
}
