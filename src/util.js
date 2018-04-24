'use strict';

import _ from 'lodash';
import Hls from 'hls.js';
import EventEmitter from 'events';

const EMAIL_REGEX = new RegExp('[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?','i');

export function errorLog(...args) {
  console.error(...args);
}

export function pad(num) {
  let ret = num.toString();
  if (num < 10) {
    ret = "0" + num;
  }
  return ret;
}

function formatTime(secs) {
  const mins = Math.floor(secs/60);
  secs -= mins * 60;
  secs = Math.floor(secs);
  return pad(mins) + ":" + pad(secs);
}

export function getSize(obj) {
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

export function getDevice() {
  let os = "unknown";
  let version = 0.0;

  const { userAgent } = window.navigator;
  const match = userAgent.match(/(iPhone OS|iPad.*?OS|iPod.*?OS) ([\d_\.]*)/);
  if( match && match.length > 2) {
    os = 'ios';
    version = parseFloat(match[2].replace('_','.').replace(/_/g,''));
  }
  return { os, version };
}

window.IS_IOS = false;
window.IS_IPHONE = false;
window.IS_IPAD = false;
(function() {
  const { userAgent } = window.navigator;
  const { os, version } = getDevice();
  if (os == 'ios') {
    window.IS_IOS = true;
    $('body').addClass('ios');
    if (/iPad.*?OS/.test(userAgent)) {
      window.IS_IPAD = true;
      $('body').addClass('ipad');
    } else {
      window.IS_IPHONE = true;
      $('body').addClass('iphone');
    }
  }
})();

export function deepEqual(x,y) {
  if (x !== y) {
    if (typeof x == 'object' && typeof y == 'object') {
      if (x === null || y === null) {
        return false;
      }
      for (let p in x) {
        if (x.hasOwnProperty(p)) {
          if (!y.hasOwnProperty(p)) {
            return false;
          } else if (!deepEqual(x[p],y[p])) {
            return false;
          }
        }
      }

      for (let p in y) {
        if (y.hasOwnProperty(p) && !x.hasOwnProperty(p)) {
          return false;
        }
      }
    } else {
      return false;
    }
  }
  return true;
}

function deepExtend(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch(e) {
    return null;
  }
}

function getImage(filename) {
  return "/static/img/" + filename;
}

let has_flash = false;
try {
  has_flash = Boolean(new ActiveXObject('ShockwaveFlash.ShockwaveFlash'));
} catch(e) {
  if (navigator.mimeTypes
      && typeof navigator.mimeTypes['application/x-shockwave-flash'] != 'undefined') {
    has_flash = true;
  }
}
function hasFlash() {
  return has_flash;
}

let hls_support_type = false;

if (window.localStorage['hls_support_override']) {
  hls_support_type = window.localStorage['hls_support_override'];
} else if (document.createElement('video').canPlayType('application/x-mpegURL')) {
  hls_support_type = "native";
} else if (Hls.isSupported()) {
  hls_support_type = "hls.js";
} else if (hasFlash()) {
  hls_support_type = "flash";
} else {
  hls_support_type = false;
}

if (hls_support_type == 'flash' || (hls_support_type == 'hls.js' && hasFlash())) {
  _loadMediaElement();
}

function _loadMediaElement() {
  const script = document.createElement("script");
  script.src = "/static/js/mediaelement-2-20-1/mediaelement.min.js";
  document.body.appendChild(script);
}

function hlsSupportType() {
  return hls_support_type;
}

function afterRender(callback,timeout = 0) {
  window.setTimeout(() => {
    window.requestAnimationFrame(callback);
  },timeout);
}

const g_resizeEmitter = new EventEmitter();
function addResizeListener(callback) {
  g_resizeEmitter.on('RESIZE',callback);
}
function removeResizeListener(callback) {
  g_resizeEmitter.removeListener('RESIZE',callback);
}
function fireResize(reason) {
  g_resizeEmitter.emit('RESIZE',reason);
}
function fireResizeLater(reason,timeout = 0) {
  afterRender(fireResize.bind(null,reason),timeout);
}
window.addEventListener('resize',fireResize.bind(null,'window'));

function stopPropagation(e) {
  e && e.stopPropagation && e.stopPropagation();
}
function preventDefault(e) {
  e && e.preventDefault && e.preventDefault();
}
function stopAll(e) {
  stopPropagation(e);
  preventDefault(e);
}

function scrollTo(x,y) {
  if (window.pageXOffset != x || window.pageYOffset != y) {
    window.scrollTo(x,y);
  }
}

function stringHash(s) {
  let hash = 99;
  const len = s && s.length || 0;
  for (let i = 0 ; i < len ; i++) {
    const chr = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
}

function isValidEmail(email) {
  return EMAIL_REGEX.test(email);
}

function parseTime(s) {
  let ret = NaN;
  const parts = s.toString().split(":");
  ret = parseInt(parts[parts.length - 1]);
  if (parts.length > 1) {
    const mins = parseInt(parts[parts.length - 2]);
    ret += mins * 60;
  }

  return ret;
}

export default {
  errorLog,
  getDevice,
  deepEqual,
  deepExtend,
  getImage,
  getSize,
  hasFlash,
  hlsSupportType,
  afterRender,
  addResizeListener,
  removeResizeListener,
  fireResize,
  fireResizeLater,
  stopPropagation,
  preventDefault,
  stopAll,
  pad,
  formatTime,
  scrollTo,
  stringHash,
  isValidEmail,
  parseTime,
};
