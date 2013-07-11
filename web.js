var express = require('express');
var fs = require ('fs');
var app = express.createServer(express.logger());
var buf = new Buffer()

app.get('/', function(request, response) {
  response.send(buf.ToString(fs.readFileSync("index.html")));
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
