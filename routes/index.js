var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("Server is runnin on 3000 port")
  res.render('index');
});

module.exports = router;
