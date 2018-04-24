'use strict';

import _ from 'lodash';
import React from 'react';
import { Link } from 'react-router';
import DataCortex from 'browser-data-cortex';

import LoadingOverlay from './components/loading_overlay.js';
import ChannelList from './components/channel_list.js';
import VideoList from './components/video_list.js';
import ContentFrame from './components/content_frame.js';
import ListCard from './components/list_card.js';
import ConferenceCard from './components/conference_card.js';
import HomeHero from './components/home_hero.js';

import ContentStore from './stores/content_store.js';
import VideoStore from './stores/video_store.js';
import ChannelStore from './stores/channel_store.js';
import UserStore from './stores/user_store.js';
import ConferenceStore from './stores/conference_store.js';

require('../css/user_home.less');

export default class UserHome extends React.Component {
  constructor(props,context) {
    super(props,context);
    this.state = {
      user: this.props.params.user,
      channel_list: [],
      conference_list: [],
      recent_list: [],
      featured_video: false,
    };
    DataCortex.event({ kingdom: 'page_view', phylum: 'user_home' });

    this._onChannelUpdate = this._onChannelUpdate.bind(this);
    this._onVideoUpdate = this._onVideoUpdate.bind(this);
    this._onConferenceUpdate = this._onConferenceUpdate.bind(this);
    this._onAddClick = this._onAddClick.bind(this);
    this._onChannelClick = this._onChannelClick.bind(this);
    this._onVideoClick = this._onVideoClick.bind(this);
    this._onConferenceClick = this._onConferenceClick.bind(this);
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };
  componentWillReceiveProps(nextProps) {
    if (nextProps.params && nextProps.params.user) {
      this.setState({ user: nextProps.params.user });
    }
  }
  componentDidMount() {
    ChannelStore.addChangeListener(this._onChannelUpdate);
    ChannelStore.fetch();
    this._onChannelUpdate();

    VideoStore.addChangeListener(this._onVideoUpdate);
    VideoStore.fetchRecent();
    this._onVideoUpdate();

    ConferenceStore.addChangeListener(this._onConferenceUpdate);
    //ConferenceStore.fetchRecent();
    //this._onConferenceUpdate();
  }
  componentWillUnmount() {
    ChannelStore.removeChangeListener(this._onChannelUpdate);
    VideoStore.removeChangeListener(this._onVideoUpdate);
    ConferenceStore.removeChangeListener(this._onConferenceUpdate);
  }
  _onChannelUpdate(tag) {
    const channel_list = ChannelStore.getChannels();
    this.setState({ channel_list });
  }
  _onVideoUpdate(tag) {
    const recent_list = VideoStore.getRecentVideos();
    const featured_video = VideoStore.getFeaturedVideo();
    this.setState({ recent_list, featured_video });
  }
  _onConferenceUpdate() {
    const conference_list = ConferenceStore.getRecent();
    this.setState({ conference_list });
  }

  _onAddClick() {
    const url = "/new_private_channel";
    this.context.router.push(url);
  }
  _onChannelClick(channel) {
    const url = "/channel/" + channel.channel_id;
    this.context.router.push(url);
  }
  _onVideoClick(video) {
    const { channel_video_id, channel_id } = video;
    const url = "/channel/" + channel_id + "/video/" + channel_video_id;
    this.context.router.push(url);
  }
  _onConferenceClick(conference) {
    const { conference_id, channel_id } = conference;
    const url = "/channel/" + channel_id + "/conference/" + conference_id;
    this.context.router.push(url);
  }

  render() {
    const {
      user,
      conference_list,
      recent_list,
      featured_video,
      channel_list,
    } = this.state;

    let add = null;
    if (user && user.is_admin) {
      add = this._onAddClick;
    }
    const title = ContentStore.getString('home_header_text');

    let conferences = null;
    if (conference_list && conference_list.length > 0) {
      const list = _.map(conference_list,(c) => {
        return (
          <ConferenceCard
            key={c.conference_id}
            conference={c}
            onClick={this._onConferenceClick}
          />
        );
      });
      conferences = (
        <div className='section'>
          <div className='header'>
            <div className='title'>Live Conferences</div>
            <div className='subtitle'>Join now!</div>
          </div>
          <div className='item-list conference-list'>
            {list}
          </div>
        </div>
      );
    }

    let hero = null;
    if (featured_video) {
      hero = (
        <HomeHero
          headlines={["Video of the Week"]}
          items={[featured_video]}
        />
      );
    }

    let recents = null;
    if (recent_list && recent_list.length > 0) {
      const recent_videos = recent_list.slice(0,4);
      if (recent_videos.length > 0) {
        recents = (
          <div className='section'>
            <div className='header'>
              <div className='title'>Recently Added</div>
              <div className='subtitle'>Newly uploaded videos</div>
            </div>
            <VideoList
              videos={recent_videos}
              onVideoClick={this._onVideoClick}
            />
          </div>
        );
      }
    }

    let channels = null;
    if (channel_list && channel_list.length > 0) {
      channels = (
        <ChannelList
          channelList={channel_list}
          onChannelClick={this._onChannelClick}
        />
      );
    }

    let content;
    if(!recents && !hero && !conferences && !channels) {
      content = <LoadingOverlay />;
    } else {
      content = (
        <ContentFrame
          className='home-container'
          title={title}
          user={user}
          onAddClick={add}
        >
          {hero}
          {conferences}
          {recents}
          <div className='section'>
            <div className='header'>
              <div className='title'>MyChannels</div>
              <div className='subtitle'>A simple beautiful way to showcase videos.</div>
            </div>
            {channels}
          </div>
        </ContentFrame>
      );
    }

    return content;
  }
}
