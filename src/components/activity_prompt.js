'use strict';

import React from 'react';

import PureComponent from './pure_component.js';

import util from '../util.js';

const PROMPT_MS = 5*60*1000;
const PROMPT_HIDE_MS = 10*1000;
const PROMPT_CLEAR_MS = 2*1000;

export default class ActivityPrompt extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this.state = {
      is_prompt_shown: false,
      is_prompt_hidden: false,
    };
    this.disarm = true;
    this.check_interval = null;
    this.hide_timeout = null;
    this.clear_timeout = null;
    this.last_activity_time = Date.now();

    this._onHideClick = this._onHideClick.bind(this);
  }
  static propTypes = {
    text: React.PropTypes.string,
  };
  static defaultProps = {
    text: "Activity Prompt Text.",
  };
  componentDidMount() {
    this.disarm = false;
    this._startCheckInterval();
  }
  componentWillUnmount() {
    this.disarm = true;
    this._stopCheckInterval();
    this._stopTimeouts();
  }
  _startCheckInterval() {
    if (!this.check_interval) {
      this.check_interval = setInterval(() => this._maybeShowPrompt(),1000);
    }
  }
  _stopCheckInterval() {
    if (this.check_interval) {
      clearInterval(this.check_interval);
      this.check_interval = null;
    }
  }
  _stopTimeouts() {
    if (this.hide_timeout) {
      clearTimeout(this.hide_timeout);
      this.hide_timeout = null;
    }
    if (this.clear_timeout) {
      clearTimeout(this.clear_timeout);
      this.clear_timeout = null;
    }
  }

  _maybeShowPrompt() {
    if (!this.disarm) {
      const { lastActivityTime } = this.props;
      const last_time = Math.max(lastActivityTime,this.last_activity_time);

      const delta = Date.now() - last_time;
      const { is_prompt_shown, is_prompt_hidden } = this.state;
      if (delta > PROMPT_MS && !is_prompt_shown) {
        this.last_activity_time = Date.now();
        this.setState({ is_prompt_shown: true, is_prompt_hidden: false });
        this._hidePromptLater();
      }
    }
  }
  _clearPromptLater() {
    this._stopTimeouts();
    this.clear_timeout = setTimeout(() => this._clearPrompt(),PROMPT_CLEAR_MS);
  }
  _clearPrompt() {
    if (!this.disarm) {
      this.setState({ is_prompt_shown: false, is_prompt_hidden: false });
    }
  }
  _hidePromptLater() {
    this._stopTimeouts();
    this.hide_timeout = setTimeout(() => this._onHideClick(),PROMPT_HIDE_MS);
  }
  _onHideClick(e) {
    util.stopAll(e);
    this.setState({ is_prompt_hidden: true });
    this._clearPromptLater();
  }

  render() {
    const { video, text, className } = this.props;
    const { is_prompt_shown, is_prompt_hidden } = this.state;

    let content = null;
    if (is_prompt_shown) {
      let cls = 'activity-prompt ' + className;
      if (is_prompt_hidden) {
        cls += ' hidden';
      }

      content =  (
        <div className={cls}>
          {text}
          <div className='hide-button' onClick={this._onHideClick} />
        </div>
      );
    }

    return content;
  }
}
