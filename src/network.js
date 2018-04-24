'use strict';

import _ from 'lodash';

function errorLog(...args) {
  console.log(...args);
}

export function request(args,done) {
  function request_done(...args) {
    done(...args);
    done = () => {};
  }

  const { method, track_progress } = args;

  let default_headers = {
    'Accept': 'application/json',
  };
  let body = null;
  if (args.body instanceof FormData) {
    body = args.body;
  } else if (args.body) {
    body = JSON.stringify(args.body);
    default_headers['Content-Type'] = 'application/json';
  }

  let url = args.url;
  if (args.query) {
    const query_s = _.map(args.query,(v,k) => {
      return encodeURIComponent(k) + "=" + encodeURIComponent(v);
    }).join("&");
    if (query_s.length > 0) {
      if (url.indexOf('?') > 0) {
        url += "&" + query_s;
      } else {
        url += "?" + query_s;
      }
    }
  }

  const headers = _.extend({},default_headers,args.headers);

  const xhr = new XMLHttpRequest();
  if (args.timeout) {
    xhr.timeout = args.timeout;
  }

  xhr.onload = (...args) => {
    let status = (xhr.status === 1223) ? 204 : xhr.status;
    let body = false;
    let json = false;
    let err = null;

    body = xhr.response || xhr.responseText;
    const content_type = xhr.getResponseHeader('Content-Type');
    const is_json = content_type && content_type.indexOf('json') != -1;

    if (body && body.length && is_json) {
      try {
        json = JSON.parse(body);
      } catch(e) {
        err = e;
      }
    }

    if (status < 100 || status > 599) {
      err = new TypeError('Network request failed');
    } else if (status > 399) {
      err = status;
    }
    request_done(err,json || body,json,body);
  };

  xhr.onerror = (...args) => {
    errorLog("xhr.onerror:",...args);
    request_done(new TypeError('Network request failed'));
  };
  xhr.ontimeout = (...args) => {
    request_done("timeout");
  }

  xhr.open(method,url,true);

  _.each(headers,(values,name) => {
    if (!Array.isArray(values)) {
      values = [values];
    }
    values.forEach((value) => {
      xhr.setRequestHeader(name, value);
    });
  });

  if(track_progress) {
    xhr.upload.onprogress = (e) => {
      if(e.lengthComputable) {
        track_progress(e.loaded / e.total * 100);
      }
    }
  }

  xhr.send(body);
}

export default { request };
