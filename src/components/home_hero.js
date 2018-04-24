'use strict';

import React from 'react';

import util from '../util.js';

export default class HomeHero extends React.Component {
  constructor(props,context) {
    super(props,context);
    this.state = {
      single_hero: true,
    };
    this._onClick = this._onClick.bind(this);
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };
  static defaultProps = {
    headlines: [],
  };
  _onClick(item) {
    const { channel_id, channel_video_id, conference_id } = item;
    let url = "/channel/" + channel_id;

    if (conference_id) {
      url += "/conference/" + conference_id;
    } else {
      url += "/video/" + channel_video_id;
    }
    this.context.router.push(url);
  }

  render() {
    const {
      items,
      headlines,
      onVideoClick,
    } = this.props;

    let single_hero = true;
    if (items.length > 1) {
      single_hero = false;
    }

    const cards = _.map(items,(v,i) => {
      let headline = null;

      if (headlines[i]) {
        headline = <div className='headline'>{headlines[i]}</div>;
      } else if (v.conference_id) {
        headline = <div className='headline live'>LIVE</div>;
      } else {
        headline = <div className='headline'>Featured Video</div>
      }

      let title = v.title || v.conference_name;

      const style = {};
      if (v.channel_video_image_url) {
        style.backgroundImage = "url(" + v.channel_video_image_url + ")";
      }

      return (
        <div
          key={v.channel_video_id}
          className='hero-card'
          style={style}
          onClick={this._onClick.bind(this,v)}
        >
          <div className='inner'>
            {headline}
            <div className='item-title'>{title}</div>
          </div>
        </div>
      );
    });

    let cls = 'home-hero-container';
    if (single_hero) {
      cls += " single-hero";
    }

    const content = (
      <div className={cls}>
        {cards}
      </div>
    );
    return content;
  }
}
