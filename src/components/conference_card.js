'use strict';

import React from 'react';

import util from '../util.js';

require('../../css/conference_card.less');

export default class ConferenceCard extends React.Component {
  constructor(props,context) {
    super(props,context);
    this._onClick = this._onClick.bind(this);
  }
  static propTypes = {
    conference: React.PropTypes.object.isRequired,
    onClick: React.PropTypes.func.isRequired,
  };

  _onClick() {
    this.props.onClick(this.props.conference);
  }

  render() {
    const { conference } = this.props;

    let channel = null;
    if (conference.channel_name) {
      channel = (
        <div className='channel-name'>{"#" + conference.channel_name}</div>
      );
    }

    const content = (
      <div className='conf-card' onClick={this._onClick}>
        <div className='image' />
        <div className='below-image'>
          {channel}
          <div className='conf-name'>{ conference.conference_name }</div>
        </div>
      </div>
    );
    return content;
  }
}
