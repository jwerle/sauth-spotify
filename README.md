sauth-spotify
=============

Spotify [sauth](https://github.com/jwerle/sauth) strategy

## install

```sh
$ npm i sauth-spotify
```

## usage

Command line arguments:

```sh
$ sauth spotify \
  --client-id=CONSUMER_ID \
  --client-secret=CONSUMER_SECRET \
  --port=PORT
```

Possible JSON configuration:

```sh
$ sauth spotify -c conf.json
```

conf.json

```json
{
  "client_id": "CLIENT_KEY",
  "client_secret": "CLIENT_SECRET",
  "redirect_uri": "REDIRECT_URI",
  "port": 9999
}
```

## license

MIT

