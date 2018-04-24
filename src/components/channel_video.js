'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';
import util from '../util.js';

import PureComponent from './pure_component.js';
import Button from './button.js';
import VideoPlayer from './video_player.js';
import SlideViewer from './slide_viewer.js';
import PDFPageControls from './pdf_page_controls.js';

import SlideStore from '../stores/slide_store.js';

require('../../css/channel_video.less');
require('../../css/presentation.less');

export default class ChannelVideo extends PureComponent {
  constructor(props,context) {
    super(props,context);
    this.state = {
      seq_format: false,
      page_number: false,
      hide_hold_image: false,
    };
    this.video_id = props.video.channel_video_id;
    this.slide_store = false;

    this._onSlideStoreUpdate = this._onSlideStoreUpdate.bind(this);
    this._onPageChange = this._onPageChange.bind(this);
    this._onTimeUpdate = this._onTimeUpdate.bind(this);

    this._onHideHoldClick = this._onHideHoldClick.bind(this);
  }
  static propTypes = {
    video: React.PropTypes.object.isRequired,
    paused: React.PropTypes.bool,
    onVideoClick: React.PropTypes.func,
    onEnded: React.PropTypes.func,
    onTimeUpdate: React.PropTypes.func,
  };
  static defaultProps = {
    paused: false,
    userFormat: false,
    onVideoClick: function() {},
    onEnded: function() {},
    onTimeUpdate: function() {},
  };
  componentWillReceiveProps(nextProps) {
    const video_id = nextProps.video.channel_video_id;
    if (this.video_id != video_id) {
      this.video_id = video_id;

      this._removeListener();
      this.setState({ page_number: false });
      this._addListener(nextProps.video);
    }
  }
  componentDidMount() {
    this._addListener(this.props.video);
  }
  componentWillUnmount() {
    this._removeListener();
  }
  _addListener(video) {
    if (!this.slide_store) {
      this.slide_store = SlideStore.getStore(video);
      this.slide_store.addChangeListener(this._onSlideStoreUpdate);
      this._onSlideStoreUpdate();
    }
  }
  _removeListener() {
    if (this.slide_store) {
      this.slide_store.removeChangeListener(this._onSlideStoreUpdate);
      this.slide_store = null;
    }
  }

  seek(time) {
    this.refs.video.seek(time);
  }

  _onSlideStoreUpdate() {
    const page_number = this.slide_store.getSlidePage();
    this.setState({ page_number });
  }
  _onPageChange(page_number) {
    this.slide_store.sendPageNumber(page_number);
    DataCortex.event({
      kingdom: 'view',
      phylum: 'channel_video_page',
      class: 'slide_page_change',
      species: this.video_id,
      float1: page_number,
    });
  }
  _onTimeUpdate({ currentTime, bufferedTime }) {
    this.props.onTimeUpdate({ currentTime, bufferedTime });
    this.slide_store.updateTime(currentTime);
  }
  _onHideHoldClick() {
    this.setState({ hide_hold_image: true });
  }

  render() {
    const {
      user,
      video,
      paused,
      userFormat,
      muted,
      volume,
      ended,
    } = this.props;

    const {
      page_number,
      seq_format,
      hide_hold_image,
    } = this.state;

    const format = userFormat || 'one-quarter';
    const page = page_number || 1;

    const video_player = (
      <VideoPlayer
        ref="video"
        format={format}
        video={video}
        paused={paused}
        ended={ended}
        muted={muted}
        volume={volume}
        onVideoClick={this.props.onVideoClick}
        onEnded={this.props.onEnded}
        onTimeUpdate={this._onTimeUpdate}
      />
    );

    let pdf = null;
    if (this.slide_store && this.slide_store.hasPresentation()) {
      let controls = null;
      if (this.slide_store.hasPageControls()) {
        controls = (
          <PDFPageControls
            slideCount={video.slide_count}
            page={page}
            onPageChange={this._onPageChange}
          />
        );
      }

      pdf = (
        <div className={'presentation-container ' + format}>
          <SlideViewer
            containerClass="channel-video-container"
            format={format}
            page={page}
            slideList={video.slide_list}
          />
          {controls}
        </div>
      );
    }

    let inner = null;
    if (video.hold_image_url && !hide_hold_image) {
      let hide_button = null;
      if (user.is_admin) {
        hide_button = (
          <Button
            text="Hide Hold Card"
            onClick={this._onHideHoldClick}
          />
        );
      }
      inner = (
        <div
          className='video-hold-card'
          style={{ backgroundImage: "url(" + video.hold_image_url + ")" }}
        >
          {hide_button}
        </div>
      );
    } else {
      inner = (
        <div className={'video-presentation ' + format}>
          {video_player}
          {pdf}
        </div>
      );
    }
    return (
      <div className='channel-video-container'>
        {inner}
      </div>
    );
  }
}
