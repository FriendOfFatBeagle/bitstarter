var express = require('express');

var fs = require('fs');
var contentStr = fs.readFileSync('index.html', 'utf8');
//console.log( contentStr );

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  response.send(contentStr);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

