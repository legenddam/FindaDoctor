var express = require('express');
var router = express.Router();

const cassandra = require('cassandra-driver');

const client = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'findadoc'
});

client.connect(function(err, result){
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('categories');
});

router.get('/add', function(req, res, next) {
  res.render('add-category');
});

router.post('/add', function(req, res, next) {

  if(req.body.name.length){
    var cat_id = cassandra.types.uuid();
    var query = "INSERT INTO categories (cat_id, name) VALUES(?, ?)";
    client.execute(query, [cat_id, req.body.name], function(err, result){
      if(err){
        console.log("Failed Database connection");
        res.status(404).send({msg : err});
      }else{
        res.location('/doctors');
        res.redirect('/doctors');
      }
    });
  }else{
    req.flash("error", "The Category Filed is required");
  }
});
module.exports = router;
