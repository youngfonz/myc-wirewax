'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';
import _ from 'lodash';

import util from './util.js';

import ContentFrame from './components/content_frame.js';
import Footer from './components/footer.js';
import LoadingOverlay from './components/loading_overlay.js';
import Loading from './components/loading.js';
import Input from './components/input.js';
import Button from './components/button.js';

import ChannelStore from './stores/channel_store.js';
import ChannelVideoStore from './stores/channel_video_store.js';

require('../css/admin_slide_script.less');

export default class AdminSlideScript extends React.Component {
  constructor(props,context) {
    super(props,context);

    const { channel_id, video_id } = props.params;
    this.state = {
      video: false,
      in_progress: false,
      slide_script: false,
      new_time: "",
      new_page: "",
    };
    this.channel_id = channel_id;
    this.video_id = video_id;
    this.busy = false;
    this.channel_video_store = false;

    this._onVideoUpdate = this._onVideoUpdate.bind(this);

    this._onSaveClick = this._onSaveClick.bind(this);
    this._onNewAdd = this._onNewAdd.bind(this);

    DataCortex.event({ kingdom: 'page_view', phylum: 'admin_slide_script' });
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
    if (video_id != this.video_id) {
      this.channel_id = channel_id;
      this.video_id = video_id;
      this.setState({ video: false, slide_script: false });

      this._removeListener();
      this._addListener()();
    }
  }
  componentDidMount() {
    this._addListener();
  }
  componentWillUnmount() {
    this._removeListener();
  }
  _addListener() {
    if (!this.channel_video_store) {
      const { video_id } = this;
      this.channel_video_store = ChannelVideoStore.getStore(video_id);
      this.channel_video_store.addChangeListener(this._onVideoUpdate);
      this.channel_video_store.fetch();
      this._onVideoUpdate();
    }
  }
  _removeListener() {
    if (this.channel_video_store) {
      this.channel_video_store.removeChangeListener(this._onVideoUpdate);
      this.channel_video_store = false;
    }
  }
  _onVideoUpdate() {
    const video = this.channel_video_store.getVideo();
    if (video) {
      this.setState({ video });
      if (this.state.slide_script === false) {
        const slide_script = video.slide_script || [];
        this.setState({ slide_script });
      }
    }
  }

  _setBusy() {
    const ret = !this.busy;
    if (!this.busy) {
      this.busy = true;
      this.setState({ in_progress: true });
    }
    return ret;
  }
  _clearBusy() {
    this.busy = false;
    this.setState({ in_progress: false });
  }
  _onSaveClick() {
    const { channel_id, video_id } = this;
    const { slide_script } = this.state;

    if (this._setBusy()) {
      const opts = {
        channel_id,
        video_id,
        slide_script,
      };
      ChannelStore.saveVideo(opts,(err) => {
        this._clearBusy();
        if (err) {
          alert("Save failed, please try again.");
        } else {
          alert('Video updated successfully.');
        }
      });
    }
  }
  _onNewAdd() {
    const { new_time, new_page, slide_script } = this.state;
    const page_number = parse_page(new_page);
    const time = util.parseTime(new_time);
    if (isNaN(page_number)) {
      window.alert("Invalid page number.");
    } else if (isNaN(time)) {
      window.alert("Invalid time, please use MM:SS format.");
    } else {
      slide_script.push({ time, page_number });
      slide_script.sort((a,b) => {
        return a.time - b.time;
      });
      this.setState({ new_time: "", new_page: "", slide_script });
    }
  }
  _onTimeChange(i,time) {
    const { slide_script } = this.state;
    const s = slide_script[i];
    if (s) {
      s.modified_time = time;
      this.forceUpdate();
    }
  }
  _onPageChange(i,page_number) {
    const { slide_script } = this.state;
    const s = slide_script[i];
    if (s) {
      s.modified_page_number = page_number;
      this.forceUpdate();
    }
  }
  _onDelete(i) {
    const { slide_script } = this.state;
    slide_script.splice(i,1);
    this.forceUpdate();
  }
  _onUpdate(i) {
    const { slide_script } = this.state;
    const s = slide_script[i];
    const page_number = parse_page(s.modified_page_number || s.page_number);
    const time = util.parseTime(s.modified_time || s.time);
    if (isNaN(page_number)) {
      window.alert("Invalid page number.");
    } else if (isNaN(time)) {
      window.alert("Invalid time, please use MM:SS format.");
    } else {
      s.page_number = page_number;
      s.time = time;
      delete s.modified_time;
      delete s.modified_page_number;
      slide_script.sort((a,b) => {
        return a.time - b.time;
      });
      this.setState({ slide_script });
    }
  }

  render() {
    const {
      in_progress,
      user,
      video,
      slide_script,
    } = this.state;

    let content = null;
    if (video && slide_script !== false) {
      const disabled = in_progress;
      let loading;
      if(in_progress) {
        loading = (
          <LoadingOverlay
            loadingText="Saving script..."
            progressPercent={progress_percent}
          />
        );
      }
      let slide_list = _.map(slide_script,(s,i) => {
        let show_update = false;
        let { time, page_number } = s;
        time = util.formatTime(time);
        if ('modified_time' in s && s.modified_time != s.time) {
          time = s.modified_time;
          show_update = true;
        }
        if ('modified_page_number' in s && s.modified_page_number != s.page_number) {
          page_number = s.modified_page_number;
          show_update = true;
        }
        let action = null;
        if (show_update) {
          action = (
            <div className='action'>
              <Button
                text="update"
                className="text"
                disabled={in_progress}
                onClick={this._onUpdate.bind(this,i)}
              />
            </div>
          );
        } else {
          action = (
            <div className='action'>
              <Button
                text="delete"
                className="text"
                disabled={in_progress}
                onClick={this._onDelete.bind(this,i)}
              />
            </div>
          );
        }

        return (
          <div key={i} className='slide-row'>
            <div className='time'>
              <Input
                placeholder="Time"
                onTextChange={this._onTimeChange.bind(this,i)}
                value={time}
              />
            </div>
            <div className='page'>
              <Input
                placeholder="Page"
                onTextChange={this._onPageChange.bind(this,i)}
                value={page_number}
              />
            </div>
            {action}
          </div>
        );
      });
      content = (
        <ContentFrame
          className='admin-slide-script-container overlay-form-container'
          title={"#" + video.channel_name + " - " + video.title}
        >
          <div className='title'>Update Slide Script</div>
          <div className='slide-script-list'>
            <div className='slide-row header-row'>
              <div className='time'>Time</div>
              <div className='page'>Page</div>
              <div className='action'>Action</div>
            </div>
            <hr/>
            {slide_list}
            <hr/>
            <div className='slide-row new-item'>
              <div className='time'>
                <Input
                  placeholder="Time"
                  onTextChange={(new_time) => this.setState({ new_time })}
                  value={this.state.new_time}
                />
              </div>
              <div className='page'>
                <Input
                  placeholder="Page"
                  onTextChange={(new_page) => this.setState({ new_page })}
                  value={this.state.new_page}
                />
              </div>
              <div className='action'>
                <Button
                  text="Add"
                  className="text"
                  disabled={in_progress}
                  onClick={this._onNewAdd}
                />
              </div>
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

function parse_page(s) {
  return parseInt(s);
}
