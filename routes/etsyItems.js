exports.lasagna = function(req, res) {
  res.json(200, req.app.get('quizPairs') );
}