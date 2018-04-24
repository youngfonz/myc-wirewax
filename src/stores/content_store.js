'use strict';

import EventEmitter from 'events';
import _ from 'lodash';

import util from '../util.js';

const CHANGE_EVENT = "change";

const PUBLIC_CDN_URL = "https://media1.public-cdn.myc-prod.com/";

let requireImage = () => null;
let g_eventEmitter = new EventEmitter();
let g_isReady = false;
let g_contentKey = false;

if (window && window.appConfig) {
  g_isReady = true;
  g_contentKey = window.appConfig.contentKey;
} else {
  try {
    const AppModule = require('../app_module.js');
    //requireImage = require;
    AppModule.getVersions((err,data) => {
      g_isReady = true;
      g_contentKey = data.bundleId;
      g_eventEmitter.emit(CHANGE_EVENT,'startup');
    });
  } catch(e) {}
}

/****************************************************************/

const DEFAULT_CONTENT_MAP = {
  site_name: 'myc.tv',
  logo_text: 'MYCHANNEL',
  logo_message: 'everyone has something special to contribute',
  splash_icon_image: false,
  splash_video: 'splash_video',
  splash_web_video: '33d5178841772ef5af5f979d841ba49c',
  splash_video_overlay_color: 'rgba(0,51,102,0.6)',
  splash_video_bg_color: 'black',
  mc_logo: requireImage('image!mc-logo'),
  splash_corporate_link: "corporate",
  header_logo_text: 'MyChannel',
  home_header_text: 'MyChannel Network',

  login_text: "hello!",
  login_subtext: "my email is my passport",

  login_confirm_subtext: "your login code was sent to your email address.",

  signup_text_color: '#57496E',
  highlight_color: '#f74676',
  signup_message_color: '#57496E',
  signup_input_color: 'black',
  signup_placeholder_color: '#545475',
  signup_border_color: '#545475',
  signup_container_color: 'rgba(255,255,255,0.7)',

  dash_top_inactive_color: '#89a8d9',
  dash_top_active_color: '#f74676',

  channel_card_title_color: '#f74676',

  view_icon: requireImage('image!viewPurple'),
  like_icon: requireImage('image!likePurple'),
  unlike_icon: requireImage('image!likeRed'),
  comment_icon: requireImage('image!comment'),
  back_icon: requireImage('image!back2'),
  share_icon: requireImage('image!share'),
  camera_icon: requireImage('image!camera'),

  contribute_icon: requireImage('image!contribute'),

  video_channel_text_color: '#f74676',

  avatar_image_bg_colors: ['#d378ac','#75dad1'],
  chat_user_color: '#f42961',
  chat_text_color: '#525c65',
  chat_border_color: '#c2d7ef',

  profile_name_color: '#f74676',
  profile_link_color: '#f74676',

  video_channel_color: '#f42961',

  contact_selected_color: '#f74676',
  contact_border_color: '#c2d7ef',

  share_user_color: '#f74676',

  nav_header_link_color: '#f74676',
  nav_header_text_color: '#3c3d67',

  dash_private_link_color: '#f74676',
};

const MYC_CONTENT_MAP = {
  logo_text: 'MYCHANNEL',
};

const MYC_DEV_CONTENT_MAP = _.extend({},MYC_CONTENT_MAP,{
  logo_text: 'MYCHANNEL β',
});

const TEST_CONTENT_MAP = {
  logo_text: 'MYC TEST',
};
const TEST_DEV_CONTENT_MAP = _.extend({},TEST_CONTENT_MAP,{
  logo_text: 'MYC TEST β',
});

const OPTUM_CONTENT_MAP = {
  site_name: 'Optum.tv',
  logo_text: 'Optum.tv',
  logo_message: false,
  splash_icon_image: requireImage('image!oenLogo'),
  splash_video: 'oen_splash',
  splash_web_video: '1a2abd81f9baa970de64b4c788ea8bcb',
  splash_video_overlay_color: 'rgba(0,0,0,0.6)',
  splash_video_bg_color: '#3b3742',
  mc_logo: requireImage('image!oenLogo'),
  splash_corporate_link: "mychannel",
  header_logo_text: 'Optum',
  home_header_text: 'Optum.tv',

  itunes_url: "https://appstore.com/optumtv",
  google_play_url: "https://play.google.com/store/apps/details?id=com.mychannel.optum",

  login_text: "hello",
  login_subtext: "please enter your corporate email",

  login_confirm_subtext: "your code was sent to you from login@myc.tv",

  signup_text_color: '#ffb169',
  highlight_color: '#ff7155',
  signup_message_color: 'white',
  signup_input_color: '#ff934f',
  signup_placeholder_color: '#9d6549',
  signup_border_color: '#ff934f',
  signup_container_color: undefined,

  dash_top_inactive_color: '#ffb169',
  dash_top_active_color: '#ff7155',

  channel_card_title_color: '#ffb169',

  like_icon: requireImage('../img/oen/like.png'),
  unlike_icon: requireImage('../img/oen/likeFilled.png'),
  comment_icon: requireImage('../img/oen/comment.png'),
  back_icon: requireImage('../img/oen/back.png'),
  share_icon: requireImage('../img/oen/share.png'),
  camera_icon: requireImage('../img/oen/camera.png'),

  contribute_icon: requireImage('../img/oen/contribute.png'),

  video_channel_text_color: '#ffb169',

  avatar_image_bg_colors: ['#ff934f','#ff934f'],
  chat_user_color: '#ff934f',
  chat_text_color: '#2e3130',
  chat_border_color: '#ff934f',

  profile_name_color: '#ff7155',
  profile_link_color: '#ff7155',

  video_channel_color: '#ffb169',

  contact_selected_color: '#ff7155',
  contact_border_color: '#ff934f',

  share_user_color: '#ff7155',

  nav_header_link_color: '#ff7155',
  nav_header_text_color: '#ffb169',

  dash_private_link_color: '#ff7155',
};
const OPTUM_DEV_CONTENT_MAP = _.extend({},OPTUM_CONTENT_MAP,{
  logo_text: 'Optum.tv DEV',
});

const INTEL_CONTENT_MAP = {
  site_name: 'intel.myc.tv',
  logo_text: 'INTEL DEMO',
  logo_message: false,
  splash_video: 'intel_splash',
  splash_web_video: 'e2cf331411c8b4790a5fc3ee62156df9',
  splash_corporate_link: "mychannel",
  header_logo_text: 'Intel',

  login_subtext: "Your corporate email",
};
const INTEL_DEV_CONTENT_MAP = _.extend({},INTEL_CONTENT_MAP,{
  logo_text: 'INTEL DEMO β',
});

const AETNA_CONTENT_MAP = {
  site_name: 'aetna.myc.tv',
  logo_text: 'AETNA DEMO',
  logo_message: false,
  splash_video: 'aetna_splash',
  splash_web_video: '62751584775dad74594b5ea65c0a57a7',
  splash_corporate_link: "mychannel",
  header_logo_text: 'Aetna',

  login_subtext: "Your corporate email",
};
const AETNA_DEV_CONTENT_MAP = _.extend({},AETNA_CONTENT_MAP,{
  logo_text: 'AETNA DEMO β',
});

const FANDM_CONTENT_MAP = {
  site_name: 'fandm.myc.tv',
  logo_text: 'DEMO',
  logo_message: false,
  splash_video: 'fandm_splash',
  splash_web_video: 'fb33cb72f7b63c272f42d8729d05763c',
  splash_corporate_link: "mychannel",
  header_logo_text: 'Fandm',

  login_subtext: "Your corporate email",
};
const FANDM_DEV_CONTENT_MAP = _.extend({},FANDM_CONTENT_MAP,{
  logo_text: 'Franklin & Marshal DEMO β',
});

const KDC_CONTENT_MAP = {
  site_name: 'kdc.myc.tv',
  logo_text: 'DEMO',
  logo_message: false,
  splash_video: 'kdc_splash',
  splash_web_video: '93ae907888a0d39f6dbd0ec992dd71fe',
  splash_corporate_link: "mychannel",
  header_logo_text: 'KDC',

  login_subtext: "Your corporate email",
};
const KDC_DEV_CONTENT_MAP = _.extend({},KDC_CONTENT_MAP,{
  logo_text: 'DEMO β',
});

const BLACKROCK_CONTENT_MAP = {
  site_name: 'blackrock.myc.tv',
  logo_text: 'DEMO',
  logo_message: false,
  splash_video: 'blackrock_splash',
  splash_web_video: '60106910568a282fe9f9dddc0553ced1',
  splash_corporate_link: "mychannel",
  header_logo_text: 'Blackrock',

  login_subtext: "Your corporate email",
};
const BLACKROCK_DEV_CONTENT_MAP = _.extend({},BLACKROCK_CONTENT_MAP,{
  logo_text: 'DEMO β',
});

const MYC_DEMO_CONTENT_MAP = _.extend({},MYC_CONTENT_MAP,{
  logo_text: 'myc demo',
});

const BOK_DEMO_CONTENT_MAP = _.extend({},MYC_CONTENT_MAP,{
  splash_web_video: '108dd197bab5af3a517b921c3e081e72',
  logo_text: 'DEMO',
  header_logo_text: "",
});

const MOREHOUSE_DEMO_CONTENT_MAP = _.extend({},MYC_CONTENT_MAP,{
  splash_web_video: 'c1c7fb7cb756fb76aa1d24a3bc2bdcd3',
  logo_text: 'MOREHOUSE DEMO',
  header_logo_text: "Morehouse",
});

const GEORGIA_DEMO_CONTENT_MAP = _.extend({},MYC_CONTENT_MAP,{
  logo_text: 'STATE OF GEORGIA DEMO',
  splash_web_video: 'b8e85ace6ad74391e78018bc5c5160d2',
  header_logo_text: "Georgia",
});

const MOREHOUSE_CONTENT_MAP = _.extend({},MYC_CONTENT_MAP,{
  site_name: 'Morehouse.tv',
  splash_web_video: '1fbd87fb47f0e04d093b651fcbc164ce',
  logo_text: "Morehouse Engagement Network",
  header_logo_text: "Morehouse",
  home_header_text: 'Morehouse Engagement Network',
  donate_url: "https://giving.morehouse.edu/annual",
  brand_url: 'http://morehouse.edu',

  itunes_url: "https://itunes.apple.com/us/app/morehouse-tv/id1169528700?mt=8",
  google_play_url: "https://play.google.com/store/apps/details?id=com.mychannel.morehouse",
});
const JUDYSMITH_DEMO_CONTENT_MAP = _.extend({},MYC_CONTENT_MAP,{
  site_name: 'judysmith.myc.tv',
  splash_web_video: '35767e0e736180e4958af0bbbae73791',
  logo_text: 'judy smith DEMO',
});
const TRINITYHEALTH_DEMO_CONTENT_MAP = _.extend({},MYC_CONTENT_MAP,{
  site_name: 'trinityhealth.myc.tv',
  splash_web_video: 'a59ae0bdbe82af8ea213fa980d609b7a',
  logo_text: 'Trinity Health DEMO',
});
const WILLIS_TOWERS_DEMO_CONTENT_MAP = _.extend({},MYC_CONTENT_MAP,{
  site_name: 'willistowerswatson.myc.tv',
  splash_web_video: '10815b97faf2b62a5f1a4303274eb965',
  logo_text: 'Willis Towers Watson DEMO',
});

/****************************************************************/

const CONTENT_MAP = {
  'com.mychannel.dev.test': TEST_DEV_CONTENT_MAP,
  'test.myc-dev.tv': TEST_DEV_CONTENT_MAP,
  'test-local.myc-dev.tv': TEST_DEV_CONTENT_MAP,

  'com.mychannel.test': TEST_CONTENT_MAP,
  'test.myc.tv': TEST_CONTENT_MAP,

  'com.mychannel.dev.app': MYC_DEV_CONTENT_MAP,
  'www.myc-dev.tv': MYC_DEV_CONTENT_MAP,

  'com.mychannel.app': MYC_CONTENT_MAP,
  'www.myc.tv': MYC_CONTENT_MAP,

  'com.mychannel.dev.optum.demo': OPTUM_DEV_CONTENT_MAP,
  'optum-demo.myc-dev.tv': OPTUM_DEV_CONTENT_MAP,
  'optum-demo-local.myc-dev.tv': OPTUM_DEV_CONTENT_MAP,
  'com.mychannel.dev.optum': OPTUM_DEV_CONTENT_MAP,
  'optum.myc-dev.tv': OPTUM_DEV_CONTENT_MAP,

  'com.mychannel.optum.demo': OPTUM_CONTENT_MAP,
  'optum-demo.myc.tv': OPTUM_CONTENT_MAP,
  'com.mychannel.optum': OPTUM_CONTENT_MAP,
  'optum.myc.tv': OPTUM_CONTENT_MAP,

  'com.mychannel.dev.intel.demo': INTEL_DEV_CONTENT_MAP,
  'intel-demo.myc-dev.tv': INTEL_DEV_CONTENT_MAP,
  'com.mychannel.intel.demo': INTEL_CONTENT_MAP,
  'intel-demo.myc.tv': INTEL_CONTENT_MAP,

  'com.mychannel.dev.aetna.demo': AETNA_DEV_CONTENT_MAP,
  'aetna-demo.myc-dev.tv': AETNA_DEV_CONTENT_MAP,
  'com.mychannel.aetna.demo': AETNA_CONTENT_MAP,
  'aetna-demo.myc.tv': AETNA_CONTENT_MAP,

  'com.mychannel.dev.fandm.demo': FANDM_DEV_CONTENT_MAP,
  'fandm-demo.myc-dev.tv': FANDM_DEV_CONTENT_MAP,
  'com.mychannel.fandm.demo': FANDM_CONTENT_MAP,
  'fandm-demo.myc.tv': FANDM_CONTENT_MAP,

  'com.mychannel.dev.kennedy_center.demo': KDC_DEV_CONTENT_MAP,
  'kennedy-center-demo.myc-dev.tv': KDC_DEV_CONTENT_MAP,
  'com.mychannel.kennedy_center.demo': KDC_CONTENT_MAP,
  'kennedy-center-demo.myc.tv': KDC_CONTENT_MAP,

  'com.mychannel.dev.blackrock.demo': BLACKROCK_DEV_CONTENT_MAP,
  'blackrock-demo.myc-dev.tv': BLACKROCK_DEV_CONTENT_MAP,
  'com.mychannel.blackrock.demo': BLACKROCK_CONTENT_MAP,
  'blackrock-demo.myc.tv': BLACKROCK_CONTENT_MAP,

  'myc-demo.myc.tv': MYC_DEMO_CONTENT_MAP,

  'bok-demo.myc.tv': BOK_DEMO_CONTENT_MAP,

  'morehouse-demo.myc.tv': MOREHOUSE_DEMO_CONTENT_MAP,

  'georgia-demo.myc.tv': GEORGIA_DEMO_CONTENT_MAP,

  'morehouse.myc.tv': MOREHOUSE_CONTENT_MAP,

  'judysmith.myc.tv': JUDYSMITH_DEMO_CONTENT_MAP,

  'trinityhealth.myc.tv': TRINITYHEALTH_DEMO_CONTENT_MAP,

  'willistowerswatson.myc.tv': WILLIS_TOWERS_DEMO_CONTENT_MAP,
};

/****************************************************************/

function addChangeListener(callback) {
  g_eventEmitter.on(CHANGE_EVENT,callback);
}
function removeChangeListener(callback) {
  g_eventEmitter.removeListener(CHANGE_EVENT,callback);
}
function isReady() {
  return g_isReady;
}
function get(key,def) {
  let value = def;
  const bundle_content = CONTENT_MAP[g_contentKey];
  if (bundle_content && key in bundle_content) {
    value = bundle_content[key];
  } else if (key in DEFAULT_CONTENT_MAP) {
    value = DEFAULT_CONTENT_MAP[key];
  }
  return value;
}
function getString(key,def="") {
  return get(key,def);
}
function getVideoSource(key) {
  let value = get(key,false);
  if (value) {
    value = { uri: value };
  }
  return value;
}
function getImageSource(key) {
  return get(key);
}
function getResourceUrl(key) {
  return PUBLIC_CDN_URL + get(key);
}

export default {
  addChangeListener,
  removeChangeListener,
  isReady,
  get,
  getString,
  getVideoSource,
  getImageSource,
  getResourceUrl,
};
