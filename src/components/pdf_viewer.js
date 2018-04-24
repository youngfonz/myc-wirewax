'use strict';

import React from 'react';

import Loading from './loading.js';

import ResourceStore from '../stores/resource_store.js';

import util from '../util.js';

export default class PDFViewer extends React.Component {
  constructor(props,context) {
    super(props,context);
    this.state = {
      is_pdf_loading: true,
      rendered_page_number: false,
    };
    this.pdf_doc = false;
    this.page_map = {};

    this.is_rendering = false;
    this.is_dirty = false;

    this.page_number = props.page || 1;
    this.format = props.format;

    this._onResize = this._onResize.bind(this);
  }
  static propTypes = {
    fileHash: React.PropTypes.string.isRequired,
    page: React.PropTypes.number,
    format: React.PropTypes.string,
  };
  static defaultProps = {
    page: 1,
    format: 'full',
  };
  componentDidMount() {
    this._loadPDF();
    util.addResizeListener(this._onResize);
  }
  componentWillUnmount() {
    util.removeResizeListener(this._onResize);
  }
  componentWillReceiveProps(props) {
    let dirty = false;
    if (props.page && props.page != this.page_number) {
      this.page_number = props.page;
      dirty = true;
    }
    if (props.format && props.format != this.format) {
      this.format = props.format;
      dirty = true;
    }
    if (dirty) {
      this._renderPage();
    }
  }
  _onResize(reason) {
    if (reason != 'pdf') {
      this._renderPage();
    }
  }

  _loadPDF() {
    const { fileHash } = this.props;
    const url = ResourceStore.getResourceURL(fileHash);
    PDFJS.getDocument(url).then((pdf_doc) => {
      this.pdf_doc = pdf_doc;
      this._renderPage();
      this.setState({ is_pdf_loading: false });
    }).catch((err) => {
      console.error("_loadPDF: err:",err);
    });
  }
  _getPage(num,done) {
    if (this.page_map[num]) {
      done(null,this.page_map[num]);
    } else if (this.pdf_doc) {
      this.pdf_doc.getPage(num).then((page) => {
        this.page_map[num] = page;
        done(null,page);
      }).catch((err) => {
        console.error("_getPage: err:",err);
        done(err);
      });
    } else {
      done('no_doc');
    }
  }
  _calcScale(page) {
    let width_ratio = 0.75;
    if (this.format == 'one-half') {
      width_ratio = 0.5;
    } else if (this.format == 'no-video') {
      width_ratio = 1.0;
    }

    const viewport = page.getViewport(1.0);
    const viewport_aspect = getAspect(viewport);
    const { pdf_container } = this.refs;
    const parent = pdf_container ? pdf_container.parentNode.parentNode : window;
    const { width: parent_width, height: parent_height } = getSize(parent);
    const container_max_width = parent_width * width_ratio;
    const container_aspect = container_max_width / parent_height;

    let width, height;
    if (viewport_aspect > container_aspect) {
      width = container_max_width;
      height = container_max_width / viewport_aspect;
    } else {
      height = parent_height;
      width = parent_height * viewport_aspect;
    }
    const scale = width/viewport.width;
    return { width, height, scale };
  }
  _renderPage() {
    const { page_number } = this;
    if (!this.is_rendering) {
      this.is_rendering = true;
      this.is_dirty = false;
      this._getPage(page_number,(err,page) => {
        if (err) {
          console.error("_renderPage: err:",err);
          this.is_rendering = false;
        } else {
          const { scale, width, height } = this._calcScale(page);

          const { canvas } = this.refs;
          const fire_resize = canvas.width != width || canvas.height != height;
          canvas.width = width;
          canvas.height = height;
          const viewport = page.getViewport(scale);
          const renderContext = {
            canvasContext: canvas.getContext('2d'),
            viewport,
          };
          pdfRenderPage(page,renderContext,(err) => {
            if (err) {
              console.error("_renderPage: renderTask err:",err);
            }
            if (fire_resize) {
              util.fireResizeLater('pdf');
            }
            this.is_rendering = false;
            this.setState({ rendered_page_number: page_number })
            if (this.is_dirty) {
              this._renderPage();
            }
          });
        }
      });
    } else {
      this.is_dirty = true;
    }
  }

  render() {
    const { video, format } = this.props;
    const { is_pdf_loading, rendered_page_number } = this.state;

    let loading = null;
    if (is_pdf_loading || rendered_page_number !== this.page_number) {
      loading = (
        <div className='pdf-loading-container'>
          <Loading />
        </div>
      );
    }
    let style = {};
    if (rendered_page_number === false) {
      const { innerWidth } = window;
      let fixed_width = false;
      if (format == 'one-quarter') {
        fixed_width = innerWidth*0.75;
      } else if (format == 'one-half') {
        fixed_width = innerWidth*0.5;
      }
      if (fixed_width) {
        style.width = fixed_width + "px";
      }
    }

    const content = (
      <div
        ref='pdf_container'
        className={'pdf-container ' + format}
        style={style}
      >
        <canvas ref='canvas' />
        {loading}
      </div>
    );
    return content;
  }
}

function getSize(obj) {
  let size;
  if (obj.width) {
    size = { width: obj.width, height: obj.height };
  } else if (obj.clientWidth) {
    size = { width: obj.clientWidth, height: obj.clientHeight };
  } else if (obj.innerWidth) {
    size = { width: obj.innerWidth, height: obj.innerHeight };
  }
  return size;
}

function getAspect(obj) {
  const size = getSize(obj);
  return size ? size.width / size.height : undefined;
}

function pdfRenderPage(page,renderContext,done) {
  const renderTask = page.render(renderContext);
  renderTask.promise.then(function () {
    done(null);
  }).catch((err) => {
    done(err);
  });
}
