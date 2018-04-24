'use strict';

import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

import util from '../util.js';

export default class PureComponent extends React.Component  {
  constructor(props,context) {
    super(props,context);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }
}
