'use strict';

export function getConfig(done) {
  done(null,window.appConfig);
}

export default { getConfig };
