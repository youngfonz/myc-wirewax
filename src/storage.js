'use strict';

function errorLog(...args) {
  console.log(...args);
}

function get(key,done) {
  const val = getSync(key);
  done(null,val);
}

function getSync(key,def_val) {
  let ret = def_val;
  if (key in window.localStorage) {
    ret = window.localStorage[key];
    try {
      ret = JSON.parse(ret);
    } catch(e) {
      errorLog("Failed to JSON parse key:",key,"value:",ret);
    }
  }
  return ret;
}


function set(key,value,done = function() {}) {
  try {
    value = JSON.stringify(value);
  } catch(e) {
    errorLog("Failed to stringify key:",key,"value:",value);
    throw e;
  }
  if (window && window.localStorage) {
    window.localStorage[key] = value;
    done();
  }
}

export default { get, set, getSync };
