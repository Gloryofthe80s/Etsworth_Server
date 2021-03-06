// ------ REQUIRES ------
var request = require('request'),
    express = require("express"),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    app = express(),
    _ = require('underscore'),
    Promise = require('promise')
    etsyItems = require('./routes/etsyItems');

    //set globals
    app.set('cheapItemsArray', []);
    app.set('expensiveItemsArray', []);
    app.set('quizPairs', []);

// ------ ROUTES ------
app.get('/', routes.index);
app.get('/etsyItems', etsyItems.quizPairs);

// ------ BOILERPLATE EXPRESS ------
app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'views'));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// ------ DEVELOPMENT ENV ONLY ------
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// ------ LAUNCH SERVER ------
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

// ------ FETCH FUNCTIONS ------
function deleteAllCheapItems() {
    app.set('cheapItemsArray', []);
    console.log('flushed cheapItemsArray!')
}

function deleteAllExpensiveItems() {
    app.set('cheapItemsArray', []);
    console.log('flushed expensiveItemsArray!')
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

    request({uri: 'https://openapi.etsy.com/v2/listings/active?&limit='+limit+ '&offset=' +offset+ '&tags=art,painting&min_price=60&max_price=209&includes=Images&api_key=gpby6hrhuzepnv0rx17946lk', json: true}, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            //get just the results array from the Etsy return object
            var bodyResults = body.results;

            //trim out select props from JSON response and push to cheapItemsArray
            _.each(bodyResults, function(el, i) {
                var trimmedEtsyItem = {
                    title : el.title,
                    price : el.price,
                    url : el.url,
                    url_570xN : el.Images[0] ? el.Images[0].url_570xN : '',
                };
                //save to cheapItemsArray
                app.get('cheapItemsArray').push(trimmedEtsyItem);
            })
        }
    })
}

function etsyExpensiveItems(limit, offset) {

    request({uri: 'https://openapi.etsy.com/v2/listings/active?&limit='+limit+ '&offset=' +offset+ '&tags=art,painting&min_price=210&max_price=1000&includes=Images&api_key=gpby6hrhuzepnv0rx17946lk', json: true}, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            //get just the results array from the Etsy return object
            var bodyResults = body.results;

            //trim out select props from JSON response and push new obj to expensiveItemsArray
            _.each(bodyResults, function(el, i) {
                var trimmedEtsyItem = {
                    title : el.title,
                    price : el.price,
                    url : el.url,
                    url_570xN : el.Images[0] ? el.Images[0].url_570xN : '',
                };
                //save to expensiveItemsArray
                app.get('expensiveItemsArray').push(trimmedEtsyItem);
            })
        }
    })
}

function generateQuizPairs() {
    app.set('cheapItemsArray', _.shuffle(app.get('cheapItemsArray')));
    app.set('expensiveItemsArray', _.shuffle(app.get('expensiveItemsArray')));

    for (var i = 0; i < app.get('cheapItemsArray').length; i++) {
        var staging = [app.get('expensiveItemsArray')[i], app.get('cheapItemsArray')[i]];
        staging = _.shuffle(staging);

        //put the shuffled 'mini-array' pair in the actual array
        app.get('quizPairs').push(staging);
    }
}

// ------ KICKOFF! ------
deleteAllCheapItems();
deleteAllExpensiveItems();
fetchCheapItems(500);
fetchExpensiveItems(500);

setInterval(function() {generateQuizPairs();}, 20000);
setInterval(function() {console.log(app.get('expensiveItemsArray')); console.log(app.get('expensiveItemsArray').length);}, 25000);
setInterval(function() {console.log(app.get('cheapItemsArray')); console.log(app.get('cheapItemsArray').length);}, 25000);


// function updateItems(callback) {
//     fetchCheapItems(500);
//     fetchExpensiveItems(500);
//     generateQuizPairs();
// }

// var myPromise = new Promise(function (resolve, reject) {
//   // call resolve(value) to fulfill the promise with that value
//   // call reject(error) if something goes wrong
// })

