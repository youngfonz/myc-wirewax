'use strict';

import React from 'react';
import DataCortex from 'browser-data-cortex';

import ContentFrame from './components/content_frame.js';
import LoadingOverlay from './components/loading_overlay.js';
import VideoList from './components/video_list.js';
import ListCard from './components/list_card.js';
import HomeHero from './components/home_hero.js';

import ChannelStore from './stores/channel_store.js';

require('../css/channel.less');

export default class Channel extends React.Component {
  constructor(props,context) {
    super(props,context);

    const { user, channel_id } = props.params;
    this.state = {
      user,
      channel_id,
      channel: false,
    };
    this.channel_id = channel_id;

    DataCortex.event({
      kingdom: 'page_view',
      phylum: 'channel',
      species: channel_id,
    });

    this._onVideoClick = this._onVideoClick.bind(this);
    this._onChannelUpdate = this._onChannelUpdate.bind(this);
    this._onAddClick = this._onAddClick.bind(this);
    this._onConferenceClick = this._onConferenceClick.bind(this);
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };
  componentWillReceiveProps(newProps) {
    const { channel_id } = newProps.params;
    if (channel_id != this.channel_id) {
      this.channel_id = channel_id;
      ChannelStore.fetch();
      this._onChannelUpdate();

      DataCortex.event({
        kingdom: 'page_view',
        phylum: 'channel',
        species: channel_id,
      });
    }
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
    const { channel_id } = this;
    const channel_list = ChannelStore.getChannels();
    const channel = _.find(channel_list,(c) => c.channel_id == channel_id);
    this.setState({ channel });
  }
  _onVideoClick(video) {
    const { channel_id } = this;
    const { channel_video_id } = video;
    const url = "/channel/" + channel_id + "/video/" + channel_video_id;
    this.context.router.push(url);
  }
  _onAddClick() {
    const { channel_id } = this;
    const url = "/channel/" + channel_id + "/add";
    this.context.router.push(url);
  }
  _onConferenceClick(conference) {
    const { channel_id } = this;
    const { conference_id } = conference;
    const url = "/channel/" + channel_id + "/conference/" + conference_id;
    this.context.router.push(url);
  }

  render() {
    const {
      user,
      channel,
    } = this.state;

    let content = null;
    if (channel) {
      let add = null;
      let hero = null;
      let conferences = null;
      let videos = null;
      let empty = null;

      if (user && user.is_admin) {
        add = this._onAddClick;
      }

      const conf_list = channel.conference_list.slice();
      const video_list = channel.video_list.slice();
      const hero_list = conf_list.splice(0,2);

      if (hero_list.length < 2) {
        Array.prototype.push.apply(hero_list,video_list.slice(0,2 - hero_list.length));
      }

      if (conf_list.length > 0) {
        const list = _.map(conf_list,(c) => {
          return (
            <div className='video-card' onClick={this._onConferenceClick.bind(this,c)}>
              <div className='detail'>
                <div className='video-name'>{c.conference_name}</div>
              </div>
            </div>
          );
        });
        conferences = (
          <div className='section'>
            <div className='header'>
              <div className='title'>Live Conferences</div>
              <div className='subtitle'></div>
            </div>
            <div className='video-list'>
              {list}
            </div>
          </div>
        );
      }

      if (video_list.length > 0) {
        videos = (
          <div className='section'>
            <div className='header'>
              <div className='title'>Channel Videos</div>
              <div className='subtitle'></div>
            </div>
            <VideoList
              videos={video_list}
              onVideoClick={this._onVideoClick}
              showTags={true}
            />
          </div>
        );
      }

      if (hero_list.length > 0) {
        hero = <HomeHero items={hero_list} />;
      }

      if (!hero && !videos && !conferences) {
        empty = (
          <div className='section'>
            <div className='header'>
              <div className='title'>No content here yet, check back later to see if someone has added anything.</div>
            </div>
          </div>
        );
      }

      content = (
        <ContentFrame
          className='channel-container'
          title={"#" + channel.channel_name}
          onAddClick={add}
        >
          {hero}
          {conferences}
          {videos}
          {empty}
        </ContentFrame>
      );
    } else {
      content = <LoadingOverlay />;
    }
    return content;
  }
}
