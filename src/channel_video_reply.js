'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';

import storage from './storage.js';

import Button from './components/button.js';
import ChannelVideoReplyControls from './components/channel_video_reply_controls.js';
import HTML5VideoPlayer from './components/html5_video_player.js';
import LoadingOverlay from './components/loading_overlay.js';
import LocalVideoFeed from './components/local_video_feed.js';
import PlayPauseButton from './components/play_pause_button.js';
import PureComponent from './components/pure_component.js';
import VolumeSlider from './components/volume_slider.js';

import AdapterLoaderStore from './stores/adapter_loader_store.js';
import ChannelStore from './stores/channel_store.js';
import VideoRecorderStore from './stores/video_recorder_store.js';

require('../css/channel_video_page.less');
require('../css/channel_video_reply.less');

export default class ChannelVideoReply extends PureComponent {
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    const { channel_id, video_id } = props.params;
    this.channel_id = channel_id;
    this.video_id = video_id;

    this.state = {
      can_record: false,
      channel: null,
      is_muted: storage.getSync('mc.muted',false),
      is_paused: false,
      is_previewing: false,
      is_ready: false,
      in_progress: false,
      preview_elapsed_time: 0,
      progress_percent: 0,
      running_time: 0,
      show_controls: true,
      video: null,
      video_url: null,
      volume: storage.getSync('mc.volume',1.0),
    };

    DataCortex.event({
      kingdom: 'page_view',
      phylum: 'channel_video_reply',
      species: video_id,
    });

    this.busy = false;
    this._adapterReady = this._adapterReady.bind(this);
    this._clearBusy = this._clearBusy.bind(this);
    this._onChannelUpdate = this._onChannelUpdate.bind(this);
    this._onUploadProgress = this._onUploadProgress.bind(this);
    this._onVolumeChange = this._onVolumeChange.bind(this);
    this._pauseToggle = this._pauseToggle.bind(this);
    this._previewVideoTimeUpdate = this._previewVideoTimeUpdate.bind(this);
    this._previewVideoEnded = this._previewVideoEnded.bind(this);
    this._recordReady = this._recordReady.bind(this);
    this._resetRecording = this._resetRecording.bind(this);
    this._setBusy = this._setBusy.bind(this);
    this._showPreview = this._showPreview.bind(this);
    this._startRecord = this._startRecord.bind(this);
    this._stopRecord = this._stopRecord.bind(this);
    this._submitReply = this._submitReply.bind(this);
    this._toggleVideoControls = this._toggleVideoControls.bind(this);
    this._updateRunningTime = this._updateRunningTime.bind(this);
  }
  componentDidMount() {
    ChannelStore.addChangeListener(this._onChannelUpdate);
    AdapterLoaderStore.addChangeListener(this._adapterReady);

    ChannelStore.fetch();
    AdapterLoaderStore.includeAdapterJS();
    this._onChannelUpdate();
  }
  componentWillUnmount() {
    ChannelStore.removeChangeListener(this._onChannelUpdate);
    AdapterLoaderStore.removeChangeListener(this._adapterReady);
    clearTimeout(this.running_timer);
  }

  _adapterReady(tag) {
    const is_ready = AdapterLoaderStore.isAdapterReady();
    this.setState({ is_ready });
  }
  _clearBusy() {
    this.busy = false;
    this.setState({ in_progress: false });
  }
  _onChannelUpdate(tag) {
    const { channel_id, video_id } = this;
    const channel = ChannelStore.getChannel(channel_id);

    if (channel) {
      const video = _.find(channel.video_list,(v) => video_id == v.channel_video_id);
      this.setState({ channel, video });
    }
  }
  _onUploadProgress(progress_percent) {
    this.setState({ progress_percent });
  }
  _onVolumeChange({ volume, muted }) {
    this.setState({ volume, is_muted: muted });
    storage.set('mc.volume',volume);
    storage.set('mc.muted',muted);
  }
  _pauseToggle(e) {
    const is_paused = !this.state.is_paused;
    this.setState({ is_paused });

    if(!is_paused && this.state.show_controls) {
      this.setState({ show_controls: false });
    }
  }
  _previewVideoEnded(e) {
    this.setState({
      show_controls: true,
      is_paused: true,
    });
  }
  _previewVideoTimeUpdate(time_info) {
    const last_elapsed = this.state.preview_elapsed_time;

    if(last_elapsed < time_info.currentTime) {
      this.setState({
        preview_elapsed_time: Math.ceil(time_info.currentTime)
      });
    }
  }
  _recordReady(e) {
    const can_record = true;
    this.setState({ can_record });

    if(this.waiting_for_stream) {
      this.waiting_for_stream = false;
      this._startRecord();
    }
  }
  _resetRecording() {
    VideoRecorderStore.resetRecording();

    this.setState({
      is_previewing: false,
      is_recording: false,
      preview_elapsed_time: 0,
      running_time: 0,
      show_controls: true,
      video_url: null,
    });

    clearTimeout(this.running_timer);
  }
  _setBusy() {
    const ret = !this.busy;
    if (!this.busy) {
      this.busy = true;
      this.setState({ in_progress: true });
    }
    return ret;
  }
  _showPreview() {
    this.setState({
      can_record: false,
      is_previewing: true,
      is_recording: false,
      show_controls: false,
    });
  }
  _startRecord() {
    if(VideoRecorderStore.startRecording()) {
      this.last_updated = Date.now();
      this.running_timer = setTimeout(this._updateRunningTime, 250);

      this.setState({
        is_paused: false,
        is_previewing: false,
        preview_elapsed_time: 0,
        is_recording: true,
        show_controls: false,
        video_url: null,
      });
    } else {
      this.setState({
        can_record: false,
        is_paused: false,
        is_previewing: false,
        preview_elapsed_time: 0,
        is_recording: false,
        show_controls: false,
        video_url: null,
      });
      this.waiting_for_stream = true;
    }
  }
  _stopRecord() {
    VideoRecorderStore.stopRecording();

    this.setState({
      is_recording: false,
      show_controls: true,
      video_url: VideoRecorderStore.getCurrentAsVideoURL()
    });

    clearTimeout(this.running_timer);
  }
  _submitReply() {
    const { channel_video_id } = this.state.video;
    const video_file = VideoRecorderStore.getCurrentAsBlob();
    if (video_file && video_file.size && this._setBusy()) {
      const opts = {
        channel_video_id,
        duration: this.state.running_time / 1000,
        track_progress: this._onUploadProgress,
        video_file,
      };
      ChannelStore.createVideoReply(opts,(err,channel_video_reply_id) => {
        this._clearBusy();
        if (err) {
          alert("Save failed, please try again.");
        } else {
          alert('Video reply uploaded successfully.');
          VideoRecorderStore.resetRecording();
          const url = "/channel/" + this.channel_id + "/video/" + channel_video_id;
          this.context.router.replace(url);
        }
      });
    } else if(!video || !video_file.size) {
      alert('Could not record successfully, please try again.');
    }
  }
  _toggleVideoControls() {
    const show_controls = !this.state.show_controls;
    this.setState({show_controls});
  }
  _updateRunningTime() {
    const current_running_time = this.state.running_time;
    const running_time = current_running_time + (Date.now() - this.last_updated);

    this.setState({ running_time });

    this.last_updated = Date.now();
    this.running_timer = setTimeout(this._updateRunningTime, 250);
  }

  render() {
    const {
      can_record,
      channel,
      is_muted,
      is_paused,
      in_progress,
      is_previewing,
      is_ready,
      is_recording,
      preview_elapsed_time,
      progress_percent,
      running_time,
      show_controls,
      video,
      video_url,
      volume,
    } = this.state;

    let loader = <LoadingOverlay />;
    let content = loader;

    if(in_progress) {
      content = (
        <LoadingOverlay
          loadingText="Uploading video..."
          progressPercent={ progress_percent }
        />
      );
    } else if(is_ready && channel && video) {
      const running_total_seconds = Math.ceil(running_time / 1000);
      const running_seconds = running_total_seconds % 60;
      const running_time_s = (running_seconds < 10 ? "0" : "") + running_seconds;
      const running_time_m = Math.floor(running_total_seconds / 60);

      let video_controls;
      let volume_slider;

      if(show_controls) {
        video_controls = <ChannelVideoReplyControls
                          haveRecorded={ !!video_url }
                          onCloseClick={ this._toggleVideoControls }
                          previewClick={ this._showPreview }
                          resetClick={ this._resetRecording }
                          startClick={ this._startRecord }
                          submitClick={ this._submitReply }
                          />;
      }

      let main_video = <LocalVideoFeed
                        onLoaded={ this._recordReady }
                        />;

      let start_stop_button;
      let elapsed_time;
      const total_time = running_time_m + ":" + running_time_s;
      if(is_previewing) {
        loader = null;

        const preview_seconds = preview_elapsed_time % 60;
        const preview_elapsed_s = (preview_seconds < 10 ? "0" : "") + preview_seconds;
        const preview_elapsed_m = Math.floor(running_total_seconds / 60);

        start_stop_button = <PlayPauseButton
                              paused={ is_paused }
                              onClick={ this._pauseToggle }
                              />;
        elapsed_time = preview_elapsed_m + ":" + preview_elapsed_s + " / ";

        main_video = <HTML5VideoPlayer
                        muted={ is_muted }
                        paused={ is_paused }
                        src={ video_url }
                        volume={ volume }
                        onEnded={ this._previewVideoEnded }
                        onTimeUpdate={ this._previewVideoTimeUpdate }
                      />;
        volume_slider = <VolumeSlider
                          muted={ is_muted }
                          volume={ volume }
                          onChange={ this._onVolumeChange }
                        />;
      }
      else if(can_record) {
        loader = null;

        const ss_btn_class = "record-button" + (is_recording ? ' recording' : '');
        const ss_btn_click = is_recording ? this._stopRecord: this._startRecord;

        start_stop_button = (<div className={ ss_btn_class } onClick={ ss_btn_click }><div /></div>);
      }

      content = (
        <div className="channel-video-reply-container">
          <div className="channel-overlay">
            <div className="top-bar">
              <div className="channel-video">
                <div className="channel-name">{ channel.channel_name }</div>
                <div className="video-title">Video Reply</div>
              </div>
            </div>
            <div className="reply-video-stream">
              { main_video }
            </div>
            <div className="bottom-bar">
              <div className="button-bar">
                <div className="left">
                  <div className="reply-video-controls">
                    { start_stop_button }
                  </div>
                  { volume_slider }
                  <div className="video-time">
                    { elapsed_time }{ total_time }
                  </div>
                </div>
                <div className="right">
                  <Button
                    text="Submit"
                    disabled={ !video_url }
                    onClick={ this._submitReply }
                    />
                  <Button
                    text="Preview"
                    disabled={ !video_url || is_recording || is_previewing }
                    onClick={ this._showPreview }
                    />
                  <Button
                    text="Restart"
                    disabled={ !video_url }
                    onClick={ this._resetRecording }
                    />
                </div>
              </div>
            </div>
            { video_controls }
          </div>
          { loader }
        </div>
      );
    }

    return content;
  }
}
