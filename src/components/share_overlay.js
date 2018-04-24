'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';
import _ from 'lodash';

import util from '../util.js';

import Button from './button.js';
import InviteList from './invite_list.js';
import PureComponent from './pure_component.js';
import LoadingOverlay from './loading_overlay.js';

import ChannelVideoStore from '../stores/channel_video_store.js';
import ConferenceStore from '../stores/conference_store.js';

require('../../css/modal.less');
require('../../css/share_overlay.less');

export default class ShareOverlay extends PureComponent {
  constructor(props,context) {
    super(props,context);

    this.state = {
      invite_list: [],
      is_submit_share: false,
    };

    const {
      video,
      conference,
    } = props;

    if (video) {
      DataCortex.event({
        kingdom: 'share',
        phylum: 'video',
        species: video.channel_video_id,
      });
    } else if (conference) {
      DataCortex.event({
        kingdom: 'share',
        phylum: 'conference',
        species: conference.conference_id,
      });
    }

    this._onShareClicked = this._onShareClicked.bind(this);
    this._onShareUserAdded = this._onShareUserAdded.bind(this);
    this._onShareUserRemoved = this._onShareUserRemoved.bind(this);
  }
  static propTypes = {
    onClose: React.PropTypes.func.isRequired,
    onComplete: React.PropTypes.func,
    channel: React.PropTypes.object,
    video: React.PropTypes.object,
    conference: React.PropTypes.object,
  };
  static defaultProps = {
    onComplete: function() { }
  };

  _onShareUserAdded(user, e) {
    let invite_list = this.state.invite_list.slice();
    invite_list.push(user);
    this.setState({ invite_list });
  }
  _onShareUserRemoved(email, e) {
    let invite_list = this.state.invite_list.slice();
    let removed = _.remove(invite_list, { email });
    this.setState({ invite_list });
  }
  _onShareClicked(e) {
    this.setState({ is_submit_share: true });
    if (this.props.video) {
      ChannelVideoStore.shareVideo(this.props.channel, this.props.video, this.state.invite_list, (err, results) => {
        if (err) {
          alert('There was an error submitting your share request. Please try again.');
        }
        this.setState({ is_submit_share: false });
        this.props.onComplete(err);
      });
    } else if (this.props.conference) {
      ConferenceStore.shareConference(this.props.channel, this.props.conference, this.state.invite_list, (err, results) => {
        if (err) {
          alert('There was an error submitting your share request. Please try again.');
        }
        this.setState({ is_submit_share: false });
        this.props.onComplete(err);
      });
    } else {
      this.setState({ is_submit_share: false });
      this.props.onComplete(true);
    }
  }

  render() {
    const { invite_list, is_submit_share } = this.state;
    const disable_button = invite_list.length < 1;
    const sharing_object = this.props.video ? 'video' : 'conference';

    let content;
    if (is_submit_share) {
      content = <LoadingOverlay />;
    } else {
      content = (
        <div className="modal-container share-overlay-container" onClick={util.stopAll}>
          <div className="modal-top-bar">
            <div className="modal-title-container">
              <div className="share-title">Share this { sharing_object } via email</div>
            </div>
            <div className="close-button-container">
              <div className='close-button black' onClick={this.props.onClose}>
                <div />
              </div>
            </div>
          </div>
          <div className="share-overlay-contents">
            <div className="share-form">
              <InviteList
                inviteList={ invite_list }
                onAdded={ this._onShareUserAdded }
                onRemoved={ this._onShareUserRemoved }
              />
              <div className='save-button-container'>
                <Button
                text="Share"
                disabled={ disable_button }
                onClick={ this._onShareClicked }
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    return content;
  }
}
