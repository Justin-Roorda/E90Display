/*
os = operating system
fs = file system
events = event management
http = network requests
express = light weight utility that helps with http communication between he client and the server
*/
require('dotenv').config();
var express = require('express');
var app = express();
var http = require('http');
var https = require('https');
var fs = require('fs');
var dt = require('./displayTime');
var directoryData;

console.log('running!');

var options = {
    host: 'sloan-data.mit.edu',
    path: '/_odata/STS.vw_E90DepartmentStaff',
    //authentication headers
    headers: {
        'Authorization': 'Basic ' + new Buffer.from(process.env.WEB_USER + ':' + process.env.WEB_PASS).toString('base64')
    }
  };

  function pullDataFromEndpoint() {
    https.get(options, function(response) {
      var body = '';
      response.on('data', function(chunk){
          body += chunk;
      });
      response.on('end', function() {
          directoryData = body;
      });
      response.on('error', function(e) {
          console.log("Got error: " + e.message);
       });
    }).end();
  }

  pullDataFromEndpoint();

  var port = process.env.PORT || 1337;
  http.createServer(function (req, res) {

    if (req.method === 'GET' && req.url === '/') {
 
     res.writeHead(200, { 'Content-Type': 'text/html' });
     fs.readFile('index.html', 'utf-8', function (error, content) {
       if (error) {
         res.end('something went wrong.');
         return;
       }
       res.end(content);
     });
   }

   if (req.method === 'GET' && req.url === '/app.js') {
     res.writeHead(200, { 'Content-Type': 'application/javascript' });
     script = fs.readFileSync("./app/app.js", "utf8");
     res.end(script);
   }

   if (req.method === 'GET' && req.url === '/directory.css') {
    res.writeHead(200, {"Content-Type": "text/css"});
    style = fs.readFileSync("./style/directory.css", "utf8");
    res.end(style);
  }

  if (req.method === 'GET' && req.url === '/officeLayout.svg') {
    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    svg = fs.readFileSync('./style/officeLayout.svg', 'utf8');
    res.end(svg, 'utf-8');
  }

  if (req.method === 'GET' && req.url === '/favicon.ico') {
    res.writeHead(200, { 'Content-Type': 'image/x-icon' });
    img = fs.readFileSync('./style/favicon.ico');
    res.end(img, 'binary');
  }

   if (req.method === 'GET' && req.url === '/data') {
    pullDataFromEndpoint();
     res.writeHead(200, { 'Content-Type': 'application/json' });
     res.end(JSON.stringify(directoryData), 'utf-8');
   }
 }).listen(port);

 console.log("Server running at http://localhost:%d", port);