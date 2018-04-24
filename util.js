'use strict';

const _ = require('lodash');
const util = require('util');
const fs = require('fs');

exports.errorLog = errorLog;
exports.readView = readView;

function errorLog() {
  const s = util.format.apply(this,arguments);
  console.error("[" + new Date().toUTCString() + "] " + s);
  return s;
}

function readView(filename) {
  return fs.readFileSync(__dirname + '/views/' + filename,{ encoding: 'utf8' });
}
