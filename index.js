const restify = require('restify');
const logger = require('restify-logger');
const youtubeSearch = require('youtube-search');
const youtubeStream = require('youtube-audio-stream');
const oppressor = require('oppressor');

var server = restify.createServer();
server.use(logger('custom', {
    skip: function(req) {
        return process.env.NODE_ENV === "test" || req.method === "OPTIONS" || req.url === "/status";
    }
}));

var opts = {
    maxResults: 1,
    key: process.env.YOUTUBE_API_KEY
};

server.get('/play/:searchString', function(req, res, next) {
    youtubeSearch(req.params.searchString, opts, function(err, results) {
        if (err) return res.send(err);
        var results = results[0];
        if (results.kind == 'youtube#video') {
            console.log(results);
            youtubeStream(results.link).pipe(oppressor(req)).pipe(res);
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
                youtubeStream(results[0].link).pipe(oppressor(req)).pipe(res);
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
