var https = require('https');
var fs = require('fs');
var querystring = require('querystring');
var cheerio = require('cheerio');
var moment = require('moment');
var _ = require('lodash');

module.exports = function(cb) {
  var searhData = _.assign({}, this, {
    oriDepartureDate: moment(this['StartDate']).format('YYYY-MM-DD'),
    oriReturnDate: moment(this['EndDate']).format('YYYY-MM-DD'),
    DepartureDate: moment(this['StartDate']).format('DD MMM YYYY'),
    ReturnDate: moment(this['EndDate']).format('DD MMM YYYY'),
    Day1: moment(this['StartDate']).format('DD'),
    Day2: moment(this['EndDate']).format('DD'),
    Month1: moment(this['StartDate']).format('YYYY-MM'),
    Month2: moment(this['EndDate']).format('YYYY-MM'),
  });

  var postData = querystring.stringify({
    MarketStructure: "RoundTrip",
    selOrigin: searhData['Origin'],
    selDest: searhData['Destination'],
    TripKind: "return",
    Origin: searhData['Origin'],
    Destination: searhData['Destination'],
    DepartureDate: searhData['DepartureDate'],
    ReturnDate: searhData['ReturnDate'],
    AdultCount: 1,
    ChildCount: 0,
    InfantCount: 0,
    PromoCode: "",
    ControlGroupSearchView$AvailabilitySearchInputSearchView$DropDownListMarketDateRange1: "1|1",
    ControlGroupSearchView$AvailabilitySearchInputSearchView$DropDownListMarketDateRange2: "1|1",
    ControlGroupSearchView$AvailabilitySearchInputSearchView$DropDownListMarketDay1: searhData['Day1'],
    ControlGroupSearchView$AvailabilitySearchInputSearchView$DropDownListMarketDay2: searhData['Day2'],
    ControlGroupSearchView$AvailabilitySearchInputSearchView$DropDownListMarketMonth1: searhData['Month1'],
    ControlGroupSearchView$AvailabilitySearchInputSearchView$DropDownListMarketMonth2: searhData['Month2'],
    ControlGroupSearchView$AvailabilitySearchInputSearchView$DropDownListPassengerType_ADT: 1,
    ControlGroupSearchView$AvailabilitySearchInputSearchView$DropDownListPassengerType_CHD: 0,
    ControlGroupSearchView$AvailabilitySearchInputSearchView$DropDownListPassengerType_INFANT: 0,
    ControlGroupSearchView$AvailabilitySearchInputSearchView$RadioButtonMarketStructure: "RoundTrip",
    ControlGroupSearchView$AvailabilitySearchInputSearchView$TextBoxMarketDestination1: searhData['Destination'],
    ControlGroupSearchView$AvailabilitySearchInputSearchView$TextBoxMarketDestination2: "",
    ControlGroupSearchView$AvailabilitySearchInputSearchView$TextBoxMarketOrigin1: searhData['Origin'],
    ControlGroupSearchView$AvailabilitySearchInputSearchView$TextBoxMarketOrigin2: "",
    ControlGroupSearchView$ButtonSubmit: "Get Flights",
    ControlGroupSearchView_AvailabilitySearchInputSearchViewdestinationStation1: searhData['Destination'],
    ControlGroupSearchView_AvailabilitySearchInputSearchViewdestinationStation2: "",
    ControlGroupSearchView_AvailabilitySearchInputSearchVieworiginStation1: searhData['Origin'],
    ControlGroupSearchView_AvailabilitySearchInputSearchVieworiginStation2: "",
    ControlGroupSearchView$AvailabilitySearchInputSearchView$HIDDENPROMOCODE: "",
    ControlGroupSearchView$AvailabilitySearchInputSearchView$HiddenFieldExternalRateId: "",
    __EVENTARGUMENT: "",
    __EVENTTARGET: "",
    __VIEWSTATE: "/wEPDwUBMGRk7p3dDtvn3PMYYJ9u4RznKUiVx98=",
    date_picker: [searhData['DepartureDate'], searhData['ReturnDate']],
    hiddendAdultSelection: 1,
    hiddendChildSelection: 0,
    pageToken: "",
  });

  var Options = {
    R1: {
      hostname: 'booking.tigerair.com',
      path: '/Search.aspx',
      method: 'POST',
      headers: {
        'Content-Type': "application/x-www-form-urlencoded",
        'Content-Length': postData.length,
        'User-Agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36",
      }
    },
    R2: {
      hostname: 'booking.tigerair.com',
      path: '/SelectFlights.aspx',
      method: 'POST',
      headers: {
        'Content-Type': "application/x-www-form-urlencoded",
        'Content-Length': 0,
        'Cookie': '',
        'User-Agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.85 Safari/537.36",
      }
    }
  };

  var FetchCookie = https.request(Options.R1, function(res) {
    // console.log('STATUS: ' + res.statusCode);
    // console.log('HEADERS: ' + JSON.stringify(res.headers));

    Options['R2']['headers']['Cookie'] = res['headers']['set-cookie'][0];

    res.on('data', function(chunk) {});
    res.on('end', function() {
      FetchData();
    });
  });
  FetchCookie.write(postData);
  FetchCookie.end();

  function FetchData() {
    var req = https.request(Options.R2, function(res) {
      // console.log('STATUS: ' + res.statusCode);
      // console.log('HEADERS: ' + JSON.stringify(res.headers));
      var body = '';
      res.on('data', function(chunk) {
        body += chunk;
      });
      res.on('end', function() {
        // fs.writeFile('craw.html', body, function(err) {
        //   if (err) return console.log(err);
        // });
        parse(body);
      });
    });
    // req.write("");
    req.end();
  }

  function parse(body) {
    $ = cheerio.load(body);
    var tigerResult = function() {
      var arr = [searhData.oriDepartureDate, searhData.oriReturnDate].map(function(elem, i) {
        var price = '';
        $("#lfMarket" + (i+1)).find('[data-date="' + elem + '"]').each(function(i , elem){
          price = $(this).find('span').text().replace(/[^0-9]/g, "")+' NTD';
        });

        return price;
        // return $('[data-date="' + elem + '"]').find('span').text();
      });
      return {
        DeparturePrice: arr[0],
        ReturnPrice: arr[1]
      }
    };

    cb.response(_.assign({}, {tiger : tigerResult()}));
  }


}
