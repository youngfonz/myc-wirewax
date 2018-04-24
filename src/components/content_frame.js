'use strict';

import React from 'react';

import Footer from './footer.js';
import PureComponent from './pure_component.js';
import Avatar from './avatar.js';

import UserStore from '../stores/user_store.js';

require('../../css/content_frame.less');
require('../../css/overlay_forms.less');

export default class ContentFrame extends PureComponent {
  constructor(props,context) {
    super(props,context);
    this.state = {
      user: UserStore.getUser(),
    };
    this._onUserUpdate = this._onUserUpdate.bind(this);
  }
  componentDidMount() {
    UserStore.addChangeListener(this._onUserUpdate);
    this._onUserUpdate();
  }
  componentWillUnmount() {
    UserStore.removeChangeListener(this._onUserUpdate);
  }
  _onUserUpdate() {
    this.setState({ user: UserStore.getUser() });
  }

  static propTypes = {
    title: React.PropTypes.string,
    className: React.PropTypes.string,
    url: React.PropTypes.string,
  };

  static defaultProps = {
    title: "Content Frame Title",
    url: "",
    className: "",
    onAddClick: null,
  };

  render() {
    const {
      title,
      className,
      onAddClick,
      url,
    } = this.props;
    const { user } = this.state;

    let cls = "content-frame-container";
    if (className) {
      cls += " " + className;
    }

    let avatar = null;
    if (user) {
      avatar = (
        <div className='user'>
          <div className='name'>{"@" + (user.user_name || user.email)}</div>
          <Avatar user={user}/>
        </div>
      );
    }

    let add = null;
    if (onAddClick) {
      add = (
        <div className='button-add no-ios' onClick={onAddClick}>
          <div className='inner'/>
        </div>
      );
    }
    let frame_title = "";
    if (url) {
      frame_title = <a href={url}>{title}</a>;
    } else {
      frame_title = title;
    }

    const content = (
      <div className={cls}>
        <div className='frame-body-container'>
          <div className='frame-content-container'>
            <div className='frame-content-inner-container'>
              {this.props.children}
            </div>
            <Footer />
          </div>
        </div>
        <div className='frame-header-container'>
          <div className='frame-header-title'>
            {frame_title}
          </div>
          {avatar}
          {add}
        </div>
      </div>
    );
    return content;
  }
}
