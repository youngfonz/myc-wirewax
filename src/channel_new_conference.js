'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';

import ContentFrame from './components/content_frame.js';
import Footer from './components/footer.js';
import LoadingOverlay from './components/loading_overlay.js';
import Input from './components/input.js';
import Button from './components/button.js';

import ChannelStore from './stores/channel_store.js';

export default class ChannelNewConference extends React.Component {
  constructor(props,context) {
    super(props,context);

    this.in_progress = false;

    const { channel_id } = props.params;
    this.state = {
      channel_id,
      channel: false,
      conference_name: "",
      in_progress: false,
    };

    DataCortex.event({
      kingdom: 'page_view',
      phylum: 'new_conference',
      species: channel_id
    });

    this._onChannelUpdate = this._onChannelUpdate.bind(this);
    this._onNameChange = this._onNameChange.bind(this);
    this._onSaveClick = this._onSaveClick.bind(this);
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };
  componentWillReceiveProps(newProps) {
    const { channel_id } = newProps.params;
    this.setState({ channel_id });
    ChannelStore.fetch();
    this._onChannelUpdate();
  }
  componentDidMount() {
    const { channel_id } = this.props.params;
    ChannelStore.addChangeListener(this._onChannelUpdate);
    ChannelStore.fetch();
    this._onChannelUpdate();
  }
  componentWillUnmount() {
    ChannelStore.removeChangeListener(this._onChannelUpdate);
  }
  _onChannelUpdate(tag) {
    const { channel_id } = this.state;
    const channel = ChannelStore.getChannel(channel_id);
    this.setState({ channel });
  }
  _onNameChange(conference_name) {
    this.setState({ conference_name });
  }
  setBusy() {
    const ret = !this.in_progress;
    if (ret) {
      this.in_progress = true;
      this.setState({ in_progress: true });
    }
    return ret;
  }
  setDone() {
    this.in_progress = false;
    this.setState({ in_progress: false });
  }
  _onSaveClick() {
    const { channel_id, conference_name } = this.state;

    if (conference_name && this.setBusy()) {
      const args = {
        channel_id,
        conference_name,
      };
      ChannelStore.createConference(args,(err,conference_id) => {
        this.setDone();
        if (err) {
          alert("Failed to create conference, please try again.");
        } else {
          const url = "/channel/" + channel_id + "/conference/" + conference_id;
          this.context.router.replace(url);
          DataCortex.event({
            kingdom: 'conference',
            phylum: 'create_conference',
            species: conference_id,
          });
        }
      });
    }
  }

  render() {
    const {
      user,
      channel,
      conference_name,
      in_progress,
    } = this.state;

    let content = null;
    if (channel) {
      const disabled = !conference_name || in_progress;

      content = (
        <ContentFrame
          className='channel-new-conference-container overlay-form-container'
          title={"#" + channel.channel_name}
        >
          <div className='title'>Conference Details</div>
          <div className='input'>
            <div className='label'>Conference Name</div>
            <Input
              placeholder="Enter name"
              onTextChange={this._onNameChange}
              value={conference_name}
            />
          </div>
          <div className='save-button-container'>
            <Button
              text="Start Conference"
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
        </ContentFrame>
      );
    } else {
      content = <LoadingOverlay />;
    }
    return content;
  }
}
