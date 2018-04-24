'use strict';

import React from 'react';
import util from '../util.js';
import PureComponent from './pure_component.js';

const TIME_RESOLUTION_IN_MS = 1000;

export default class CountUpTimer extends PureComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      last_called: Math.floor(Date.now() / TIME_RESOLUTION_IN_MS),
      seconds: 0,
    };

    this.timer = null;

    this._clearTimer = this._clearTimer.bind(this);
    this._setTimer = this._setTimer.bind(this);
    this._updateTime = this._updateTime.bind(this);
  }
  componentDidMount() {
    this._setTimer();
  }
  componentWillUnmount() {
    this._clearTimer();
  }

  _clearTimer() {
    clearTimeout(this.timer);
  }
  _setTimer() {
    this.timer = setTimeout(this._updateTime, TIME_RESOLUTION_IN_MS / 4);
  }
  _updateTime() {
    const current_seconds = Math.floor(Date.now() / TIME_RESOLUTION_IN_MS);
    const last_called = this.state.last_called;

    if(current_seconds > last_called) {
      const time_diff = current_seconds - last_called;
      this.setState({
        last_called: current_seconds,
        seconds: this.state.seconds + time_diff,
      });
    }

    this._setTimer();
  }

  render() {
    const { seconds } = this.state;
    return (
      <div className="count-up-timer-container">
        <div className="minutes">{Math.floor(seconds/60)}</div>
        <div className="divider">:</div>
        <div className="seconds">{util.pad(seconds % 60)}</div>
      </div>
    );
  }
}
