'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';

import util from './util.js';

import ContentFrame from './components/content_frame.js';
import Footer from './components/footer.js';
import LoadingOverlay from './components/loading_overlay.js';
import Loading from './components/loading.js';
import Input from './components/input.js';
import InputCheckbox from './components/input_checkbox.js';
import InputImage from './components/input_image.js';
import InputSlides from './components/input_slides.js';
import InputVideo from './components/input_video.js';
import FileInput from './components/file_input.js';
import Button from './components/button.js';

import ChannelVideoStore from './stores/channel_video_store.js';
import ChannelStore from './stores/channel_store.js';

export default class AdminChannelVideo extends React.Component {
  constructor(props,context) {
    super(props,context);

    const { channel_id, video_id } = props.params;
    this.state = {
      video: false,
      title: "",
      tags: "",
      stream_name: "",
      start_datetime: "",
      end_datetime: "",
      in_progress: false,
      progress_percent: 0,
      is_moderated: false,
    };
    this.channel_id = channel_id;
    this.video_id = video_id;

    this.in_progress = false;
    this.release_list = [];

    this._onVideoUpdate = this._onVideoUpdate.bind(this);
    this._onSaveClick = this._onSaveClick.bind(this);
    this._onUploadProgress = this._onUploadProgress.bind(this);

    DataCortex.event({ kingdom: 'page_view', phylum: 'admin_channel_video' });
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
      this.setState({ video: false });
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
    if (!this.channel_video_store && this.video_id) {
      this.channel_video_store = ChannelVideoStore.getStore(this.video_id);
      this.channel_video_store.addChangeListener(this._onVideoUpdate);
      this.channel_video_store.fetch(() => this._onVideoUpdate());
    }
  }
  _onVideoUpdate() {
    let video = this.channel_video_store.getVideo();
    if (video && this.state.video === false) {
      video = _.extend({},video);
      video.tags = video.tag_list.join(", ");

      const new_state = {
        video,
        is_moderated: video.is_moderated,
      };
      const props = ['title','stream_name','tags'];
      _.each(props,(p) => {
        new_state[p] = video[p] || "";
      });

      const dates = ['start_datetime','end_datetime'];
      _.each(dates,(p) => {
        const v = video[p];
        if (!v) {
          new_state[p] = "";
        } else {
          new_state[p] = moment(v).format("L LT");
        }
      });

      this.setState(new_state);
    }
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
    try {
      const {
        title,
        tags,
      } = this.state;
      let { video } = this.state;
      const { channel_id, video_id } = this;
      const video_props = {};

      const files = ['image_file','video_file','slide_file','hold_image_file'];
      _.each(files,(f) => {
        const file = this.refs[f].getFile();
        const is_removed = this.refs[f].isRemoved();

        if (is_removed) {
          video_props["remove_" + f] = true;
        } else if (file) {
          video_props[f] = file;
        }
      });

      if (!video) {
        video = {
          tag_list: [],
        };
      }
      if (tags != video.tag_list.join(" ")) {
        video_props.tags = tags;
      }

      const props = ['title','stream_name','is_moderated'];
      _.each(props,(p) => {
        if (this.state[p] !== video[p]) {
          video_props[p] = this.state[p];
        }
      });

      const dates = ['start_datetime','end_datetime'];
      _.each(dates,(p) => {
        const s = this.state[p];
        let v;
        if (!s) {
          v = null;
        } else {
          const m = moment(new Date(s));
          if (!m.isValid()) {
            throw "Invalid date";
          } else {
            v = m.toISOString();
          }
        }
        if (v !== video[p]) {
          video_props[p] = v;
        }
      });


      if (!title) {
        throw "Video title can not be empty.";
      }
      if (Object.keys(video_props).length == 0) {
        throw "Nothing changed.";
      }

      if (this._setBusy()) {
        const opts = _.extend({},video_props,{
          channel_id: channel_id,
          track_progress: this._onUploadProgress,
        });
        if (video_id) {
          opts.video_id = video_id;
        }
        ChannelStore.saveVideo(opts,(err,new_video_id) => {
          this._clearBusy();
          if (err) {
            alert("Save failed, please try again.");
          } else if (!video_id) {
            const url = "/channel/" + channel_id + "/video/" + new_video_id;
            this.context.router.replace(url);
          } else {
            const url = "/admin/channel/" + channel_id;
            this.context.router.replace(url);
            alert('Video updated successfully.');
          }
        });
      }
    } catch(s) {
      window.alert(s);
    }
  }
  _onUploadProgress(progress_percent) {
    this.setState({ progress_percent });
  }

  render() {
    const {
      user,
      video,
      title,
      tags,
      stream_name,
      start_datetime,
      end_datetime,
      is_moderated,
      in_progress,
      progress_percent,
    } = this.state;

    let content = null;
    if (!this.video_id || video) {
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

      let page_title = 'Add a Video to this Channel';
      let video_file_field_title = 'Video File';
      if (video) {
        page_title = 'Update Video';
        video_file_field_title += ' - Optional';
      }

      let edit_slide_script = null;
      if (video && video.slide_list && video.slide_list.length > 0) {
        const url = '/admin/channel/' + video.channel_id
          + '/video/' + video.channel_video_id + '/slide_script';
        edit_slide_script = (
          <div className='input'>
            <a href={url}>Edit Slide Script</a>
          </div>
        );
      }
      let trim_video = null;
      if (video && video.hls_manifest_url) {
        const url = '/admin/channel/' + video.channel_id
          + '/video/' + video.channel_video_id + '/video_trim';

        trim_video = (
          <div className='input'>
            <a href={url}>Trim Video</a>
          </div>
        );
      }

      let frame_title = "#" + video.channel_name;
      let view_url = "";
      if (video) {
        frame_title += " - " + video.title;
        view_url = "/channel/" + video.channel_id
          + "/video/" + video.channel_video_id;
      }

      content = (
        <ContentFrame
          className='channel-new-video-container overlay-form-container'
          title={frame_title}
          url={view_url}
        >
          <div className='title'>{page_title}</div>
          <div className='input-list'>
            <div className='input'>
              <div className='label'>Video Title</div>
              <Input
                placeholder="Video Title"
                onTextChange={(title) => this.setState({ title })}
                value={title}
              />
            </div>
            <div className='input'>
              <div className='label'>Tags</div>
              <Input
                placeholder="Tags"
                onTextChange={(tags) => this.setState({ tags })}
                value={tags}
              />
            </div>
            <div className='input'>
              <div className='label'>Video Image</div>
              <InputImage
                ref='image_file'
                image={video.channel_video_image_url}
              />
            </div>
            <div className='input'>
              <div className='label'>Video</div>
              <InputVideo
                ref='video_file'
                video={video}
              />
            </div>
            {trim_video}
            <div className='input'>
              <div className='label'>Slides</div>
              <InputSlides
                ref='slide_file'
                video={video}
              />
            </div>
            {edit_slide_script}
            <div className='input'>
              <div className='label'>Video Hold Card Image</div>
              <InputImage
                ref='hold_image_file'
                image={video.hold_image_url}
                showRemove={true}
              />
            </div>
            <div className='input'>
              <div className='label'>Live Stream Name</div>
              <Input
                placeholder="Live stream name"
                onTextChange={(stream_name) => this.setState({ stream_name })}
                value={stream_name}
              />
            </div>
            <div className='input'>
              <div className='label'>Event Start</div>
              <Input
                placeholder="Date & Time"
                onTextChange={(start_datetime) => this.setState({ start_datetime })}
                value={start_datetime}
              />
            </div>
            <div className='input'>
              <div className='label'>Event End</div>
              <Input
                placeholder="Date & Time"
                onTextChange={(end_datetime) => this.setState({ end_datetime })}
                value={end_datetime}
              />
            </div>
            <div className='input'>
              <div className='label'>Moderated Chat</div>
              <InputCheckbox
                label="Enable Moderation"
                onChange={(is_moderated) => this.setState({ is_moderated })}
                value={is_moderated}
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
