'use strict';

import _ from 'lodash';
import async from 'async';

import network from './network.js';
import { errorLog } from './util.js';
import storage from './storage.js';
import Platform from './platform.js';

const BASE_URL_DEV = "https://api.myc-dev.com";
const BASE_URL_PROD = "https://api.myc-prod.com";

let g_api_key = "";
let g_request_queue = [];
let g_custom_base_url = false;
let g_is_dev_api = false;
let g_is_ready = false;

async.parallel([
  (done) => {
    Platform.getConfig((err,config) => {
      g_api_key = config.mychannelAPIKey;
      g_is_dev_api = config.isDevApi;
      done();
    });
  },
  (done) => {
    storage.get('mychannel.custom_base_url',(err,value) => {
      if (value) {
        g_custom_base_url = value;
      }
      done();
    });
  }],
  (err) => {
    g_is_ready = true;

    const queue = g_request_queue;
    g_request_queue = [];

    async.eachSeries(queue,(cb,done) => {
      cb(done);
    },(err) => {});
  });

export function isReady() {
  return g_is_ready;
}

export function setCustomBaseUrl(url) {
  if( !url ) {
    g_custom_base_url = false;
  } else {
    url = url.replace(/\/*$/,'');
    g_custom_base_url = url;
  }
  storage.set('mychannel.custom_base_url',g_custom_base_url);
}
export function getCustomBaseUrl() {
  return g_custom_base_url;
}

export function getBaseUrl() {
  let base_url = false;
  if (g_custom_base_url) {
    base_url = g_custom_base_url;
  } else if (g_is_dev_api) {
    base_url = BASE_URL_DEV;
  } else {
    base_url = BASE_URL_PROD;
  }
  return base_url;
}

function getApiKey() {
  return g_api_key;
}

export function request(opts,done) {
  if (!isReady()) {
    g_request_queue.push((each_done) => {
      request(opts,(...args) => {
        done(...args);
        each_done();
      });
    });
  } else {
    opts.url = getBaseUrl() + opts.url;
    opts.headers = opts.headers || {};
    opts.headers['X-MC-API-Key'] = g_api_key;

    network.request(opts,done);
  }
}

export function get(opts,done) {
  opts.method = 'GET';
  request(opts,done);
}
export function post(opts,done) {
  opts.method = 'POST';
  request(opts,done);
}
export function del(opts,done) {
  opts.method = 'DELETE';
  request(opts,done);
}

export default {
  isReady,
  setCustomBaseUrl,
  getBaseUrl,
  getApiKey,
  request,
  get,
  post,
  del,
};
