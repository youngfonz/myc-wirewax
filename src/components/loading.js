'use strict';

import React from 'react';

import PureComponent from './pure_component.js';

export default class Loading extends PureComponent {
  static propTypes = {
    color: React.PropTypes.string,
  };

  render() {
    const { className, color } = this.props;
    const cls = "loader" + (className ? " " + className : "");
    const style = {};
    if (color) {
      style.borderColor = "transparent " + color + " " + color + " " + color;
    }

    return (
      <div className={cls}>
        <div className='arc' style={style} />
      </div>
    );
  }
}
