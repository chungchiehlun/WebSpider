function fetchSrc(){
  var srcPrefix = '../bower_components/uikit/';
  return {
    js:{
      basic : srcPrefix + 'js/uikit.js',
      form : srcPrefix + 'js/components/form-select.js',
      datepicker : srcPrefix +'js/components/datepicker.js'
    },
    css:{
      basic : srcPrefix + 'css/uikit.css',
      gradient : srcPrefix + 'css/uikit.gradient.css',
      form : srcPrefix + 'css/components/form-select.css',
      datepicker : srcPrefix + 'css/components/datepicker.css'
    }
  }
}
module.exports = fetchSrc();
