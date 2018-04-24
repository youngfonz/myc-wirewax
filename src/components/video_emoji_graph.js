'use strict';

import React from 'react';

import util from '../util.js';

import ChatStore from '../stores/chat_store.js';
import LikeStore from '../stores/like_store.js';

export default class VideoEmojiGraph extends React.Component {
  constructor(props,context) {
    super(props,context);
    this.channel_video_id = props.video.channel_video_id;
    this.chart = false;
    this.value_list = false;
    this.like_store = null;

    this._onLikeUpdate = this._onLikeUpdate.bind(this);
    this._onResize = this._onResize.bind(this);
  }
  static propTypes = {
    video: React.PropTypes.object.isRequired,
  };

  componentDidMount() {
    this._addListener();
    util.addResizeListener(this._onResize);
  }
  componentWillUnmount() {
    this._removeListener();
    util.removeResizeListener(this._onResize);
    $('body > div.nvtooltip.xy-tooltip').remove();
  }
  _addListener() {
    if (!this.like_store) {
      this.like_store = LikeStore.getStore(this.channel_video_id);
      this.like_store.addChangeListener(this._onLikeUpdate);
      this.like_store.fetch();
      this._onLikeUpdate();
    }
  }
  _removeListener() {
    if (this.like_store) {
      this.like_store.removeChangeListener(this._onLikeUpdate);
      this.like_store = null;
    }
  }
  _onLikeUpdate() {
    const value_list = this.like_store.getLikeGraph();
    if (value_list && value_list.length > 0) {
      this.value_list = value_list;
      this._updateChart();
    }
  }
  _onResize() {
    if (this.chart) {
      this.chart.update();
    }
  }

  _updateChart() {
    this._updateChartData();
    if (this.chart) {
      this.chart.update();
    } else {
      nv.addGraph(this.createChart.bind(this));
    }
  }

  _updateChartData() {
    if (!this.chartData) {
      const chartData = [
        {
          key: 'Pos',
          color: '#0f0',
          area: true,
        },
        {
          key: 'Neg',
          color: '#f00',
          area: true,
        }
      ];
      this.chartData = chartData;
    }
    const value_list = this.value_list.slice();

    const pos_values = [];
    const neg_values = [];

    let last_val = 0;
    let last_time = 0;
    _.each(value_list,(v) => {
      const time = v.time;
      const val = v.normalized;
      const prev_time = last_time + (time - last_time)/2;

      if (val >= 0) {
        if (last_val < 0) {
          pos_values.push({
            x: prev_time,
            y: 0,
          });
          neg_values.push({
            x: prev_time,
            y: 0,
          });
        }
        pos_values.push({
          x: time,
          y: val,
        });
        neg_values.push({
          x: time,
          y: undefined,
        });
      } else {
        if (last_val >= 0) {
          pos_values.push({
            x: prev_time,
            y: 0,
          });
          neg_values.push({
            x: prev_time,
            y: 0,
          });
        }
        pos_values.push({
          x: time,
          y: undefined,
        });
        neg_values.push({
          x: time,
          y: val,
        });
      }
      last_val = val;
      last_time = time;
    });

    this.chartData[0].values = pos_values;
    this.chartData[1].values = neg_values;
  }

  createChart() {
    const chart = nv.models.lineChart()
      .margin({ left: 0, right: 0, top: 0, bottom: 30 })
      .useInteractiveGuideline(true)
      .showLegend(false)
      .showYAxis(true)
      .showXAxis(true);

    chart.forceY([-1,1]);

    chart.interactiveLayer.tooltip.contentGenerator((d) => {
      const val = d.series[0].value || d.series[1].value || 0;
      const time = d.series[0].data.x;
      const time_s = util.formatTime(time);

      let cls;
      let header;

      if (val > 0) {
        cls = "positive";
        header = "<div class='header'>Current Sentiment: Positive</div>";
      } else if (val == 0) {
        cls = "neutral";
        header = "<div class='header'>Current Sentiment: Neutral</div>";
      } else {
        cls = "negative";
        header = "<div class='header'>Current Sentiment: Negative</div>";
      }
      const html =
"<div class='video-emoji-graph-tooltip " + cls + "'>"
+ header
+ "<div class='time'>" + time_s + "</div>"
+ "<div class='sentiment'>Sentiment: "
+ val.toFixed(2)
+ " <span class='icon'></span>"
+ "</div>";
+ "</div>";
      return html;
    });

    chart.xAxis.tickFormat(util.formatTime);

    d3.select(this.refs.svg)
        .datum(this.chartData)
        .call(chart);

    this.chart = chart;
    window.chart = chart;
    return chart;
  }

  render() {
    const { video } = this.props;

    const content = (
      <div className='video-emoji-graph-container' ref='container'>
        <svg ref='svg'>
        </svg>
      </div>
    );
    return content;
  }
}

function smooth(list) {
  list.forEach((v,i) => {
    if (v.y != undefined && v.y != 0) {
      const prev = list[i - 1];
      const next = list[i + 1];

      if (prev && prev.y == undefined) {
        prev.y = 0;
      }
      if (next && next.y == undefined) {
        next.y = 0;
      }
    }
  });
}
