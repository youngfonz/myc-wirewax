'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';

import ContentFrame from './components/content_frame.js';
import Footer from './components/footer.js';
import LoadingOverlay from './components/loading_overlay.js';

import ChannelStore from './stores/channel_store.js';

require('../css/channel_add_content.less');

export default class ChannelAddContent extends React.Component {
  constructor(props,context) {
    super(props,context);

    const { channel_id } = props.params;
    this.state = {
      channel_id,
      channel: false,
    };

    DataCortex.event({
      kingdom: 'page_view',
      phylum: 'channel_add_content',
      species: channel_id,
    });

    this._onChannelUpdate = this._onChannelUpdate.bind(this);
    this._onVideoClick = this._onVideoClick.bind(this);
    this._onConferenceClick = this._onConferenceClick.bind(this);
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
  _onVideoClick() {
    const { channel_id } = this.state;
    const url = "/channel/" + channel_id + "/new_video";
    this.context.router.push(url);
  }
  _onConferenceClick() {
    const { channel_id } = this.state;
    const url = "/channel/" + channel_id + "/new_conference";
    this.context.router.push(url);
  }

  render() {
    const {
      user,
      channel,
    } = this.state;

    let content = null;
    if (channel) {
      let conference = null;
      if (channel.is_private) {
        conference = (
          <div className='option conference' onClick={this._onConferenceClick}>
            <div className='icon conference'/>
            <div className='text'>Start Conference</div>
            <div className='button'>
              <div className='button-text'>Get Started</div>
            </div>
          </div>
        );
      }
      conference = null;

      content = (
        <ContentFrame
          className='channel-add-container'
          title={"#" + channel.channel_name}
        >
          <div className='static-sized-css-fix'>
            <div className='title'>
              <div className='title-text'>Select from one of the options below</div>
            </div>
            <div className='option-list'>
              <div className='option add-content' onClick={this._onVideoClick}>
                <div className='icon add-content'/>
                <div className='text'>Add Content</div>
                <div className='button'>
                  <div className='button-text'>Upload Files</div>
                </div>
              </div>
              {conference}
            </div>
            <div className='spacer'/>
          </div>
        </ContentFrame>
      );
    } else {
      content = <LoadingOverlay />;
    }
    return content;
  }
}
