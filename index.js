'use strict';

var cors = require('cors');
var express = require('express');
var request = require('request');
var path = require('path');

var civic = 'https://www.googleapis.com/civicinfo/v2';
var location = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
var place = 'https://maps.googleapis.com/maps/api/place/details/json';
var photo = 'https://maps.googleapis.com/maps/api/place/photo';
var geolocation = 'https://maps.googleapis.com/maps/api/geocode/json';
var key = process.env.GOOGLE_KEY;

// Express App
var app = express();

// Enable CORS
app.use(cors());

app.set('port', (process.env.PORT || 5000));

var router = express.Router();

// Endpoint to load places
router.get('/civic/places', function(req, res) {
  if (req.query.location && req.query.type) {

    // VALIDATE TYPE AND LOCATION

    // Types: city_hall|courthouse|fire_station|hospital|library|local_government_office|museum|park|police|post_office
    // Query: city hall|courthouse|fire station|hospital|library|museum|park|police|post office

    var params = [];
    if (req.query.token) {
      params.push('pagetoken=' + req.query.token);
    } else {
      params.push('type=' + req.query.type);
      params.push('query=');
      params.push('location=' + req.query.location);
      params.push('radius=100000');
    }
    params.push('key=' + key);

    request.get(location + '?' + params.join('&'), {json: true}, function(err, response, body) {
      res.status(response.statusCode).send(body);
    });
  } else {
    res.status(400).send({message: 'The request requires a location. Try adding "?location={lat},{lng}" to the request.'});
  }
});

// Endpoint to load places
router.get('/civic/photo', function(req, res) {
  if (req.query.photo_id) {
    var width = req.query.width || 320;
    var height = req.query.height || 480;
    req.pipe(
      request.get(photo + '?photoreference=' + req.query.photo_id + '&maxwidth=' + width + '&maxheight=' + height + '&key=' + key)
    ).pipe(res);
  } else {
    res.status(400).send({message: 'The request requires a place_id. Try adding "?place_id={place_id}" to the request.'});
  }
});

// Endpoint to load photos
router.get('/civic/place', function(req, res) {
  if (req.query.place_id) {
    request.get(place + '?placeid=' + req.query.place_id + '&key=' + key, {json: true}, function(err, response, body) {
      res.status(response.statusCode).send(body);
    });
  } else {
    res.status(400).send({message: 'The request requires a place_id. Try adding "?place_id={place_id}" to the request.'});
  }
});

// Endpoint to load geolocation
router.get('/civic/geolocation', function(req, res) {
  if (req.query.address) {
    request.get(geolocation + '?address=' + req.query.address + '&key=' + key, {json: true}, function(err, response, body) {
      res.status(response.statusCode).send(body);
    });
  } else {
    res.status(400).send({message: 'The request requires a zipcode. Try adding "?zipcode=12345" to the request.'});
  }
});

router.get('/', function(req, res) {
  res.status(200).send('Sample APIs. See <a href="https://github.com/gnomeontherun/sample-apis#readme">https://github.com/gnomeontherun/sample-apis#readme</a> for details.');
});

app.use('/', router);

app.listen(app.get('port'), function() {
  console.log('App is running on port ', app.get('port'));
});
