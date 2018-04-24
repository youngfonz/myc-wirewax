'use strict';

import React from 'react';
import util from '../util.js';

require('../../css/format_controls.less');

export default class FormatControls extends React.Component {
  static propTypes = {
    onFormatChange: React.PropTypes.func.isRequired,
  };
  render() {
    const {
      format,
      onFormatChange,
    } = this.props;

    function button_style(name) {
      return "control-button " + name + (name == format ? " active" : "");
    }

    return (
      <div
        className='format-controls'
        onClick={util.stopAll}
      >
        <div
          className='control-button one-half'
          title="Change Slide Format"
          onClick={onFormatChange}
        >
          <div>
            <div/>
          </div>
        </div>
      </div>
    );
  }
}
