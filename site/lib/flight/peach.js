var https = require('https');
var fs = require('fs');
var querystring = require('querystring');
var cheerio = require('cheerio');
var moment = require('moment');
var _ = require('lodash');


module.exports = function(cb) {
  var searhData = _.assign({}, this , {
    StartDate: moment(this['StartDate']).format('YYYYMMDD'),
    EndDate: moment(this['EndDate']).format('YYYYMMDD')
  });


  var FormData = JSON.stringify({
    "origin": searhData.Origin,
    "destination": searhData.Destination,
    "dateFrom": searhData.StartDate,
    "dateTo": searhData.EndDate,
    "iOneWay": false,
    "iFlightOnly": 0,
    "iAdult": 1,
    "iChild": 0,
    "iInfant": 0,
    "BoardingClass": "",
    "CurrencyCode": "TWD",
    "strPromoCode": "",
    "SearchType": "FARE",
    "iOther": 0,
    "otherType": "",
    "strIpAddress": ""
  });

  // rejectUnauthorized: false
  // http://stackoverflow.com/questions/10888610/ignore-invalid-self-signed-ssl-certificate-in-node-js-with-https-request
  var Options = {
    R1: {
      hostname: 'book.flypeach.com',
      path: '/',
      method: 'GET',
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Upgrade-Insecure-Requests': 1,
        'User-Agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36",
      }
    },
    R2: {
      hostname: 'book.flypeach.com',
      path: '/WebService/B2cService.asmx/GetAvailability',
      method: 'POST',
      rejectUnauthorized: false,
      headers: {
        'Content-Type': "application/json",
        'Content-Length': FormData.length,
        'Cookie': "",
        'User-Agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36",
      }
    },
  };

  var FetchCookie = https.request(Options.R1, function(res) {
    // console.log('STATUS: ' + res.statusCode);
    // console.log('HEADERS: ' + JSON.stringify(res.headers));
    var SessionId = res['headers']['set-cookie'][0].split(";")[0];
    Options['R2']['headers']['Cookie'] = SessionId + "; SERVERID=API003";

    res.on('data', function(chunk) {});
    res.on('end', function() {
      FetchData();
    });
  });

  FetchCookie.end();

  function FetchData() {
    var req = https.request(Options.R2, function(res) {
      var body = '';
      // console.log('STATUS: ' + res.statusCode);
      // console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        body += chunk;
      });

      res.on('end', function() {
        var html = JSON.parse(body);
        parse(html);
      });
    })
    req.write(FormData);
    req.end();
  }

  function parse(body) {
    var peachResult = {};
    $ = cheerio.load(body);

    peachResult['DeparturePrice'] = (function(){
      var price = $('label[for="optOutward1_1"]').text().replace(/[^0-9]/g, "");
      return ((price === 'Full') || (price === ''))?'No Tickets.':price.replace(/[^0-9]/g, "")+' NTD';
    })();

    peachResult['ReturnPrice'] = (function(){
      var price = $('label[for="optReturn1_1"]').text().replace(/[^0-9]/g, "");
      return ((price === 'Full') || (price === ''))?'No Tickets.':price.replace(/[^0-9]/g, "")+' NTD';
    })();

    cb.response(_.assign({}, {peach : peachResult}));
  }
}
