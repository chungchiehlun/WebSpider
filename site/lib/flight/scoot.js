var https = require('https');
var fs = require('fs');
var querystring = require('querystring');
var cheerio = require('cheerio');
var moment = require('moment');
var _ = require('lodash');

module.exports = function(cb) {
  var searhData = _.assign({}, this, {
    originStartDate: this['StartDate'],
    originEndDate: this['EndDate'],
    StartDate: moment(this['StartDate']).format('YYYYMMDD'),
    EndDate: moment(this['EndDate']).format('YYYYMMDD'),
  });
  var FormData = querystring.stringify({
    origin: searhData.Origin,
    destination: searhData.Destination,
    departureDate: searhData.StartDate,
    returnDate: searhData.EndDate,
    roundTrip: true,
    adults: 1,
    children: 0,
    infants: 0,
    promoCode: ""
  });

  // rejectUnauthorized: false
  // http://stackoverflow.com/questions/10888610/ignore-invalid-self-signed-ssl-certificate-in-node-js-with-https-request
  var Options = {
    R1: {
      hostname: 'm.flyscoot.com',
      path: '/search',
      method: 'POST',
      rejectUnauthorized: false,
      headers: {
        'Content-Type': "application/x-www-form-urlencoded",
        'Content-Length': FormData.length,
        'User-Agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36",
      }
    },
    R2: {
      hostname: 'm.flyscoot.com',
      path: '/select',
      method: 'GET',
      // rejectUnauthorized: false,
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cookie': "",
        'Accept-Language': "zh-TW,zh;q=0.8,en-US;q=0.6,en;q=0.4,ko;q=0.2,zh-CN;q=0.2",
        'Upgrade-Insecure-Requests': 1,
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36",
      }
    },
  };

  var FetchCookie = https.request(Options['R1'], function(res) {
    // console.log('STATUS: ' + res.statusCode);
    // console.log('HEADERS: ' + res.headers);
    var cookie = res.headers['set-cookie'][1] + ';' + res.headers['set-cookie'][0];
    Options['R2']['headers']['cookie'] = cookie;
    FetchData();
  });

  FetchCookie.write(FormData);
  FetchCookie.end();

  function FetchData() {
    var req = https.request(Options['R2'], function(res) {
      var body = '';
      // console.log('STATUS: ' + res.statusCode);
      // console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.on('data', function(chunk) {
        body += chunk;
      });

      res.on('end', function() {
        parse(body);
      });
    });
    req.end();
  }

  function parse(body) {
    var scootResult = {} ,
    startselector = '.selection-date-container[data-date="' + searhData.originStartDate + '"]';
    endselector = '.selection-date-container[data-date="' + searhData.originEndDate + '"]';
    $ = cheerio.load(body);

    $(startselector).find('span').each(function(i, elem) {
      if($(this).text() === '-'){
        scootResult['DeparturePrice'] = 'No Flights.';
      }else{
        scootResult['DeparturePrice'] = $(this).text().replace(/[^0-9]/g, "")+' NTD';
      }
    });
    $(endselector).find('span').each(function(i, elem) {
      if($(this).text() === '-'){
        scootResult['ReturnPrice'] = 'No Flights.';
      }else{
        scootResult['ReturnPrice'] = $(this).text().replace(/[^0-9]/g, "")+' NTD';
      }
    });

    cb.response(_.assign({}, {scoot: scootResult}));
  }
}
