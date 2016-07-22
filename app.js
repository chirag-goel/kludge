var express = require('express');
var socket_io = require("socket.io");
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var serialport = require('serialport');

var app = express();
var io = socket_io(); // Socket.io
app.io = io;

var routes = require('./routes/index')(io);
var users = require('./routes/users');
var serialport = require('serialport');

  // var portName = 'COM11';
  // var sp = new serialport.SerialPort(portName, {
  //     baudRate: 9600,
  //     dataBits: 8,
  //     parity: 'none',
  //     stopBits: 1,
  //     flowControl: false,
  //     parser: serialport.parsers.readline("\r\n")
  // });
  var data;
  io.on('connection', function(socket){
        console.log('a user connected');
    sp.on('data', function(input) {
    var res = input.split("|");
    var moistureVal = res[0];
    var light = res[1];
    var humidity = res[2];
    var temperatureC = res[3];
    var temperatureF = res[4];
    var heatIndexC = res[5];
    var heatIndexF = res[6];
    var height = res[7];

    

    var moisture = ((moistureVal-500)/5);

    var ph = ((1/1800)*(moisture*moisture)) - ((13/300)*(moisture)) + 7;
    ph = ph.toPrecision(2);
    var calcium = (-(16/15)*(moisture*moisture)) + ((284/3)*(moisture)) + 620;
    calcium = calcium.toPrecision(2);
    var pottasium = (-(11/1800)*(moisture*moisture)) + ((49/60)*(moisture)) + 1;
    pottasium = pottasium.toPrecision(2);
    var phosporous = ((19/2400)*(moisture*moisture)) - ((47/60)*(moisture)) + (203/8);
    phosporous = phosporous.toPrecision(2);
    var manganese = ((1/3200)*(moisture*moisture)) - ((11/400)*(moisture)) + (103/160);
    manganese = manganese.toPrecision(2);
    if((height < 100)) {
      data = [
        {
          ph: ph,
          calcium: calcium,
          pottasium: pottasium,
          manganese: manganese,
          phosporous: phosporous,
          moisture: moisture,
          light: light,
          humidity: humidity,
          temperatureC: temperatureC,
          temperatureF: temperatureF,
          heatIndexC: heatIndexC,
          heatIndexF: heatIndexF,
          moistureVal: moistureVal,
          height: height
        }
      ];

      var info = JSON.stringify(data);
        socket.emit("data", info);
        socket.on('disconnect', function(){
          console.log('user disconnected');
        });

        if(moisture<0.5) {
          console.log("notification sent");
          socket.emit("notification", "Please irrigate. Low soil moisture.");
        }
        if(light<50) {
          console.log("notification sent");
          socket.emit("notification", "Recivieving low light.");
        }
      console.log("emitted");
    }
      console.log(data);
  });
    
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/downloads',express.static(path.join(__dirname, 'files/datasets')));

app.use('/', routes);
app.use('/users', users);

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
