'use strict';

const express = require('express');
const _ = require('lodash');

const app = new express();
const router = new express.Router();

exports.router = router;
exports.updateAssetHash = updateAssetHash;

let g_asset_hash = null;

function updateAssetHash(hash) {
  g_asset_hash = hash;
}

const DEV_DEFAULT_CONFIG = {
  pusherAppKey: 'cb9d242671623434c2d5',
};
const PROD_DEFAULT_CONFIG = {
  pusherAppKey: '7a6ce8019c794c521c10',
};

const TEST_DEV_CONFIG = _.extend({},DEV_DEFAULT_CONFIG,{
  mychannelAPIKey: 'qKtWFlYFRSDHEPRqBPBBkG3fRNQhs9WF',
  contentKey: 'test.myc-dev.tv',
  orgStyle: 'org-test org-test-dev',
  isDevApi: true,
  dcAPIKey: 'YUUfkFmvzlNZD4-3O3O-ChCH-ICJ3JPP',
});
const TEST_CONFIG = _.extend({},PROD_DEFAULT_CONFIG,{
  mychannelAPIKey: 'G7IGIeAqU54D53aWYCBTJKQxsaWLb9jG',
  contentKey: 'test.myc.tv',
  orgStyle: 'org-test',
  isDevApi: false,
  dcAPIKey: 'JNecOu5rkv6VxxB3XIjynlhqaOqj9sWy',
});

const OPTUM_DEV_CONFIG = _.extend({},DEV_DEFAULT_CONFIG,{
  mychannelAPIKey: 'iaCqfOE3urb7HgtetThLLfinKSnhgV3L',
  contentKey: 'optum.myc-dev.tv',
  orgStyle: 'org-optum org-optum-dev',
  isDevApi: true,
  dcAPIKey: '0A5WeAKAk10nJbe76oMh4S9CSP1bmeWo',
  orgTitle: "Optum.tv",
  favIconPath: "/static/img/oen",
});
const OPTUM_CONFIG = _.extend({},PROD_DEFAULT_CONFIG,{
  mychannelAPIKey: 'FlAFGqgQdi8kmsUVrLFAFlvyUms8z2bh',
  contentKey: 'optum.myc.tv',
  orgStyle: 'org-optum',
  isDevApi: false,
  dcAPIKey: '7Ykg2LEJL1Yn6qazc9hlu2JA2mfWCUBt',
  orgTitle: "Optum.tv",
  favIconPath: "/static/img/oen",
});

const MYC_DEV_CONFIG = _.extend({},DEV_DEFAULT_CONFIG,{
  mychannelAPIKey: 'DXNmFuzaTPusWyCFCpjUT0Je2MkoVYmd',
  contentKey: 'www.myc-dev.tv',
  orgStyle: 'org-myc org-myc-dev',
  isDevApi: true,
  dcAPIKey: 'DMkgwtLH4bU5288JTk9WrdsKHs3IRAv_',
});

const MYC_CONFIG = _.extend({},PROD_DEFAULT_CONFIG,{
  mychannelAPIKey: '5UdJd5rqcXkIbRPtf0IK0oh1FngGe8MV',
  contentKey: 'www.myc.tv',
  orgStyle: 'org-myc',
  isDevApi: false,
  dcAPIKey: 'xXx0xDbUjlh3ZlfLMJ39WiRrL1OaBnzQ',
});

const INTEL_DEMO_CONFIG = _.extend({},PROD_DEFAULT_CONFIG,{
  mychannelAPIKey: 'G1RYeHMGPdKcujbeX67E8SvTBbrip8We',
  contentKey: 'intel-demo.myc.tv',
  orgStyle: 'org-intel-demo',
  isDevApi: false,
  dcAPIKey: 'DMkgwtLH4bU5288JTk9WrdsKHs3IRAv_',
});
const INTEL_DEMO_DEV_CONFIG = _.extend({},DEV_DEFAULT_CONFIG,{
  mychannelAPIKey: 'Iu6QUyLTZ4jPTyceRV0ZZ0KPeZbppBVO',
  contentKey: 'intel-demo.myc-dev.tv',
  orgStyle: 'org-intel-demo',
  isDevApi: true,
  dcAPIKey: 'DMkgwtLH4bU5288JTk9WrdsKHs3IRAv_',
});

const AETNA_DEMO_CONFIG = _.extend({},PROD_DEFAULT_CONFIG,{
  mychannelAPIKey: 'nyVsAHf1ynRD2vuDD0yromcR6qngJBBY',
  contentKey: 'aetna-demo.myc.tv',
  orgStyle: 'org-aetna-demo',
  isDevApi: false,
  dcAPIKey: 'DMkgwtLH4bU5288JTk9WrdsKHs3IRAv_',
});
const AETNA_DEMO_DEV_CONFIG = _.extend({},DEV_DEFAULT_CONFIG,{
  mychannelAPIKey: 'KHs8oVpA1eDYwYjqOQC1lQlh0fDxnHzr',
  contentKey: 'aetna-demo.myc-dev.tv',
  orgStyle: 'org-aetna-demo',
  isDevApi: true,
  dcAPIKey: 'DMkgwtLH4bU5288JTk9WrdsKHs3IRAv_',
});

const FANDM_DEMO_CONFIG = _.extend({},PROD_DEFAULT_CONFIG,{
  mychannelAPIKey: 'ioGvRA3pgKfsT7nQOHidJlzEgzRK2j9K',
  contentKey: 'fandm-demo.myc.tv',
  orgStyle: 'org-fandm-demo',
  isDevApi: false,
  dcAPIKey: 'DMkgwtLH4bU5288JTk9WrdsKHs3IRAv_',
});
const FANDM_DEMO_DEV_CONFIG = _.extend({},DEV_DEFAULT_CONFIG,{
  mychannelAPIKey: 'FeidbFpt40mIIaAORcCQIvxeUkqE9P3x',
  contentKey: 'fandm-demo.myc-dev.tv',
  orgStyle: 'org-fandm-demo',
  isDevApi: true,
  dcAPIKey: 'DMkgwtLH4bU5288JTk9WrdsKHs3IRAv_',
});

const KDC_DEMO_CONFIG = _.extend({},PROD_DEFAULT_CONFIG,{
  mychannelAPIKey: 'J3IOL2hmPGobwEeuRnyIWjH0bLsgXBRi',
  contentKey: 'kennedy-center-demo.myc.tv',
  orgStyle: 'org-kdc-demo',
  isDevApi: false,
  dcAPIKey: 'DMkgwtLH4bU5288JTk9WrdsKHs3IRAv_',
});
const KDC_DEMO_DEV_CONFIG = _.extend({},DEV_DEFAULT_CONFIG,{
  mychannelAPIKey: 'J3IOL2hmPGobwEeuRnyIWjH0bLsgXBRi',
  contentKey: 'kennedy-center-demo.myc-dev.tv',
  orgStyle: 'org-kdc-demo',
  isDevApi: true,
  dcAPIKey: 'DMkgwtLH4bU5288JTk9WrdsKHs3IRAv_',
});

const BLACKROCK_DEMO_CONFIG = _.extend({},PROD_DEFAULT_CONFIG,{
  mychannelAPIKey: 'Tae6hPl4mIutr0am094GhfIxeQrbhlKT',
  contentKey: 'blackrock-demo.myc.tv',
  orgStyle: 'org-blackrock-demo',
  isDevApi: false,
  dcAPIKey: 'DMkgwtLH4bU5288JTk9WrdsKHs3IRAv_',
});
const BLACKROCK_DEMO_DEV_CONFIG = _.extend({},DEV_DEFAULT_CONFIG,{
  mychannelAPIKey: 'Tae6hPl4mIutr0am094GhfIxeQrbhlKT',
  contentKey: 'blackrock-demo.myc-dev.tv',
  orgStyle: 'org-blackrock-demo',
  isDevApi: false,
  dcAPIKey: 'DMkgwtLH4bU5288JTk9WrdsKHs3IRAv_',
});

const MYC_DEMO_CONFIG = _.extend({},PROD_DEFAULT_CONFIG,{
  mychannelAPIKey: 'UTXkSs15lBgfSyQuXczXACqgOBHOZtos',
  contentKey: 'myc-demo.myc.tv',
  orgStyle: 'org-myc',
  isDevApi: false,
  dcAPIKey: 'xXx0xDbUjlh3ZlfLMJ39WiRrL1OaBnzQ',
});

const BOK_DEMO_CONFIG = _.extend({},PROD_DEFAULT_CONFIG,{
  mychannelAPIKey: 'zWBk6ahut1ldcXf5WEHv23N4YzWeY8Sz',
  contentKey: 'bok-demo.myc.tv',
  orgStyle: 'org-bok-demo',
  isDevApi: false,
  dcAPIKey: 'xXx0xDbUjlh3ZlfLMJ39WiRrL1OaBnzQ',
});

const MOREHOUSE_DEMO_CONFIG = _.extend({},PROD_DEFAULT_CONFIG,{
  mychannelAPIKey: '9WFHhhKvrGI9TkVhx5KwIxbSruYID8EZ',
  contentKey: 'morehouse-demo.myc.tv',
  orgStyle: 'org-morehouse',
  isDevApi: false,
  dcAPIKey: 'xXx0xDbUjlh3ZlfLMJ39WiRrL1OaBnzQ',
});

const GEORGIA_DEMO_CONFIG = _.extend({},PROD_DEFAULT_CONFIG,{
  mychannelAPIKey: 'pM1c297BR79iqYEpojVV6mozD4QVhmjU',
  contentKey: 'georgia-demo.myc.tv',
  orgStyle: 'org-georgia-demo',
  isDevApi: false,
  dcAPIKey: 'xXx0xDbUjlh3ZlfLMJ39WiRrL1OaBnzQ',
});

const MOREHOUSE_CONFIG = _.extend({},PROD_DEFAULT_CONFIG,{
  mychannelAPIKey: 'Kt78QrY1OLxX2lWEf651CH3cR8RYukHw',
  contentKey: 'morehouse.myc.tv',
  orgStyle: 'org-morehouse',
  isDevApi: false,
  dcAPIKey: 'diJQ9bavKSSgyQS6S1P42d7-OGBPZIfo',
});

const JUDYSMITH_DEMO_CONFIG = _.extend({},PROD_DEFAULT_CONFIG,{
  mychannelAPIKey: 'TOsG1PlxBIGCJkbu3G55af1nf4B4L8uF',
  contentKey: 'judysmith.myc.tv',
  orgStyle: 'org-judysmith-demo',
  isDevApi: false,
  dcAPIKey: 'xXx0xDbUjlh3ZlfLMJ39WiRrL1OaBnzQ',
});

const TRINITYHEALTH_DEMO_CONFIG = _.extend({},PROD_DEFAULT_CONFIG,{
  mychannelAPIKey: '1OUaHxSGZuNKn1TjZzHWrV9rI7X2onBC',
  contentKey: 'trinityhealth.myc.tv',
  orgStyle: 'org-trinityhealth-demo',
  isDevApi: false,
  dcAPIKey: 'xXx0xDbUjlh3ZlfLMJ39WiRrL1OaBnzQ',
});

const WILLIS_TOWERS_DEMO_CONFIG = _.extend({},PROD_DEFAULT_CONFIG,{
  mychannelAPIKey: 'G7d3CdkDvKGyKYvU5Gi4m1QowDBfiXqB',
  contentKey: 'willistowerswatson.myc.tv',
  orgStyle: 'org-willis-towers-demo',
  isDevApi: false,
  dcAPIKey: 'xXx0xDbUjlh3ZlfLMJ39WiRrL1OaBnzQ',
});

const DEFAULT_CONFIG = TEST_CONFIG;

const HOST_CONFIG_MAP = {
  '127.0.0.1': TEST_DEV_CONFIG,
  'localhost': TEST_DEV_CONFIG,
  'test.myc-dev.tv': TEST_DEV_CONFIG,
  'test.local.myc-dev.tv': TEST_DEV_CONFIG,

  'test.myc.tv': TEST_CONFIG,
  'test.local.myc.tv': TEST_CONFIG,

  'www.myc-dev.tv': MYC_DEV_CONFIG,
  'mychannel.myc-dev.tv': MYC_DEV_CONFIG,
  'www.local.myc-dev.tv': MYC_DEV_CONFIG,

  'www.myc.tv': MYC_CONFIG,
  'mychannel.myc.tv': MYC_CONFIG,
  'www.local.myc.tv': MYC_CONFIG,

  'optum-demo.myc-dev.tv': OPTUM_DEV_CONFIG,
  'optum-demo.local.myc-dev.tv': OPTUM_DEV_CONFIG,
  'optum.myc-dev.tv': OPTUM_DEV_CONFIG,
  'optum.local.myc-dev.tv': OPTUM_DEV_CONFIG,
  'optum-demo.myc.tv': OPTUM_CONFIG,
  'optum-demo.local.myc.tv': OPTUM_CONFIG,
  'optum.myc.tv': OPTUM_CONFIG,
  'optum.local.myc.tv': OPTUM_CONFIG,
  'optum.tv': OPTUM_CONFIG,
  'www.optum.tv': OPTUM_CONFIG,

  'intel-demo.myc-dev.tv': INTEL_DEMO_DEV_CONFIG,
  'intel-demo.local.myc-dev.tv': INTEL_DEMO_DEV_CONFIG,
  'intel-demo.myc.tv': INTEL_DEMO_CONFIG,
  'intel-demo.local.myc.tv': INTEL_DEMO_CONFIG,

  'aetna-demo.myc-dev.tv': AETNA_DEMO_DEV_CONFIG,
  'aetna-demo.local.myc-dev.tv': AETNA_DEMO_DEV_CONFIG,
  'aetna-demo.myc.tv': AETNA_DEMO_CONFIG,
  'aetna-demo.local.myc.tv': AETNA_DEMO_CONFIG,

  'fandm-demo.myc-dev.tv': FANDM_DEMO_DEV_CONFIG,
  'fandm-demo.local.myc-dev.tv': FANDM_DEMO_DEV_CONFIG,
  'fandm-demo.myc.tv': FANDM_DEMO_CONFIG,
  'fandm-demo.local.myc.tv': FANDM_DEMO_CONFIG,

  'kennedy-center-demo.myc-dev.tv': KDC_DEMO_DEV_CONFIG,
  'kennedy-center-demo.local.myc-dev.tv': KDC_DEMO_DEV_CONFIG,
  'kennedy-center-demo.myc.tv': KDC_DEMO_CONFIG,
  'kennedy-center-demo.local.myc.tv': KDC_DEMO_CONFIG,

  'blackrock-demo.myc-dev.tv': BLACKROCK_DEMO_DEV_CONFIG,
  'blackrock-demo.local.myc-dev.tv': BLACKROCK_DEMO_DEV_CONFIG,
  'blackrock-demo.myc.tv': BLACKROCK_DEMO_CONFIG,
  'blackrock-demo.local.myc.tv': BLACKROCK_DEMO_CONFIG,

  'myc-demo.myc.tv': MYC_DEMO_CONFIG,
  'myc-demo.local.myc.tv': MYC_DEMO_CONFIG,

  'bok-demo.myc.tv': BOK_DEMO_CONFIG,
  'bok-demo.local.myc.tv': BOK_DEMO_CONFIG,

  'morehouse-demo.myc.tv': MOREHOUSE_DEMO_CONFIG,
  'morehouse-demo.local.myc.tv': MOREHOUSE_DEMO_CONFIG,

  'georgia-demo.myc.tv': GEORGIA_DEMO_CONFIG,
  'georgia-demo.local.myc.tv': GEORGIA_DEMO_CONFIG,

  'morehouse.myc.tv': MOREHOUSE_CONFIG,
  'morehouse.local.myc.tv': MOREHOUSE_CONFIG,
  'morehouse.tv': MOREHOUSE_CONFIG,
  'www.morehouse.tv': MOREHOUSE_CONFIG,
  'local.morehouse.tv': MOREHOUSE_CONFIG,

  'judysmith.local.myc.tv': JUDYSMITH_DEMO_CONFIG,
  'judysmith.myc.tv': JUDYSMITH_DEMO_CONFIG,

  'trinityhealth.local.myc.tv': TRINITYHEALTH_DEMO_CONFIG,
  'trinityhealth.myc.tv': TRINITYHEALTH_DEMO_CONFIG,

  'willistowerswatson.local.myc.tv': WILLIS_TOWERS_DEMO_CONFIG,
  'willistowerswatson.myc.tv': WILLIS_TOWERS_DEMO_CONFIG,
};

router.get('/unsupported_browser',unsupported_browser);

router.get(/^(?!\/api|\/static|\/assets|\/debug).*$/,index);

function index(req,res) {
  if (app.get('env') == 'development' ) {
    res.header("Cache-Control","no-cache, no-store, must-revalidate");
  } else {
    res.header("Cache-Control","public, max-age=600");
  }
  const hostname = req.hostname;
  let app_config = HOST_CONFIG_MAP[hostname];
  if (!app_config) {
    if (/192\.168\..*/.test(hostname)) {
      app_config = OPTUM_DEV_CONFIG;
    } else {
      app_config = DEFAULT_CONFIG;
    }
  }

  const opts = {
    app_config_json: JSON.stringify(app_config),
    asset_hash: g_asset_hash,
    org_style: app_config.orgStyle,
    fav_icon_path: (app_config.favIconPath || "/static/img/myc"),
    org_title: (app_config.orgTitle || "myc app"),
  };

  res.render('index',opts);
}

function unsupported_browser(req,res) {
  if (app.get('env') == 'development' ) {
    res.header("Cache-Control","no-cache, no-store, must-revalidate");
  } else {
    res.header("Cache-Control","public, max-age=600");
  }
  res.render('unsupported_browser');
}
