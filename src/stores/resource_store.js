'use strict';

import EventEmitter from 'events';
import _ from 'lodash';
import async from 'async';

import UserStore from './user_store.js';

import util from '../util.js';

const INTERVAL_MS = 5*60*1000;
const CHANGE_EVENT = "change";
const CHECK_TIMEOUT_MS = 5*1000;

let g_eventEmitter = new EventEmitter();
let g_timeout = false;

let g_cdn_prefix_url = false;
let g_alt_cdn_prefix_url = false;
let g_alt_cdn_success = false;

let g_live_prefix_url = false;
let g_alt_live_prefix_url = false;
let g_alt_live_success = false;

UserStore.addChangeListener(_onUserChange);
_onUserChange();

function addChangeListener(callback) {
  g_eventEmitter.on(CHANGE_EVENT,callback);
}
function removeChangeListener(callback) {
  g_eventEmitter.removeListener(CHANGE_EVENT,callback);
}
function _onUserChange() {
  const user = UserStore.getUser();
  if (user) {
    if (g_alt_cdn_prefix_url != user.alt_cdn_prefix_url) {
      g_alt_cdn_success = false;
    }
    if (g_alt_live_prefix_url != user.g_alt_live_prefix_url) {
      g_alt_live_success = false;
    }
    g_cdn_prefix_url = user.cdn_prefix_url;
    g_live_prefix_url = user.live_prefix_url;

    g_alt_cdn_prefix_url = user.alt_cdn_prefix_url;
    g_alt_live_prefix_url = user.alt_live_prefix_url;
  } else {
    g_cdn_prefix_url = false;
    g_alt_cdn_prefix_url = false;
    g_alt_cdn_success = false;

    g_live_prefix_url = false;
    g_alt_live_prefix_url = false;
    g_alt_live_success = false;
  }

  _stopChecks();
  if (g_alt_cdn_prefix_url || g_alt_live_prefix_url) {
    _runChecks();
  }
}
let g_in_progress = false;
function _runChecks() {
  if (!g_in_progress) {
    g_in_progress = true;

    async.series([
    (done) => {
      if (g_alt_cdn_prefix_url) {
        _checkAlt(g_alt_cdn_prefix_url,(err) => {
          g_alt_cdn_success = !err;
          done();
        });
      } else {
        done();
      }
    },
    (done) => {
      if (g_alt_live_prefix_url) {
        _checkAlt(g_alt_live_prefix_url,(err) => {
          g_alt_live_success = !err;
          done();
        });
      } else {
        done();
      }
    }],
    (err) => {
      _stopChecks();
      if (g_alt_cdn_prefix_url || g_alt_live_prefix_url) {
        g_timeout = setInterval(_runChecks,INTERVAL_MS);
      }
      g_in_progress = false;
    });
  }
}
function _stopChecks() {
  if (g_timeout) {
    clearTimeout(g_timeout);
    g_timeout = false;
  }
}

function _checkAlt(prefix_url,done) {
  function success() {
    done();
    done = function() {};
  }
  function error() {
    done('error');
    done = function() {};
  }

  $('#cdn-tester').empty();
  const img = document.createElement('img');
  img.addEventListener('load',success);
  img.addEventListener('error',error);
  img.src = urlCat(prefix_url,"/ping.png");
  $('#cdn-tester')[0].appendChild(img);
  setTimeout(error,CHECK_TIMEOUT_MS);
}

function urlCat(...args) {
  let url = "";
  args.forEach((part) => {
    if (url.length > 0 && url.charAt(url.length -1) != '/') {
      url += "/";
    }
    if (part.charAt(0) == '/') {
      url += part.slice(1);
    } else {
      url += part;
    }
  });
  return url;
}

function getVideoResource(video) {
  let media_hash = false;
  let hls_hash = false;
  let live_path = false;
  if (video.media_list && video.media_list.length > 0) {
    media_hash = video.media_list[0].file_hash;
  }
  if (video.hls_manifest_file_hash) {
    hls_hash = video.hls_manifest_file_hash;
  }
  if (video.video_stream_path) {
    live_path = video.video_stream_path;
  }

  let hls_secure_url = false;
  let hls_insecure_url = false;

  let mp4_secure_url = false;
  let mp4_insecure_url = false;

  if (live_path) {
    hls_secure_url = urlCat(g_live_prefix_url,live_path);

    if (g_alt_live_success) {
      const alt_url = urlCat(g_alt_live_prefix_url,live_path);
      if (alt_url.slice(0,5) == 'https') {
        hls_secure_url = alt_url;
      } else {
        hls_insecure_url = alt_url;
      }
    }
  } else {
    function urls(prefix) {
      let hls_url = false;
      let mp4_url = false;
      if (hls_hash) {
        hls_url = urlCat(prefix,hls_hash);
      }
      if (media_hash) {
        mp4_url = urlCat(prefix,media_hash);
      }
      return [
        hls_url,
        mp4_url,
      ];
    }

    [ hls_secure_url, mp4_secure_url ] = urls(g_cdn_prefix_url);

    if (hls_hash) {
      hls_secure_url = urlCat(g_cdn_prefix_url,hls_hash);
    }
    if (media_hash) {
      mp4_secure_url = urlCat(g_cdn_prefix_url,media_hash);
    }

    if (g_alt_cdn_success) {
      if (g_alt_cdn_prefix_url.slice(0,5) == 'https') {
        [ hls_secure_url, mp4_secure_url ] = urls(g_alt_cdn_prefix_url);
      } else {
        [ hls_insecure_url, mp4_insecure_url ] = urls(g_alt_cdn_prefix_url);
      }
    }
  }

  return  {
    has_hls: !!(hls_secure_url || hls_insecure_url),
    has_mp4: !!(mp4_secure_url || mp4_insecure_url),
    has_insecure: !!(hls_insecure_url || mp4_insecure_url),

    hls_secure_url,
    hls_insecure_url,

    mp4_secure_url,
    mp4_insecure_url,
  };
}

function getResourceURL(hash) {
  return urlCat(g_cdn_prefix_url,hash);
}

function getImageURL(media_list,size) {
  let { width, height } = size || {};
  const devicePixelRatio = window.devicePixelRatio || 1;
  const window_size = getSize(window);
  width = (width || window_size.width) * devicePixelRatio;
  height = (height || window_size.height) * devicePixelRatio;

  let file_hash = false
  _.every(media_list,(m) => {
    const big_enough = m.width > width && m.height > height;
    if (!file_hash || big_enough) {
      file_hash = m.file_hash;
    }
    return big_enough;
  });

  return getResourceURL(file_hash);
}

function getSize(obj) {
  let size;
  if (obj.width) {
    size = { width: obj.width, height: obj.height };
  } else if (obj.clientWidth) {
    size = { width: obj.clientWidth, height: obj.clientHeight };
  } else if (obj.innerWidth) {
    size = { width: obj.innerWidth, height: obj.innerHeight };
  }
  return size;
}

export default {
  addChangeListener,
  removeChangeListener,
  getVideoResource,
  getResourceURL,
  getImageURL,
};
