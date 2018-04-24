'use strict';

import React from 'react';

import Button from './button.js';
import util from '../util.js';
import PureComponent from './pure_component.js';

require('../../css/modal.less');
require('../../css/channel_video_reply.less');

export default class ChannelVideoReplyControls extends PureComponent {
  static propTypes = {
    haveRecorded: React.PropTypes.bool,
    onCloseClick: React.PropTypes.func.isRequired,
    previewClick: React.PropTypes.func,
    resetClick: React.PropTypes.func,
    startClick: React.PropTypes.func,
    submitClick: React.PropTypes.func,
  }
  static defaultProps = {
    haveRecorded: false,
  }

  render() {
    const {
      haveRecorded,
      onCloseClick,
      previewClick,
      resetClick,
      startClick,
      submitClick
    } = this.props;

    let button_set;
    let title = 'Record Your Reply';

    if(haveRecorded) {
      title = 'Submit Your Reply';
      button_set = (
        <div className="button-list">
          <Button
            text="Continue"
            onClick={ startClick }
            />
          <Button
            text="Submit"
            onClick={ submitClick }
            />
          <Button
            text="Preview"
            onClick={ previewClick }
            />
          <Button
            text="Reset"
            onClick={ resetClick }
            />
        </div>
      );
    } else {
      button_set = (
        <div className="button-list">
          <Button
            text="Start"
            onClick={ startClick }
            />
        </div>
      );
    }

    return (
      <div className='channel-video-reply-controls-container modal-container' onClick={util.stopAll}>
        <div className="close-button-container">
          <div className='close-button white' onClick={onCloseClick}>
            <div />
          </div>
        </div>
        <div className="cta_buttons">
          <div className="title">{ title }</div>
          { button_set }
        </div>
      </div>
    );
  }
}
