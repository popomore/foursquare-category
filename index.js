var fs = require('fs');
var https = require('https');
var util = require('util');

var token = fs.readFileSync('token').toString().trim();
var url = util.format('https://api.foursquare.com/v2/venues/categories?oauth_token=%s&v=20140323', token);
request(url, function(err, data) {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  console.log('request success');
  data = parse(data);
  fs.writeFileSync('data.json', data);
});

function parse(data) {
  var origin = readData();
  data = JSON.parse(data);

  function next(curr, prev) {
    return curr.map(function(item, index) {
      var item_ = prev[index] || {};
      if (!item_['name_cn']) {
        item_['name_cn'] = '';
        console.log(item.name + ' is not translated.');
      }

      return {
        name: item.name,
        name_cn: item_['name_cn'],
        categories: next(item.categories || [], item_.categories || [])
      };
    });
  }

  data = next(data.response.categories, origin || []);
  return JSON.stringify(data, null, 2);
}

function request(url, cb) {
  https.get(url, function(res) {

    if (res.statusCode !== 200) {
      cb(res.statusCode);
      return;
    }

    var data = '';
    res.on('data', function(thunk) {
      data += thunk;
    });

    res.on('end', function() {
      cb(null, data);
    });
  }).on('error', function(e) {
    cb(e);
  });
}

function readData() {
  if (fs.existsSync('data.json')) {
    var data = fs.readFileSync('data.json');
    return JSON.parse(data);
  }
}
