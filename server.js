var request = require('request'),
    express = require("express"),
    app = express(),
    _ = require('underscore'),
    mongo = require('mongoskin'),
    mongoUri = process.env.MONGOLAB_URI ||
      process.env.MONGOHQ_URL ||
      'mongodb://localhost:27017/Items',
    db = mongo.db(mongoUri, {native_parser:true});

// ------ default route

app.get('/', function(req, res) {
  res.send('Hello World!');
});

// ------ Dev/Production Port

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});

// ------ ETSY STUFF

request('https://openapi.etsy.com/v2/listings/active?api_key=gpby6hrhuzepnv0rx17946lk', function (error, response, body) {
  if (!error && response.statusCode == 200) {
    console.log(JSON.parse(body));
  }
})


// // ------ DUMMY MONGO
// var cheapItems = db.collection('cheapItems');

// cheapItems.find({title:'Dummy Painting'}).toArray(function(err, result) {
//     console.log(err);
//     console.log(result[0]);
// });


















