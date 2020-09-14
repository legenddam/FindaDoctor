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

  if(req.query.state){
    var query = "SELECT * FROM doctors WHERE state = ?"; 
    client.execute(query, [req.query.state], function(err, result){
      if(err){
        console.log("No Database");
        res.status(404).send({msg : err});
      }else{
        res.render('doctors', {doctors: result.rows});
      }
    });

  }else{
    var query = "SELECT * FROM doctors"; 
    client.execute(query, [], function(err, result){
      if(err){
        console.log("No Database");
        res.status(404).send({msg : err});
      }else{
        res.render('doctors', {doctors: result.rows});
      }
    });
  }
});


//doctors/detail/doc_id
router.get('/detail/:id', function(req, res, next) {
  var query = "SELECT * FROM doctors WHERE doc_id = ?";
  client.execute(query, [req.params.id], function(err, result){
    if(err){
      console.log("No Database");
      res.status(404).send({msg : err});
    }else{
      console.log(result.rows['0']);
      res.render('doctor_detail', {doctor : result.rows['0']});
    }
  });
});
//doctors/category/name
router.get('/category/:name', function(req, res, next) {
  var query = "SELECT * FROM doctors WHERE category = ?";
  console.log(req.params.name);
  client.execute(query, [req.params.name], function(err, result){
    if(err){
      console.log("No Database");
      res.status(404).send({msg : err});
    }else{
      console.log(result.rows);
      res.render('doctors', {doctors : result.rows});
    }
  });
});

router.get('/add', function(req, res, next) {
  var query = "SELECT * FROM categories"; 
  client.execute(query, [], function(err, result){
    if (err){
      res.status(404).send({msg : err});
    }else{
      res.render('add-doctor', {categories : result.rows});
    }

  });
});

router.post('/add', function(req, res, next) {
  
  var doc_id = cassandra.types.uuid();
  var full_name = req.body.full_name;
  var category = req.body.category;
  var city = req.body.city;
  var state = req.body.state;
  var graduation_year = req.body.graduation_year;
  var new_patients = req.body.new_patients;
  var practice_name = req.body.practice_name;
  var street_address = req.body.street_address;

  req.checkBody('full_name', 'Full_Name field is required').notEmpty();
  req.checkBody('city', 'City Field is required').notEmpty();
  req.checkBody('practice_name', 'Practice_Name field is required').notEmpty();
  req.checkBody('graduation_year', 'Graduation_Year Field is required').notEmpty();
  req.checkBody('state', 'State Filed must be selected').not().isIn("0");

  var errors = req.validationErrors();
  if(errors){
    console.log("Input Error");
  }else{
    var query = "INSERT INTO doctors (doc_id, full_name, category, city, state, graduation_year, new_patients, practice_name, street_address) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)";
    client.execute(query, [doc_id, full_name, category,city,
     state, graduation_year, new_patients,practice_name, street_address], {prepare:true}, function(err, result){
      if (err){
        console.log("DataBase Failed");
        res.status(404).send({msg : err});
      }else{
        res.location('/doctors');
        res.redirect('/doctors');
      }
    });
  
  }
});
module.exports = router;
