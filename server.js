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
  db.collection('polls').findOne({text: req.query.poll}, function(err, poll){

    return res.send(poll);
  });
});
app.post('/polls', function(req, res, next){
  var token = req.headers.authorization;
  var user = jwt.decode(token, JWT_SECRET);
  db.collection('polls', function(err, pollsCollection){
    pollsCollection.insert({text: req.body.newPoll,textencoded: req.body.newPollEncoded, options: req.body.options, user: user._id, username: user.username, users_voted: req.body.users_voted}, {w:1}, function(err){
      return res.send();
    });
  });
  return res.send();
});

app.put('/polls/remove', function(req, res, next){
  var token = req.headers.authorization;
  var user = jwt.decode(token, JWT_SECRET);
  db.collection('polls', function(err, pollsCollection){
    var pollId = req.body.poll._id;

    pollsCollection.remove({_id: ObjectId(pollId), user: user._id}, function(err){
      return res.send();
    }, function(err){
      return res.status(400).send();
    });
  });

  return res.send();
});

var helper = function(user, req){
db.collection('polls').findOneAndUpdate({'text':req.body.text}, {
  $set: {'options': req.body.options},
  $push:{'users_voted': user.username}
});
 //  db.collection('polls', function(err, pollsCollection){
 //
 //  pollsCollection.findOneAndUpdate({'text': req.body.text}, { $set: {'options': new_options}, $push: {'users_voted': user.username}}, function(res){
 //    console.log(req.body.text);
 //   });
 // });
 return
}
app.put('/polls/update', function(req, res, next){
  var token = req.headers.authorization;
  var user = jwt.decode(token, JWT_SECRET);
  var flag = 0;
  db.collection('polls', function(err, pollsCollection){
    var text = decodeURIComponent(req.body.text);
    var flag = 0;
    pollsCollection.findOne({'text': text}, function(err,result){

      var flag2 = 0;
      for (var i = 0; i < result.users_voted.length; ++i){
        if (result.users_voted[i] === user.username){
          flag = 1;
          return res.status(400).send();
      }
    }
    helper(user, req);
    return res.send();
  });
  //   if (flag2 === 0){
  //
  //   pollsCollection.findOneAndUpdate({'text': text}, { $set: {'options': new_options}, $push: {'users_voted': user.username}}, function(res){
  //     return
  //   });
  // }
  // else{
  //   console.log('hi');
  //   return res.status(400).send();
  // }});
//   });
// } else{
//   return res.status(400).send();
// }
});
});

app.post('/users', function(req, res, next){
  db.collection('Users', function(err, usersCollection){
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
  return res.send();
});
app.put('/users/signin', function(req, res, next){
  db.collection('Users').findOne({username: req.body.username}, function(err, user){

    if(user){
    bcrypt.compare(req.body.password, user.password, function(err, result){

            var token;
            if(result){

               token = jwt.encode(user, JWT_SECRET);
            }

              return res.json({token: token});
          });
        }
        return
});
return
});
app.listen(3000, function(){

});
