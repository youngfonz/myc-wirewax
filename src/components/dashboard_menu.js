'use strict';

import React from 'react';

import PureComponent from './pure_component.js';

const ITEM_LIST = ["overview","performance","people","pulse","power"];

export default class DashboardMenu extends PureComponent {
  static propTypes = {
    selected: React.PropTypes.string,
    onMenuItemClick: React.PropTypes.func.isRequired,
  };
  static defaultProps = {
    selected: null,
  };

  _onItemClick(i,e) {
    e.stopPropagation();
    this.props.onMenuItemClick(i);
  }

  render() {
    const menu_items = _.map(ITEM_LIST,(i) => {
      let className = "menu-item " + i;
      if (i == this.props.selected) {
        className += " active";
      }
      return (
        <div
          key={i}
          className={className}
          onClick={this._onItemClick.bind(this,i)}
        >
        	<div className='text'>{i}</div>
        </div>
      );
    });
    return (
      <div className="dashboard-menu">
        {menu_items}
      </div>
    );
  }
}
