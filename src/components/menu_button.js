'use strict';

import React from 'react';

export default class MenuButton extends React.Component {
  static propTypes = {
    open: React.PropTypes.bool,
    width: React.PropTypes.number,
    onClick: React.PropTypes.func,
  };
  static defaultProps = {
    open: false,
    width: 60,
    onClick: function() {},
  };

  render() {
    const { open, width, onClick } = this.props;
    return (
      <div
        className='animated-menu-button'
        onClick={onClick}
      >
        <div className={open ? 'open' : ''}>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }
}
