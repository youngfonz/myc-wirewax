'use strict';

import React from 'react';

import HelpOverlay from './help_overlay.js';
import PureComponent from './pure_component.js';

export default class ChannelVideoHelpOverlay extends PureComponent {
  render() {
    return (
      <HelpOverlay overlayKey="channel_video">
        <div className="top-title">
          Getting Started!
        </div>
        <div className="ftu-item">
          <div className="left">
            <div className='icon home' />
          </div>
          <div className="right">
            <div className="title">Home</div>
            <div className="text">
              Your home page  is your guide for all the content on your
              platform. Topics are broken up in to channels. Enjoy browsing!
            </div>
          </div>
        </div>
        <div className="ftu-item">
          <div className="left">
            <div className='icon chat' />
          </div>
          <div className="right">
            <div className="title">Chat</div>
            <div className="text">
              Your chat section is for you to join the conversation in realtime
              with your community. You can find the chat section in top right
              corner of the platform.
            </div>
          </div>
        </div>
        <div className="ftu-item">
          <div className="left">
            <div className='icon emoji' />
          </div>
          <div className="right">
            <div className="title">Emoji</div>
            <div className="text">
              You will notice the faces in the bottom right section of your
              platform. Let us know how you really feel!
            </div>
          </div>
        </div>
      </HelpOverlay>
    );
  }
}
