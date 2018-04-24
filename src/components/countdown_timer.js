'use strict';

import React from 'react';
import util from '../util.js';
import PureComponent from './pure_component.js';

require('../../css/countdown_timer.less');

export default class CountdownTimer extends PureComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      is_stopped: false,
    };

    this.timeout = false;
    this._onStopClick = this._onStopClick.bind(this);
    this._onNextClick = this._onNextClick.bind(this);
  }
  componentDidMount() {
    this._stopTimeout();
    this.timeout = window.setTimeout(this._onNextClick,10*1000);
  }
  componentWillUnmount() {
    this._stopTimeout();
  }
  _stopTimeout() {
    if (this.timeout) {
      window.clearTimeout(this.timeout);
      this.timeout = false;
    }
  }
  _onStopClick() {
    this._stopTimeout();
    this.setState({ is_stopped: true });
  }
  _onNextClick() {
    this._stopTimeout();
    this.props.onNext();
  }

  render() {
    const { is_stopped } = this.state;

    let cls = "";
    if (is_stopped) {
      cls = " stopped";
    }

    return (
      <div className={"countdown-timer" + cls}>
        <div className='spinner' onClick={this._onNextClick}>
          <div className='left-container'>
            <div className='left'></div>
          </div>
          <div className='right-container'>
            <div className='right'></div>
          </div>
          <div className='play-icon'></div>
        </div>
        <div className='cancel-container'>
          <div className='cancel-button'>
            <div className='text' onClick={this._onStopClick}>Cancel</div>
          </div>
        </div>
      </div>
    );
  }
}
