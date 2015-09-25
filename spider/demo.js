var https = require('https');
var fs = require('fs');
var querystring = require('querystring');
var cheerio = require('cheerio');

var FormData = querystring.stringify({
  guid: "",
  screenId: "BKG001",
  agencyId: "",
  agencyManagername: "",
  happyHourChannel: "",
  _eventId: "proceed",
  locales: "en_US",
  wvm: "WVMD",
  tripType: "RT",
  origin: "KHH",
  destination: "NRT",
  travelDate: ["14-Oct-2015", "21-Dec-2015"],
  adults: 1,
  children: 0,
  infants: 0,
  promoCode: "",
  tmpCabinClass: "Economy",
  cabinClass: "ECONOMY",
  channel: "PB"
});


var Options = {
  R1: {
    hostname: 'www.vanilla-air.com',
    path: '/reservation/ibe/ibe/booking',
    method: 'GET',
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Upgrade-Insecure-Requests': 1,
      'User-Agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36",
    }
  },
  R2: {
    hostname: 'www.vanilla-air.com',
    path: '/reservation/ibe/ibe/booking;jsessionid=',
    method: 'POST',
    headers: {
      'Content-Type': "application/x-www-form-urlencoded",
      'Content-Length': FormData.length,
      'Cookie': "",
      'Upgrade-Insecure-Requests': 1,
      'User-Agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36",
    }
  },
};

// Fetch cookie
var FetchCookie = https.request(Options['R1'], function(res) {
  // console.log('STATUS: ' + res.statusCode);
  // console.log('HEADERS: ' + JSON.stringify(res.headers));

  var cookie = res['headers']['set-cookie'][0] + ';' + res['headers']['set-cookie'][1];

  var JSESSIONID = res['headers']['set-cookie'][1].split(";")[0];
  var queryString = JSESSIONID.split("=")[1] + "?execution=e1s1&locale=en_US&llt=&agentId=";

  Options['R2']['headers']['Cookie'] = JSESSIONID;
  Options['R2']['path'] += queryString;

  res.on('data', function(chunk) {

  });
  res.on('end', function() {
    POSTRequest();
  });
});

FetchCookie.end();

function POSTRequest() {
  var req = https.request(Options['R2'], function(res) {
    var body = '';
    // console.log('STATUS: ' + res.statusCode);
    // console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      body += chunk;
    });

    res.on('end', function() {
      fs.writeFile('craw.html', body, function(err) {
        if (err) return console.log(err);
      });
      parse(body);
    });
  })
  req.write(FormData);
  req.end();
}

function parse(body) {
  $ = cheerio.load(body);
  var DeparturePrice = $('#col_0_' + '14-Oct-2015').find('.lbl_bld').text().replace(/[^0-9]/g, "");
  var ReturnPrice = $('#col_1_' + '21-Dec-2015').find('.lbl_bld').text().replace(/[^0-9]/g, "");

  console.log('查詢日期：' , '14-Oct-2015');
  console.log('回程日期：' , '21-Dec-2015');
  console.log('去程票價：' , DeparturePrice);
  console.log('回程票價：' , ReturnPrice);
}
