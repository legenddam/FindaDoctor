var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var expressValidator = require('express-validator');
var session = require('express-session');

var indexRouter = require('./routes/index');
var doctorsRouter = require('./routes/doctors');
var categoriesRouter = require('./routes/categories');

var exphbs  = require('express-handlebars');

var app = express();


const cassandra = require('cassandra-driver');

const client = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  keyspace: 'findadoc'
});

client.connect(function(err, result){
  console.log("Cassandra Connected APP.JS");
});

var query = "SELECT * FROM categories";
client.execute(query, [], function(err, result){
  if(err){
    console.log("No Database");
  }else{
    app.locals.localCategories = result.rows;
  }
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.engine('handlebars', exphbs({defaultLayout:'main', partialsDir: __dirname + '/views/partials'}));
app.set('view engine', 'handlebars');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  
  secret : 'secret',
  saveUninitialized : true,
  resave : true
}));

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
})); 
//Express-flash Message
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use('/', indexRouter);
app.use('/doctors', doctorsRouter);
app.use('/categories', categoriesRouter);

/*
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
//  res.render('error');
});
*/
module.exports = app;
