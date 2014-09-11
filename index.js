
/**
 * Module dependencies
 */

var Strategy = require('sauth/strategy')
  , qs = require('querystring')
  , url = require('url')
  , http = require('http')
  , exec = require('child_process').exec
  , agent = require('superagent')

/**
 * Spotify API Endpoint
 */

var ENDPOINT = 'https://accounts.spotify.com';

/**
 * Initializes the spotify strategy
 *
 * @api public
 * @param {Object} opts
 * @param {Functin} done
 */

module.exports = function (opts, done) {
  return SpotifyStrategy(opts).run(done);
};

/**
 * `SpotifyStrategy' constructor
 *
 * @api public
 * @param {Object} opts
 */

module.exports.Strategy = SpotifyStrategy;
function SpotifyStrategy (opts) {
  if (!(this instanceof SpotifyStrategy)) {
    return new SpotifyStrategy(opts);
  }

  Strategy.call(this, 'spotify');
  this.clientId = opts['client-id'] || opts.clientId || opts.client_id;
  this.clientSecret = opts['client-secret'] || opts.clientSecret || opts.client_secret;
  this.redirectUri = opts['redirect-uri'] || opts.redirectUri|| opts.redirect_uri;
  this.port = opts.port || opts.p;

  if (!this.redirectUri) {
    if (!this.port) {
      throw new TypeError("Must have port if missing redirect uri");
    } else {
      this.redirectUri = 'http://localhost:'+ this.port;
    }
  } else if (!this.port) {
    this.port = url.parse(this.redirectUri).port;
  }
}

// inherit `Strategy'
SpotifyStrategy.prototype = Object.create(Strategy.prototype, {
  constructor: {value: SpotifyStrategy}
});

SpotifyStrategy.prototype._open = function (uri, done) {
  exec("open '"+ uri +"'", function (err) {
    if (err) { return done(err); }
    done();
  });
};

// implements `_setup'
SpotifyStrategy.prototype._setup = function (done) {
  done();
};

// implements `_auth'
SpotifyStrategy.prototype._auth = function (done) {
  var self = this;
  var closed = false;
  var u = ENDPOINT +'/en/authorize';
  var server = http.createServer(onrequest);
  var sockets = [];
  u += '?'+ qs.stringify({
    client_id: this.clientId,
    response_type: 'code'
  });

  u += '&redirect_uri='+ this.redirectUri

  this._open(u, function (err) {
    if (err) { return done(err); }
    server.listen(self.port);
  });


  function onrequest (req, res) {
    if (closed) { return; }
    self.code = qs.parse(url.parse(req.url).query).code;
    res.write('<script> window.open(location, "_self").close(); </script>');
    res.end();
    server.close(done);
    closed = true;
    sockets.forEach(function (socket) { socket.destroy(); });
  }
};

// implements `_access'
SpotifyStrategy.prototype._access = function (done) {
  var self = this;
  agent
  .post(ENDPOINT +'/api/token')
  .type('form')
  .send({
    grant_type: 'authorization_code',
    code: this.code,
    redirect_uri: this.redirectUri,
    client_id: this.clientId,
    client_secret: this.clientSecret
  })
  .end(function (err, res) {
    if (err) { return done(err); }
    self.set(res.body);
    done();
  });
};

// implements `_end'
SpotifyStrategy.prototype._end = function (done) {
  console.log(this.data)
  done();
};

