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

// ------ Gather cheapItems collection data
var cheapItems = db.collection('cheapItems');

// clear existing data (temporary for testing)
cheapItems.remove({}, function(err, result) {
    if (!err) console.log('Cleared cheapItems collection!');
});

request({uri: 'https://openapi.etsy.com/v2/listings/active?&limt=2&tags=art,painting&min_price=40&max_price=200&includes=Images&api_key=gpby6hrhuzepnv0rx17946lk', json: true}, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    cheapItems.insert(body, function(err, result) {
        if (err) throw err;
        if (result) console.log('Fresh fetch to cheapItems collection!');
    });
  }
})

// ------ Gather expensiveItems collection data
var expensiveItems = db.collection('expensiveItems');
var etsyResults = [];

// clear existing data (temporary for testing)
expensiveItems.remove({}, function(err, result) {
    if (!err) console.log('Cleared expensiveItems collection!')
});

request({uri: 'https://openapi.etsy.com/v2/listings/active?&limit=2&tags=art,painting&min_price=250&max_price=3000&includes=Images&api_key=gpby6hrhuzepnv0rx17946lk', json: true}, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    expensiveItems.insert(body, function(err, result) {
        if (err) throw err;
        if (result) {
            console.log('Fresh fetch to expensiveItems collection!');

            expensiveItems.find({}).toArray(function(err, result) {
                etsyResults = result[0].results;
                console.log(etsyResults);
            });

            console.log(etsyResults);
            // callback/promise needs to be implemented to prevent this from firing too soon.
            // _.each(etsyResults, function(el, i) {
            // });
        }
    });
  }
})




// // ------ DUMMY MONGO

// cheapItems.find().toArray(function(err, result) {
//     console.log(err);
//     console.log(result);
// });




















