'use strict';

import React from 'react';

import PureComponent from './pure_component.js';

import util from '../util.js';
import storage from '../storage.js';

require('../../css/help_overlay.less');

export default class HelpOverlay extends PureComponent {
  constructor(props,context) {
    super(props,context);

    this.storage_key = "my_channel.ftu_hide_" + props.overlayKey;
    this.state = {
      is_hidden: storage.getSync(this.storage_key,false),
    };

    this._onButtonClick = this._onButtonClick.bind(this);
  }
  static propTypes = {
    buttonText: React.PropTypes.string,
  };
  static defaultProps = {
    buttonText: "Get Started",
  };
  _onButtonClick() {
    storage.set(this.storage_key,true);
    this.setState({ is_hidden: true });
  }

  render() {
    const { buttonText } = this.props;
    const { is_hidden } = this.state;

    let content = null;
    if (false && !is_hidden) {
      content = (
        <div className="help-overlay-container" onClick={util.stopAll}>
          <div className="inner">
            {this.props.children}
            <div className="button" onClick={this._onButtonClick}>
              {buttonText}
            </div>
          </div>
        </div>
      );
    }
    return content;
  }
}
