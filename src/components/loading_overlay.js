'use strict';

import React from 'react';

import PureComponent from './pure_component.js';

export default class LoadingOverlay extends PureComponent {
  static propTypes = {
    loadingText: React.PropTypes.string,
    position: React.PropTypes.string,
    progressPercent: React.PropTypes.number,
  };
  static defaultProps = {
    position: "fixed",
    loadingText: null
  };

  render() {
    const style = {
      position: this.props.position,
    };

    let loading_text;
    if(this.props.loadingText) {
      loading_text = (
        <div className="loading-overlay-text">
          { this.props.loadingText }
        </div>
      );
    }

    let progress_bar;
    if(this.props.progressPercent) {
      const progress_percent = this.props.progressPercent;
      progress_bar = <progress max="100" value={ progress_percent } />;
    }

    return (
      <div className='loading-overlay' style={style}>
        <div className='loader'>
          <div className='arc' />
        </div>
        { loading_text }
        { progress_bar }
      </div>
    );
  }
}
