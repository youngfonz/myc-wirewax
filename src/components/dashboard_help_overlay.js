'use strict';

import React from 'react';

import HelpOverlay from './help_overlay.js';
import PureComponent from './pure_component.js';

export default class DashboardHelpOverlay extends PureComponent {
  render() {
    return (
      <HelpOverlay overlayKey="dashboard">
        <div className='top-title'>
          Welcome to your MoodBoard!
        </div>
        <div className='top-sub-title'>
          Your MoodBoard is the place you can see exactly how your audience is
          feeling. This makes emotion measurement easy. Enjoy monitoring the
          pulse of your audience!
        </div>
        <div className="ftu-item">
          <div className="left">
            <div className='icon pulse' />
          </div>
          <div className="right">
            <div className="title">Pulse</div>
            <div className="text">
              The pulse section shows you the top trends at any moment. Have
              fun following the trends!
            </div>
          </div>
        </div>
        <div className="ftu-item">
          <div className="left">
            <div className='icon power' />
          </div>
          <div className="right">
            <div className="title">Power</div>
            <div className="text">
              The power section is the recommended actions you should do to
              increase the mood of your audience. Let your audience know you
              hear them!
            </div>
          </div>
        </div>
        <div className="ftu-item">
          <div className="left">
            <div className='icon people' />
          </div>
          <div className="right">
            <div className="title">People</div>
            <div className="text">
              The people section shows you the activity and the emotions based
              on location. Celebrate your growth and see where your audience’s
              emotions are dispersed!
            </div>
          </div>
        </div>
      </HelpOverlay>
    );
  }
}
