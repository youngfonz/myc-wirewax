'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';

import util from './util.js';

import ContentFrame from './components/content_frame.js';
import Footer from './components/footer.js';
import LoadingOverlay from './components/loading_overlay.js';
import Loading from './components/loading.js';
import Input from './components/input.js';
import Button from './components/button.js';
import RawVideo from './components/raw_video.js';

import ChannelVideoStore from './stores/channel_video_store.js';
import ChannelStore from './stores/channel_store.js';

export default class AdminVideoTrim extends React.Component {
  constructor(props,context) {
    super(props,context);

    const { channel_id, video_id } = props.params;
    this.state = {
      in_progress: false,
      progress_percent: 0,
      video: false,
      head_time: "",
      tail_time: "",
    };
    this.channel_id = channel_id;
    this.video_id = video_id;
    this.channel_video_store = false;
    this.in_progress = false;

    this._onVideoUpdate = this._onVideoUpdate.bind(this);
    this._onSaveClick = this._onSaveClick.bind(this);
    this._onUploadProgress = this._onUploadProgress.bind(this);

    DataCortex.event({ kingdom: 'page_view', phylum: 'admin_video_trim' });
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };
  static propTypes = {
    onSave: React.PropTypes.func
  };
  static defaultProps = {
    onSave: () => {}
  };

  componentWillReceiveProps(newProps) {
    const { channel_id, video_id } = newProps.params;
    const old_video_id = this.state.video_id;
    if (video_id != this.video_id) {
      this.channel_id = channel_id;
      this.video_id = video_id;
      this.setState({ video: false, head_time: "", tail_time: "" });
      this._removeListener();
      this._addListener();
    }
  }
  componentDidMount() {
    this._addListener();
  }
  componentWillUnmount() {
    this._removeListener();
  }
  _removeListener() {
    if (this.channel_video_store) {
      this.channel_video_store.removeChangeListener(this._onVideoUpdate);
      this.channel_video_store = false;
    }
  }
  _addListener() {
    if (!this.channel_video_store) {
      this.channel_video_store = ChannelVideoStore.getStore(this.video_id);
      this.channel_video_store.addChangeListener(this._onVideoUpdate);
      this.channel_video_store.fetch();
      this._onVideoUpdate();
    }
  }
  _onVideoUpdate() {
    const video = this.channel_video_store.getVideo();
    this.setState({ video })
  }

 _setBusy() {
    const ret = !this.in_progress;
    if (!this.in_progress) {
      this.in_progress = true;
      this.setState({ in_progress: true });
    }
    return ret;
  }
  _clearBusy() {
    this.in_progress = false;
    this.setState({ in_progress: false });
  }
  _onSaveClick() {
    const {
      channel_id,
      video_id,
    } = this;
    const {
      head_time,
      tail_time,
      in_progress,
    } = this.state;

    const head_seconds = head_time ? util.parseTime(head_time) : 0;
    const tail_seconds = tail_time ? util.parseTime(tail_time) : 0;

    if (!head_time && !tail_time) {
      window.alert("Must trim something.");
    } else if (isNaN(head_seconds)) {
      window.alert("Illegal beginning trim time");
    } else if (isNaN(tail_seconds)) {
      window.alert("Illegal end trim time");
    } else if (this._setBusy()) {
      const opts = {
        channel_id,
        video_id,
        head_seconds,
        tail_seconds,
        track_progress: this._onUploadProgress,
      };
      ChannelStore.trimVideo(opts,(err) => {
        this._clearBusy();
        if (err) {
          alert("Save failed, please try again.");
        } else {
          const url = "/admin/channel/" + channel_id + "/video/" + video_id;
          this.channel_video_store.fetch();
          alert('Video updated successfully.');
        }
      });
    }
  }
  _onUploadProgress(progress_percent) {
    this.setState({ progress_percent });
  }

  render() {
    const {
      in_progress,
      progress_percent,
      user,
      video,
      head_time,
      tail_time,
    } = this.state;

    let content = null;
    if (video) {
      const disabled = in_progress;

      let loading = null;
      if(in_progress) {
        loading = (
          <LoadingOverlay
            loadingText="Saving video..."
            progressPercent={progress_percent}
          />
        );
      }

      const view_url = "/channel/" + video.channel_id + "/video/" + video.channel_video_id;

      content = (
        <ContentFrame
          className='admin-channel-container overlay-form-container'
          title={"#" + video.channel_name + " - " + video.title}
          url={view_url}
        >
          <div className='title'>Trim Video</div>
          <div className='video-preview'>
            <RawVideo video={video} controls={true} autoload={true} />
          </div>
          <div className='input-list'>
            <div className='input'>
              <div className='label'>Trim Begining</div>
              <Input
                placeholder="Trim seconds"
                onTextChange={(head_time) => this.setState({ head_time })}
                value={head_time}
              />
            </div>
            <div className='input'>
              <div className='label'>Trim End</div>
              <Input
                placeholder="Trim seconds"
                onTextChange={(tail_time) => this.setState({ tail_time })}
                value={tail_time}
              />
            </div>
          </div>
          <div className='save-button-container'>
            <Button
              text="Save"
              disabled={disabled}
              onClick={this._onSaveClick}
            />
            <Button
              text="Cancel"
              className="ghost"
              disabled={in_progress}
              onClick={this.context.router.goBack}
            />
          </div>
          {loading}
        </ContentFrame>
      );
    } else {
      content = <LoadingOverlay />;
    }
    return content;
  }
}
