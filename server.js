var express = require('express');
var app = express();
app.use(express.static('public'));
app.get('/polls', function(req, res, next) {
  var polls = ['hi','ha'];
  return res.send(polls);
});
app.listen(3000, function(){
  console.log('Example app');
});
