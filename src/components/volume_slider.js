'use strict';

import React from 'react';
import PureComponent from './pure_component.js';

import util from '../util.js';

require('../../css/volume_slider.less');

export default class VolumeSlider extends PureComponent {
  constructor(props,context) {
    super(props,context);
    this._onMuteClick = this._onMuteClick.bind(this);
    this._onVolumeClick = this._onVolumeClick.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
  }
  static propTypes = {
    volume: React.PropTypes.number,
    muted: React.PropTypes.bool,
    onChange: React.PropTypes.func.isRequired,
  };

  _onMuteClick(e) {
    util.stopAll(e);
    const { volume, muted } = this.props;
    this.props.onChange({ volume, muted: !muted });
  }
  _onVolumeClick(e) {
    util.stopAll(e);
    let { muted } = this.props;
    const bounding_rect = this.refs.slide_outer.getBoundingClientRect();

    const client_left = e.clientX;
    let volume = ( client_left - bounding_rect.left ) / bounding_rect.width;
    volume = Math.max(volume,0.0);
    volume = Math.min(volume,1.0);
    if (muted && volume > 0) {
      muted = false;
    }
    this.props.onChange({ volume, muted });
  }
  _onMouseMove(e) {
    let buttons = e.nativeEvent.buttons;
    if (buttons == undefined ) {
      buttons = e.nativeEvent.which;
    }
    if (buttons == 1) {
      this._onVolumeClick(e);
    }
  }

  render() {
    let { volume, muted } = this.props;
    const is_muted = muted || volume == 0.0;
    if (is_muted) {
      volume = 0.0;
    }

    const style = {
      width: '' + (volume*100.0) + '%',
    };

    return (
      <div className={'volume-slider no-ios' + (is_muted ? ' muted' : '')}>
        <div className='icon' onClick={this._onMuteClick} />
        <div
          ref='slide_outer'
          className='slider-outer'
          onClick={this._onVolumeClick}
          onMouseMove={this._onMouseMove}
        >
          <div className='slider'>
            <div className='inner' style={style}/>
            <div className='knob'/>
          </div>
        </div>
      </div>
    );
  }
}
