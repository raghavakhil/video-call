const http = require('http')
const fs = require('fs')
const app = require('./app')
const hostname = 'localhost';
const port = 3000;

http.createServer(function (req, res) {
    fs.readFile('./index.html', function (err, html) {
        if (err) {
            res.writeHead(404);
            res.write('Contents you are looking are Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(html);
        }
        res.end();
    })
})
app.listen(hostname, port)