'use strict';

import React from 'react';

import PureComponent from './pure_component.js';

import util from '../util.js';

export default class PDFPageControls extends PureComponent {
  static propTypes = {
    slideCount: React.PropTypes.number.isRequired,
    onPageChange: React.PropTypes.func.isRequired,
  };

  _onPageClick(delta,e) {
    util.stopAll(e);
    const { page, slideCount, onPageChange } = this.props;
    const new_page = page + delta;
    if (new_page >= 1 && new_page <= slideCount ) {
      onPageChange(new_page);
    }
  }

  render() {
    const {
      slideCount,
      format,
      page,
      onFormatChange,
    } = this.props;

    function button_style(name) {
      return "button " + name + (name == format ? " active" : "");
    }

    return (
      <div className='page-controls auto-fade'>
        <div className='inner-container' onClick={util.stopAll}>
          <div
            className='left'
            onClick={this._onPageClick.bind(this,-1)}
          />
          <div className='number'>
            <div>{page + " of " + slideCount}</div>
          </div>
          <div
            className='right'
            onClick={this._onPageClick.bind(this,1)}
          />
        </div>
      </div>
    );
  }
}
