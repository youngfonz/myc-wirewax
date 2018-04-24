'use strict';

import React from 'react';

import util from '../util.js';

export default class DataMap extends React.Component {
  constructor(props,context) {
    super(props,context);

    this._onResize = this._onResize.bind(this);
  }
  componentDidMount() {
    this._renderMap();
    util.addResizeListener(this._onResize);
  }
  componentWillUnmount() {
    util.removeResizeListener(this._onResize);
  }

  _onResize() {
    if (this.map) {
      this.map.resize();
    }
  }

  _renderMap() {
    const data_map = this.refs.data_map;
    const config = {
      element: data_map,
      responsive: true,
      fills: {
        GREEN: '#1ab172',
        YELLOW: '#f3a636',
        RED: '#e6644f',
        BLUE: '#23659d',
        defaultFill: '#23659d',
      },
      data: {
        USA: {
          fillKey: 'GREEN',
          numberOfThings: 10381,
        },
      },
      geographyConfig: {
        popupTemplate,
      },
    };

    this.map = new Datamap(config);
  }

  render() {
    const { video } = this.props;

    const content = (
      <div className='data-map-container' ref='container'>
        <div ref='data_map' className='data-map' />
      </div>
    );
    return content;
  }
}

function popupTemplate(geo, data) {
  const s =
"<div class='hoverinfo'>"
+ "</div>";

  return s;
}
