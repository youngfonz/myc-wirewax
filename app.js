'use strict';

if( require('semver').lt(process.version,'4.2.1') ) {
  console.error("Your node version:",process.version);
  console.error("This project requires node 4.2.1 or greater.");
  process.exit(-1);
}

const _ = require('lodash');
const async = require('async');
const express = require('express');
const multipart = require('connect-multiparty');
const http = require('http');
const morgan = require('morgan');
const method_override = require('method-override');
const body_parser = require('body-parser');
const cookie_parser = require('cookie-parser');
const server_control = require('server-control');
const errorhandler = require('errorhandler');
const webpack = require('webpack');
const webpack_middleware = require("webpack-dev-middleware");
const webpack_hot_middleware = require("webpack-hot-middleware");
const ejs = require('ejs');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const routes = require('./routes');
const util = require('./util.js');

const port = process.env.PORT || 3022;

http.STATUS_CODES[460] = 'Not Allowed';

const app = express();
const is_development = app.get('env') == 'development';

app.enable('trust proxy')
app.set('port',port);
if (is_development) {
  app.use(morgan('[:date] :method :url :status :res[content-length] - :response-time ms'));
} else {
  app.use(morgan(':remote-addr - - [:date] ":method :url HTTP/:http-version" :status :response-time(ms) ":referrer" ":user-agent"'));
}
app.use(cookie_parser());
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: false }));
app.engine('.html', ejs.__express);

app.set('views', __dirname + '/views');
app.set('view engine', 'html');

app.get('/status_check',(req,res) => { res.sendStatus(200); } );
app.use('/static',express.static('static'));

server_control.init(app,{
  prefix: '/',
  repo_url: 'git@github.com:mychannel-is/mychannel-web.git',
  service_port: 80,
  http_proto: 'http',
  secret: "t873r6823uad7823",
  restart_function: function() {
    console.log("Successful update, restarting server");
    process.exit(0);
  },
});

if( is_development ) {
  app.all('/quit',(req,res) => {
    process.exit(0);
  });
}

/********/

let g_expires_date = false;
let g_last_modified_date = (new Date()).toUTCString();

function updateExpires() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1)
  g_expires_date = date.toUTCString();
}
updateExpires();
setInterval(updateExpires,10*60*1000);

const webpack_entry = [ 'babel-polyfill', './src/index' ];
const webpack_plugins = [
  new webpack.NoErrorsPlugin(),
  new webpack.optimize.UglifyJsPlugin({ mangle: false }),
  function() {
    this.plugin('done',function(stats) {
      const hash = stats.hash;
      console.log("asset hash:",hash);
      routes.updateAssetHash(hash);
      g_last_modified_date = (new Date()).toUTCString();
    });
  },
];

if (is_development) {
  webpack_entry.unshift('webpack-hot-middleware/client?reload=true');
  webpack_plugins.unshift(new webpack.HotModuleReplacementPlugin());
} else {
  webpack_plugins.unshift(new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify('production'),
    }
  }));
}

const webpack_config = {
  devtool: 'source-map',
  entry: webpack_entry,
  output: {
    path: path.join(__dirname, 'assets'),
    filename: 'bundle-[hash].js',
    publicPath: '/assets/',
  },
  plugins: webpack_plugins,
  resolve: {
    extensions: ['', '.js', '.jsx'],
  },
  module: {
    loaders: [
    {
      test: /\.jsx?$/,
      loaders: ['react-hot', 'babel'],
      include: [
        path.join(__dirname, 'src'),
        path.join(__dirname, 'node_modules/browser-data-cortex'),
      ],
    },
    {
      test: /\.less$/,
      loader: 'style!css!autoprefixer!less'
    },],
  }
};

const compiler = webpack(webpack_config);
const webpack_middleware_options = {
  noInfo: true,
  quiet: false,
  lazy: false,
  watchOptions: {
    aggregateTimeout: 300,
    poll: false,
  },
  publicPath: "/assets/",
  stats: {
    colors: true
  },
  headers: {
    'Cache-Control': 'public, max-age=' + 2*365*24*60*60,
    'Expires': { toString: () => g_expires_date },
    'Last-Modified': { toString: () => g_last_modified_date },
  },
};
if (!is_development) {
  webpack_middleware_options.quiet = true;
  webpack_middleware_options.stats.colors = false;
}
app.use(webpack_middleware(compiler,webpack_middleware_options));
app.use(webpack_hot_middleware(compiler));

app.use(routes.router);

/*******/

app.use(my_error_handler);

http.createServer(app).listen(app.get('port'),function() {
  console.log('Express server listening on port ' + app.get('port'));
});

function my_error_handler(err,req,res,next) {
  if (err && err.code && err.body && typeof err.code === 'number') {
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.header("Content-Type","text/plain");
    res.status(err.code).send(err.body.toString());
  } else if (is_development) {
    errorhandler()(err,req,res,next);
  } else {
    util.errorLog("Middleware err:",err);
    res.header("Cache-Control", "no-cache, no-store, must-revalidate");
    res.sendStatus(500);
  }
}
