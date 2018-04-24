'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';

import ContentFrame from './components/content_frame.js';
import ChannelEdit from './components/channel_edit.js';
import PureComponent from './components/pure_component.js';

export default class NewPrivateChannel extends PureComponent {
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  constructor(props,context) {
    super(props,context);
    this.state = {
      user: props.params.user,
    };

    DataCortex.event({ kingdom: 'page_view', phylum: 'new_private_channel' });

    this._onCancelClick = this._onCancelClick.bind(this);
    this._onSaveClick = this._onSaveClick.bind(this);
  }

  _onCancelClick() {
    this.context.router.goBack();
  }
  _onSaveClick(err, channel_id) {
    if (err) {
      alert("Failed to create private channel, please try again.");
    } else {
      const url = "/channel/" + channel_id;
      this.context.router.replace(url);
    }
  }

  render() {
    return (
      <ContentFrame
        className='new-private-channel-container overlay-form-container'
        title="Create a new Private Channel"
      >
        <ChannelEdit
          createPrivate={ true }
          onCancel={ this._onCancelClick }
          onSave={ this._onSaveClick }
          user={ this.state.user }
        />
      </ContentFrame>
    );
  }
}
