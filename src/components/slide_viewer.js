'use strict';

import React from 'react';
import _ from 'lodash';

import PureComponent from './pure_component.js';
import Loading from './loading.js';

import ResourceStore from '../stores/resource_store.js';

import util from '../util.js';

const FORMAT_RATIOS = {
  'one-half': 0.50,
  'no-video': 1.00,
}

export default class SlideViewer extends PureComponent {
  static propTypes = {
    containerClass: React.PropTypes.string.isRequired,
    format: React.PropTypes.string,
    page: React.PropTypes.number,
    slideList: React.PropTypes.array.isRequired,
  };
  static defaultProps = {
    page: 1,
    format: 'full',
  };

  constructor(props,context) {
    super(props,context);
    this.state = {
      width: 100,
      height: 100,
    };

    this._calcSize = this._calcSize.bind(this);
    this._onResize = this._onResize.bind(this);
  }
  componentDidMount() {
    this._onResize();
    util.addResizeListener(this._onResize);
  }
  componentWillUnmount() {
    util.removeResizeListener(this._onResize);
  }
  componentWillReceiveProps(props) {
    const { containerClass, format, page, slideList } = this.props;
    if (
      format != props.format ||
      page != props.page ||
      containerClass != props.containerClass ||
      !util.deepEqual(slideList, props.slideList)
    ) {
      this._calcSize(props);
    }
  }
  componentDidUpdate() {
    this._calcSize(this.props);
  }

  _calcSize(props) {
    props = props || this.props;

    const { containerClass, format, page, slideList } = props;
    if (slideList) {
      const width_ratio = FORMAT_RATIOS[format] || 0.75;
      let slide = slideList[page - 1];
      if (!slide) {
        slide = slideList[0];
      }
      if (slide && slide.media_list && slide.media_list.length > 0) {
        const media0 = slide.media_list[0];
        const img_aspect = media0.width / media0.height;
        const img = this.refs.img;
        const parent = img ? $('.' + containerClass)[0] : window;
        const { width: parent_width, height: parent_height } = util.getSize(parent);
        const container_max_width = parent_width * width_ratio;
        const container_aspect = container_max_width / parent_height;

        let width, height;
        if (img_aspect > container_aspect) {
          width = container_max_width;
          height = container_max_width / img_aspect;
        } else {
          height = parent_height;
          width = parent_height * img_aspect;
        }

        this.setState({ width, height });
      }
    }
  }
  _onResize(reason) {
    this._calcSize();
  }

  render() {
    const { slideList, format, page } = this.props;
    const { width, height } = this.state;

    let content = null;
    if (slideList.length > 0) {
      const style = { width, height };
      let slide = slideList[page - 1];
      if (!slide) {
        slide = slideList[0];
      }
      if (slide && slide.media_list) {
        const src = ResourceStore.getImageURL(slide.media_list,style);
        content = (
          <img
            key={src}
            ref='img'
            style={style}
            src={src}
          />
        );
      }
    }
    return content;
  }
}

function getAspect(obj) {
  const size = util.getSize(obj);
  return size ? size.width / size.height : undefined;
}
