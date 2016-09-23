const restify = require('restify');
const ytSearch = require('youtube-search');
const youtubeStream = require('youtube-audio-stream');
var server = restify.createServer();

var opts = {
  maxResults: 1,
  key: 'AIzaSyBtGDcDYuQpR2cbtwhYaH2NtwhWdhBYNiU'
};

server.get('/play/:searchString', function(req,res,next){
  ytSearch(req.params.searchString, opts, function(err, results) {
    if(err) return console.log(err);
    youtubeStream(results[0].link).pipe(res)
  });
});

server.listen(9090, function() {
  console.log('%s listening at %s', server.name, server.url);
});
