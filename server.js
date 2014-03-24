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

// ------ FETCH FUNCTIONS

var cheapItems = db.collection('cheapItems');
var expensiveItems = db.collection('expensiveItems');

function deleteAllCheapItems() {
    cheapItems.remove({}, function(err, result) {
        if (!err) console.log('Removed all items from cheapItems collection!');
    });
}

function deleteAllExpensiveItems() {
    expensiveItems.remove({}, function(err, result) {
        if (!err) console.log('Removed all items from expensiveItems collection!');
    });
}

function fetchCheapItems() {
    request({uri: 'https://openapi.etsy.com/v2/listings/active?&limit=1000&offset=100&tags=art,painting&min_price=40&max_price=110&includes=Images&api_key=gpby6hrhuzepnv0rx17946lk', json: true}, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            //get just the results array from the Etsy return object
            var bodyResults = [];
            bodyResults = body.results;

            //trim out select props from JSON response and push new obj to Mongo
            _.each(bodyResults, function(el, i) {
                var trimmedEtsyItem = {
                    title : el.title,
                    price : el.price,
                    url : el.url,
                    url_75x75 : el.Images[0].url_75x75,
                    url_170x135 : el.Images[0].url_170x135,
                    url_570xN : el.Images[0].url_570xN,
                    url_fullxfull : el.Images[0].url_fullxfull
                };
                //save to Mongo
                cheapItems.insert(trimmedEtsyItem, function(err, result) {
                    if (err) throw err;
                    if (result) console.log('added to cheapItems!');
                });
            })
        }
    })
}

function fetchExpensiveItems() {
    request({uri: 'https://openapi.etsy.com/v2/listings/active?&limit=1000&offset=100&tags=art,painting&min_price=250&max_price=3000&includes=Images&api_key=gpby6hrhuzepnv0rx17946lk', json: true}, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            //get just the results array from the Etsy return object
            var bodyResults = [];
            bodyResults = body.results;

            //trim out select props from JSON response and push new obj to Mongo
            _.each(bodyResults, function(el, i) {
                var trimmedEtsyItem = {
                    title : el.title,
                    price : el.price,
                    url : el.url,
                    url_75x75 : el.Images[0].url_75x75,
                    url_170x135 : el.Images[0].url_170x135,
                    url_570xN : el.Images[0].url_570xN,
                    url_fullxfull : el.Images[0].url_fullxfull
                };
                //save to Mongo
                expensiveItems.insert(trimmedEtsyItem, function(err, result) {
                    if (err) throw err;
                    if (result) console.log('added to expensiveItems!');
                });
            })
        }
    })
}

deleteAllCheapItems();
deleteAllExpensiveItems();
fetchCheapItems();
fetchExpensiveItems();

















