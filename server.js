var request = require('request'),
    express = require("express"),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    app = express(),
    _ = require('underscore'),
    mongo = require('mongoskin'),
    mongoUri = process.env.MONGOLAB_URI ||
      process.env.MONGOHQ_URL ||
      'mongodb://localhost:27017/Items',
    db = mongo.db(mongoUri, {native_parser:true});

// ------ default route ------

app.get('/', function(req, res) {
  res.send('Hello World!');
});

// ------ BOILERPLATE EXPRESS ------

// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'views'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// ------ FETCH FUNCTIONS ------

var cheapItems = db.collection('cheapItems');
var expensiveItems = db.collection('expensiveItems');

var cheapItemsArray = [];
var expensiveItemsArray = [];
var quizPairs = [];

function deleteAllCheapItems() {
    cheapItems.remove({}, function(err, result) {
        if (!err) console.log('Deleted all items from cheapItems collection!');
    });
}

function deleteAllExpensiveItems() {
    expensiveItems.remove({}, function(err, result) {
        if (!err) console.log('Deleted all items from expensiveItems collection!');
    });
}

function fetchCheapItems(howManyHundred) {
    var theLimit = howManyHundred;
    var theOffset = 0;

    for (var i = 0; i < theLimit; i += 100) {
        etsyCheapItems(theLimit, theOffset);
        theOffset += 100;
    }
}

function fetchExpensiveItems(howManyHundred) {
    var theLimit = howManyHundred;
    var theOffset = 0;

    for (var i = 0; i < theLimit; i += 100) {
        etsyExpensiveItems(theLimit, theOffset);
        theOffset += 100;
    }
}

function etsyCheapItems(limit, offset) {

    request({uri: 'https://openapi.etsy.com/v2/listings/active?&limit='+limit+ '&offset=' +offset+ '&tags=art,painting&min_price=40&max_price=110&includes=Images&api_key=gpby6hrhuzepnv0rx17946lk', json: true}, function (error, response, body) {
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
                //save to cheapItemsArray
                cheapItemsArray.push(trimmedEtsyItem);
            })
        }
    })
}

function etsyExpensiveItems(limit, offset) {

    request({uri: 'https://openapi.etsy.com/v2/listings/active?&limit='+limit+ '&offset=' +offset+ '&tags=art,painting&min_price=250&max_price=1000&includes=Images&api_key=gpby6hrhuzepnv0rx17946lk', json: true}, function (error, response, body) {
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
                //save to expensiveItemsArray
                expensiveItemsArray.push(trimmedEtsyItem);
            })
        }
    })
}

function generateQuizPairs() {
    cheapItemsArray = _.shuffle(cheapItemsArray);
    expensiveItemsArray = _.shuffle(expensiveItemsArray);

    for (var i = 0; i < cheapItemsArray.length; i++) {
        var staging = [expensiveItemsArray[i], cheapItemsArray[i]];
        staging = _.shuffle(staging);

        //put the shuffled 'mini-array' pair in the actual array
        quizPairs.push(staging);
    }
}

// ------ KICKOFF! ------
deleteAllCheapItems();
deleteAllExpensiveItems();
fetchCheapItems(500);
fetchExpensiveItems(500);

setInterval(function() {generateQuizPairs();}, 20000);
setInterval(function() {console.log(quizPairs); console.log(quizPairs.length);}, 25000);















