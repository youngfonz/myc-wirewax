
'use strict';

import React from 'react';

import PureComponent from './pure_component.js';

export default class CoverImage extends PureComponent {
  constructor(props,context) {
    super(props,context);
    this.state = {
      naturalHeight: 0,
      naturalWidth: 0,
    };
    this._onLoad = this._onLoad.bind(this);
  }
  _onLoad() {
    const { img } = this.refs;
    if (img) {
      const { height, width, naturalHeight, naturalWidth } = img;
      this.setState({ naturalHeight, naturalWidth });
    }
  }

  render() {
    let { style, ...extra } = this.props;
    const { naturalWidth, naturalHeight } = this.state;

    let image_style = Object.assign({}, style);
    if (naturalHeight && naturalWidth) {
      if (naturalWidth > naturalHeight) {
        image_style.height = "100%";
      } else {
        image_style.width = "100%";
      }
    }

    return  <img {...extra} ref='img' style={image_style} onLoad={this._onLoad} />;
  }
}
