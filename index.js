const restify = require('restify');
const logger = require('restify-logger');
const youtubeSearch = require('youtube-search');
const ytdl = require('ytdl-core');
const oppressor = require('oppressor');

var server = restify.createServer();
server.server.setTimeout(99999999);
server.use(logger('custom', {
    skip: function(req) {
        return process.env.NODE_ENV === "test" || req.method === "OPTIONS" || req.url === "/status";
    }
}));

var opts = {
    maxResults: 1,
    key: process.env.YOUTUBE_API_KEY
};

var ytdlOpts = {
    quality: 'highest',
    highWaterMark: 999999999999,
    filter: 'audioonly'
};

server.get('/play/:searchString', function(req, res, next) {
    delete ytdlOpts.range;
    var range = req.header('Range','0-').split('-');
    if (range.length === 2 && parseInt(range[0]) > 0 && parseInt(range[1]) > 0 ) {
      ytdlOpts.range = { start:parseInt(range[0]), end:parseInt(range[1]) };
    }
    if (parseInt(range[0]) > 0) {
      ytdlOpts.range = { start:parseInt(range[0]) };
    }
    youtubeSearch(req.params.searchString, opts, function(err, results) {
        if (err) return res.send(err);
        var results = results[0];
        if (results.kind == 'youtube#video') {
            console.log(results);
            ytdl(results.link, ytdlOpts).pipe(oppressor(req)).pipe(res);
        } else if(results.kind == 'youtube#channel') {
            var channelOpts = {};
            channelOpts.key = opts.key;
            channelOpts.maxResults = opts.maxResults;
            channelOpts.channelId = results.channelId;
            channelOpts.order= 'date';
            channelOpts.type = 'video';
            youtubeSearch('', channelOpts, function(err, results) {
                if(err) return res.send(err);
                console.log(results);
                ytdl(results[0].link, ytdlOpts).pipe(oppressor(req)).pipe(res);
            });
        } else {
            res.send(501, {
                error: 'cannot play search result entity',
                kind: results.kind
            });
        }
    });
});
server.listen(9090, function() {
    console.log('%s listening at %s', server.name, server.url);
});
