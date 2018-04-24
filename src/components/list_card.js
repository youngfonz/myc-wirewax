'use strict';

import React from 'react';
import PureComponent from './pure_component.js';

export default class ListCard extends PureComponent {
  constructor(props,context) {
    super(props,context);
    this._onClick = this._onClick.bind(this);
  }
  static propTypes = {
    channelName: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    imageUrl: React.PropTypes.string,
    object: React.PropTypes.object.isRequired,
    onClick: React.PropTypes.func.isRequired,
  };
  static defaultProps = {
    imageUrl: null,
  };

  _onClick() {
    this.props.onClick(this.props.object);
  }

  render() {
    const {
      channelName,
      name,
      imageUrl,
    } = this.props;

    const style = {};
    if (imageUrl) {
      style.backgroundImage = "url(" + imageUrl + ")";
    }
    const content = (
      <div
        className='list-card'
        style={style}
        onClick={this._onClick}
      >
        <div className='detail'>
          <div className='channel-name'>{"#" + channelName}</div>
          <div className='name'>{name}</div>
        </div>
      </div>
    );
    return content;
  }
}
