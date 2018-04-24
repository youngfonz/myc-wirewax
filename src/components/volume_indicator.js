'use strict';

import React from 'react';
import PureComponent from './pure_component.js';

import VolumeIndicatorStore from '../stores/volume_indicator_store.js';

export default class VolumeIndicator extends PureComponent {
  constructor(props, context) {
    super(props, context);
    this.state = {
      volume: null,
      clipping: false
    }
    this._onVolumeChange = this._onVolumeChange.bind(this);
  }

  _onVolumeChange() {
    const current_volume = VolumeIndicatorStore.getVolume();
    const is_clipping = VolumeIndicatorStore.getClipping();
    const old_volume = this.state.volume;

    if(Math.abs(current_volume - old_volume) > 0.01) {
      this.setState({
        volume: current_volume,
        clipping: is_clipping
      });
    }
  }

  componentDidMount() {
    this._onVolumeChange();
    VolumeIndicatorStore.addChangeListener(this._onVolumeChange);
  }

  componentWillUnmount() {
    VolumeIndicatorStore.removeChangeListener(this._onVolumeChange);
    VolumeIndicatorStore.shutdown();
  }

  render() {
    <div className="volume-indicator-container">
      { volume }
    </div>
  }
}
