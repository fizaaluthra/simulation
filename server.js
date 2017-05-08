const express = require('express');
const jwt = require('jwt-simple');
const MongoClient = require('mongodb').MongoClient;
const app = express();
const bodyParser = require('body-parser');
const ObjectId = require('mongodb').ObjectId;
const bcrypt = require('bcryptjs');

const JWT_SECRET = 'fart'
MongoClient.connect("mongodb://localhost:27017/polls" , function(err, dbconnection){
  if(!err){
    console.log("We are connected");
    db = dbconnection;
    return db;
  }
});
app.use(bodyParser.json());
app.use(express.static('public'));
  var polls = ['hi','ha'];
app.get('/polls', function(req, res, next) {
  db.collection('polls', function(err, pollsCollection) {
    pollsCollection.find().toArray(function(err, polls){
      return res.send(polls);
    });
    return
  });
  return
});
app.get('/pollresults', function(req, res, next) {
  db.collection('polls', function(err, pollsCollection) {
    var poll = decodeURIComponent(req.query.poll);
   pollsCollection.findOne({text: poll}, function(err, poll){
     console.log(poll);
      return res.send(poll);
    });
    return
  });
  return
});
app.post('/polls', function(req, res, next){
  db.collection('polls', function(err, pollsCollection){
    pollsCollection.insert({text: req.body.newPoll,textencoded: req.body.newPollEncoded, options: req.body.options}, {w:1}, function(err){
      return res.send();
    });
  });
  polls.push(req.body.newPoll);
  res.send();
});

app.put('/polls/remove', function(req, res, next){
  db.collection('polls', function(err, pollsCollection){
    var pollId = req.body.poll._id;

    pollsCollection.remove({_id: ObjectId(pollId)}, function(err){
      return res.send();
    });
  });
  polls.push(req.body.newPoll);

  res.send();
});
app.post('/users', function(req, res, next){
  db.collection('users', function(err, usersCollection){
    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(req.body.password, salt, function(err, hash){

        var newUser = {
          username: req.body.username,
          password: hash
        };

        usersCollection.insert(newUser, {w:1}, function(err){
          return res.send();
        });
      });
    });
  });
  polls.push(req.body.newPoll);
  res.send();
});
app.put('/users/signin', function(req, res, next){
  db.collection('users', function(err, usersCollection){
    usersCollection.findOne({username: req.body.username}, function(err, user){
      bcrypt.compare(req.body.password, user.password, function(err, result){
        if(result){
          var token = jwt.encode(user, JWT_SECRET);
          return res.json({token: token});
          return res.send();
        }
        else{
          return res.status(400).send();
        }
      });
    });
  });
  polls.push(req.body.newPoll);
  res.send();
});
app.listen(3000, function(){
  console.log('Example app');
});
