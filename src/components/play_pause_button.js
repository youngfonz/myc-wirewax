'use strict';

import React from 'react';
import PureComponent from './pure_component.js';

export default class PlayPauseButton extends PureComponent {
  static propTypes = {
    paused: React.PropTypes.bool.isRequired,
    onClick: React.PropTypes.func,
  };
  static defaultProps = {
    onClick: function() {},
  };

  render() {
    const { paused, ended, onClick } = this.props;
    let cls = "play-pause-button";
    if (ended) {
      cls += " ended";
    } else if (paused) {
      cls += " paused";
    }
    return (
      <div className={cls} onClick={onClick}>
        <div/>
      </div>
    );
  }
}
