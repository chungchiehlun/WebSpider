// var async = require('async');
var peach = require('./flight/peach.js');
var vanillar = require('./flight/vanillar.js');
var scoot = require('./flight/scoot.js');
var tiger = require('./flight/tiger.js');
var moment = require('moment');
var _ = require('lodash');

module.exports  = function(data , res){

  var inputData = {
      StartDate: moment(data['depDate'] , 'YYYY.MM.DD').format('YYYY-MM-DD'),
      EndDate: moment(data['retDate'] , 'YYYY.MM.DD').format('YYYY-MM-DD'),
      Origin: 'KHH',
      Destination: data.des
  }
  var json = {};
  var line = (inputData.Destination === 'KIX')?[peach,scoot,tiger]:[vanillar,tiger];

  var cb = {
    output: {},
    count: 0,
    response: function(result) {
      json = _.assign(json , result);
      this.count += 1;
      if (this.count == line.length) {
        res.status(200).json(json);
      }
    }
  };
  line.forEach(function(elem, index, arr) {
    elem.call(inputData, cb);
  });

}
