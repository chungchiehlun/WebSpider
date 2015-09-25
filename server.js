var express = require('express');
var exphbs = require('express-handlebars');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var flash = require('connect-flash');
var session = require('express-session');
var app = express();


var fetchSrc = require('./lib/src.js');

// ========= CONFIG ============

// app.set('superSecert' , config.secret);
// ======= view engine setup ======
app.engine('handlebars', exphbs({
    defaultLayout: 'main',
}));
app.set('view engine', 'handlebars');

// Add This Line Will Cause Error
app.set('views', path.join(__dirname, 'views'));

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));



app.use(function(req , res , next){
  if(!res.locals.src) res.locals.src = {};
  res.locals.src = fetchSrc;
  next();
});
//passport config
// ========= Routes For Our API =============
var routes = require('./routes/index');

app.use('/', routes);



// required for passport
// problem : stackoverflow.com/questions/24477035/express-4-0-express-session-with-odd-warning-message
app.use(session({
    secret: 'configsecret',
    resave: true,
    saveUninitialized: true
}));

app.use(flash()); // use connect-flash for flash messages stored in session




// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
