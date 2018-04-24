'use strict';

import React from 'react';

import PureComponent from './pure_component.js';
import DashboardCard from './dashboard_card.js';
import BarGraph from './bar_graph.js';
import TrendScore from './trend_score.js';
import DeviceUsageGraphic from './device_usage_graphic.js';
import DashboardTable from './dashboard_table.js';
import Loading from './loading.js';
import DataMap from './data_map.js';

import AnalyticsStore from '../stores/analytics_store.js';
import VideoRecorderStore from '../stores/video_recorder_store.js';

export default class DashboardOverview extends PureComponent {
  constructor(props,context) {
    super(props,context);
    this.state = {
      overviewData: null,
      replySupported: VideoRecorderStore.isSupported(),
    };

    this._onAnalyticsChange = this._onAnalyticsChange.bind(this);
  }
  static contextTypes = {
    router: React.PropTypes.object.isRequired,
  };

  componentDidMount() {
    AnalyticsStore.addChangeListener(this._onAnalyticsChange);
    this._onAnalyticsChange();
    AnalyticsStore.fetch();
  }
  componentWillUnmount() {
    AnalyticsStore.removeChangeListener(this._onAnalyticsChange);
  }
  _onAnalyticsChange(tag) {
    const overviewData = AnalyticsStore.getOverviewData();
    this.setState({ overviewData });
  }
  _onReplyClick(video) {
    const { channel_id, channel_video_id } = video;
    const url = "/channel/" + channel_id + "/video/" + channel_video_id + "/reply";
    this.context.router.push(url);
  }
  _onPulseClick(video) {
    const { channel_id, channel_video_id } = video;
    const url = "/channel/" + channel_id + "/video/" + channel_video_id;
    this.context.router.push(url);
  }
  _onPowerEmailClick(i) {
    const { promoted_list } = this.state.overviewData;
    const message = promoted_list[i];
    if (message) {
      if (message.is_broadcasted) {
        window.alert("Message has already been blasted.");
      } else {
        const confirm_blast = window.confirm("Are you sure you want to blast this message?");
        if(confirm_blast) {
          AnalyticsStore.broadcastMessage(message, (err) => {
            if(!err) {
              alert('Message broadcasted.');
            }
          });
        } else {
          window.alert('Message has not been broadcast.');
        }
      }
    }
  }

  render() {
    const {
      overviewData,
      replySupported,
    } = this.state;

    let content = null;
    if (overviewData) {
      const { org_stats } = overviewData;
      const {
        user_count,
        message_count,
        video_count,
        view_count,
        engage_score,
        people_score,
        pulse_score,
        power_score,
      } = org_stats;

      function score_icon_class(fraction) {
        let className;
        let label;
        if (fraction < 0.4) {
          className = 'sad';
          label = "Sad";
        } else if (fraction < 0.6) {
          className = 'neutral';
          label = "Neutral";
        } else {
          className = 'happy';
          label = "Happy";
        }

        return { className, label };
      }
      function percent(fraction) {
        return Math.round(fraction*100);
      }

      const {
        className: engage_icon_cls,
        label: engage_s,
      } = score_icon_class(engage_score);

      let reply_header;
      let blast_reply_header;
      if(replySupported) {
        reply_header = <div className='reply'>Reply</div>;
        blast_reply_header = <div className="video">Reply</div>;
      }

      let pulse_rows;
      if(overviewData.video_list && overviewData.video_list.length > 0) {
        pulse_rows = _.map(overviewData.video_list.slice(0,6),(row,i) => {
          const {
            view_count,
            like_count,
            sum_sentiment,
          } = row;
          const sentiment_score = sum_sentiment / like_count;
          const fraction = (sentiment_score + 1)/2;
          const { className, label } = score_icon_class(fraction);

          let reply_section;
          if(replySupported) {
            reply_section = (
              <div className='reply'>
                <div
                  className='icon'
                  onClick={this._onReplyClick.bind(this,row)}
                />
              </div>
            );
          }

          return (
            <div key={'pulse_' + i} className='box-row pulse-row'>
              <div className='rank'>{i + 1}</div>
              <div className='title'>{row.title}</div>
              <div className='graph'>
                <BarGraph
                  fraction={fraction}
                  number={sentiment_score.toFixed(2)}
                  />
              </div>
              <div className='mood-icon'>
                <div className={'icon ' + className} />
              </div>
              <div className='detail'>
                {view_count + " Views, " + like_count + " Reactions"}
              </div>
              { reply_section }
              <div className='view'>
                <div
                  className='icon'
                  onClick={this._onPulseClick.bind(this,row)}
                />
              </div>
            </div>
          );
        });
      } else {
        pulse_rows = (
          <div className='box-row pulse-row no-results'>
            <div className='no-result-message'>None available</div>
          </div>
        );
      }

      let power_rows;
      if(overviewData.promoted_list && overviewData.promoted_list.length > 0) {
        power_rows = _.map(overviewData.promoted_list.slice(0,6),(row,i) => {
          const {
            message_text,
            sentiment_score,
          } = row;
          const faux_video = {
            channel_id: row.channel_id,
            channel_video_id: row.channel_video_id,
          };
          const fraction = (sentiment_score + 1)/2;

          let blast_reply;
          if(replySupported) {
            blast_reply = (
              <div
                className='icon video'
                onClick={this._onReplyClick.bind(this, faux_video)}
              />
            );
          }

          return (
            <div key={'power_' + i} className='box-row power-row'>
              <div className='rank'>{i + 1}</div>
              <div className='title'>{row.message_text}</div>
              <div className='graph'>
                <BarGraph
                  fraction={fraction}
                  number={sentiment_score.toFixed(2)}
                />
              </div>
              <div className='blast'>
                { blast_reply }
                <div
                  className='icon mail'
                  onClick={this._onPowerEmailClick.bind(this,i)}
                />
              </div>
            </div>
          );
        });
      } else {
        power_rows = (
          <div className='box-row power-row no-results'>
            <div className='no-result-message'>None available</div>
          </div>
        );
      }

      content = (
        <div className="dashboard-overview-container">
          <div className='triple-boxes'>
            <div className='box face'>
              <div className='title'>User Sentiment</div>
              <div className='smile'>
                <div className={'icon ' + engage_icon_cls} />
                <div className='label'>{engage_s}</div>
              </div>
            </div>
            <div className='box score'>
              <div className='title'>MyChannel Sentiment Score</div>
              <div className={'big-number ' + engage_icon_cls}>{percent(engage_score)}</div>
            </div>
            <div className='box goal'>
              <div className='title'>Goal Completion</div>
              <div className='graphs'>
                <div className='graph-item'>
                  <div className='top'>
                    <div className='label'>Pulse</div>
                    <div className='score'>{percent(pulse_score) + "% Complete"}</div>
                  </div>
                  <BarGraph fraction={pulse_score} />
                </div>
                <div className='graph-item'>
                  <div className='top'>
                    <div className='label'>Power</div>
                    <div className='score'>{percent(power_score) + "% Complete"}</div>
                  </div>
                  <BarGraph fraction={power_score} />
                </div>
                <div className='graph-item'>
                  <div className='top'>
                    <div className='label'>People</div>
                    <div className='score'>{percent(people_score) + "% Complete"}</div>
                  </div>
                  <BarGraph fraction={people_score} />
                </div>
              </div>
            </div>
          </div>
          <div className='wide-box'>
            <div className='top'>
              <div className='title'>Pulse</div>
              <div className='sub-title'>See the sentiment trends that were discovered.</div>
            </div>
            <div className='box-row title-row pulse-row'>
              <div className='rank'>Rank</div>
              <div className='title'>Hot Trends</div>
              <div className='graph'>Sentiment</div>
              <div className='mood-icon'>Mood</div>
              <div className='detail'>Details</div>
              { reply_header }
              <div className='view'>View</div>
            </div>
            {pulse_rows}
          </div>
          <div className='wide-box'>
            <div className='top'>
              <div className='title'>Power</div>
              <div className='sub-title'>See the sentiment trends that were discovered.</div>
            </div>
            <div className='box-row title-row power-row'>
              <div className='rank'>Rank</div>
              <div className='title'>Hot Trends</div>
              <div className='graph'>Sentiment</div>
              <div className='blast'>
                { blast_reply_header }
                <div className="mail">Blast</div>
              </div>
            </div>
            {power_rows}
          </div>
          <div className='wide-box'>
            <div className='top'>
              <div className='title'>People</div>
              <div className='sub-title'>See the sentiment trends that were discovered.</div>
            </div>
            <div className='people-numbers'>
              <div className='item'>
                <div className='label'>Chats</div>
                <div className='value'>{message_count}</div>
              </div>
              <div className='item'>
                <div className='label'>Total Users</div>
                <div className='value'>{user_count}</div>
              </div>
              <div className='item'>
                <div className='label'>Views</div>
                <div className='value'>{view_count}</div>
              </div>
              <div className='item'>
                <div className='label'>Videos</div>
                <div className='value'>{video_count}</div>
              </div>
            </div>
            <DataMap />
            <div className='map-legend'>
              <div className='item'>
                <div className='icon green' />
                <div className='label'>Happy</div>
              </div>
              <div className='item'>
                <div className='icon yellow' />
                <div className='label'>Indifferent</div>
              </div>
              <div className='item'>
                <div className='icon red' />
                <div className='label'>Unhappy</div>
              </div>
              <div className='item'>
                <div className='icon blue' />
                <div className='label'>No Sentiment</div>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      content = <Loading />
    }
    return content;
  }
}
