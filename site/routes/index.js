var express = require('express');
var search = require('../lib/search')
var router = express.Router();


router.get('/', function(req, res, next) {
  res.render('home', { title: 'Express' });
});

router.post('/search', function(req, res, next) {
  search(req.body , res);
});

module.exports = router;
