'use strict';

import React from 'react';

import VideoCard from './video_card.js';

require('../../css/video_list.less');

export default class VideoList extends React.Component {
  constructor(props,context) {
    super(props,context);
    this.state = {
      selectedTag: null,
    };
  }
  static propTypes = {
    videos: React.PropTypes.array.isRequired,
    onVideoClick: React.PropTypes.func.isRequired,
  };
  static defaultProps = {
    showTags: false,
  };

  _onTagClick(selectedTag) {
    if (this.state.selectedTag == selectedTag) {
      selectedTag = null;
    }
    this.setState({ selectedTag })
  }

  render() {
    const { selectedTag } = this.state;
    const { videos, showTags } = this.props;

    const tag_list = _.reduce(videos,(memo,v) => _.union(memo,v.tag_list),[]);

    let tags = null;
    let card_list = videos;

    if (showTags && tag_list.length > 0) {
      if (selectedTag) {
        card_list = _.filter(videos,(v) => v.tag_list.indexOf(selectedTag) != -1);
      }
      tags = tag_list.map((t) => {
        let cls = 'tag'
        if (t == selectedTag) {
          cls += ' active';
        }
        return (
          <div
            key={"tag_" + t}
            className={cls}
            onClick={this._onTagClick.bind(this,t)}
          >
            {t}
          </div>
        );
      });

      tags = (
        <div className='tag-list'>
          {tags}
        </div>
      );
    }

    const cards = _.map(card_list,(cv) => {
      const { channel_video_id } = cv;
      return (
        <VideoCard
          key={"channel_video_" + channel_video_id}
          video={cv}
          onClick={this.props.onVideoClick}
        />
      );
    });

    return (
      <div className='video-list-container'>
        {tags}
        <div className='video-card-list'>
          {cards}
        </div>
      </div>
    );
  }
}
