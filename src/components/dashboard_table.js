'use strict';

import React from 'react';

import PureComponent from './pure_component.js';

export default class DashboardTable extends PureComponent {
  static defaultProps = {
    onClickList: [],
  };
  render() {
    const {
      header,
      rows,
      onClickList,
    } = this.props;

    const header_list = _.map(header,(h,i) => {
      let inner = h.label;
      if (!inner) {
        inner = <div className={'icon ' + h.class} />;
      }
      return (
        <div key={'header_' + i} className={h.class}>
          {inner}
        </div>
      );
    });
    const row_list = _.map(rows,(r,row_num) => {
      const row = _.map(r,(val,i) => {
        if (!val) {
          val = <div className='icon' />;
        } else if (val === true ) {
          val = <div className='icon true' />;
        } else {
          val = <div className='text'>{val}</div>;
        }
        const cls = header[i].class;
        let onClick = onClickList[i];
        if (onClick) {
          onClick = onClick.bind(null,row_num);
        }
        return (
          <div
            key={'row_val_' + i}
            className={ 'cell ' + cls}
            onClick={onClick}
          >
            {val}
          </div>
        );
      });
      return (
        <div key={'row_' + row_num} className='row'>
          {row}
        </div>
      );
    });

    return (
      <div className='dashboard-table'>
        <div className='header row'>
          {header_list}
        </div>
        {row_list}
      </div>
    );
  }
}
