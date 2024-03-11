var http = require('http');
var fs = require('fs');
var path = require('path');

http.createServer(function (request, response) {
  console.log('Request received:', request.url);

  // Handle path normalization and potential directory traversal issues
  var filePath = path.normalize('.' + request.url);
  if (filePath.startsWith('../') || filePath.indexOf('\\') !== -1) {
    response.writeHead(403, { 'Content-Type': 'text/plain' });
    response.end('Forbidden: Access to files outside the current directory is denied.\n');
    return;
  }

  var extname = String(path.extname(filePath)).toLowerCase();
  var contentType = 'text/html';
  var mimeTypes = {
    'html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4', // Corrected content type for MP4 videos
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.svg': 'image/svg+xml',
  };
  contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, function (error, content) {
    if (error) {
      if (error.code === 'ENOENT') {
        fs.readFile('./404.html', function (error, content) {
          if (error) {
            response.writeHead(500);
            response.end('Internal Server Error: ' + error.code + '\n');
          } else {
            response.writeHead(404, { 'Content-Type': 'text/html' });
            response.end(content, 'utf-8');
          }
        });
      } else {
        response.writeHead(500);
        response.end('Internal Server Error: ' + error.code + '\n');
      }
    } else {
      response.writeHead(200, { 'Content-Type': contentType });
      response.end(content, 'utf-8');
    }
  });
}).listen(3000);

console.log('Server running at http://192.168.1.25:3000/');
