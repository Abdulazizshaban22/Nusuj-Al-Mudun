import 'reflect-metadata';
import { createServer } from 'http';

const PORT = process.env.PORT || 4000;

const server = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, {'Content-Type':'application/json'});
    res.end(JSON.stringify({status:'ok', service:'api'}));
    return;
  }
  res.writeHead(200, {'Content-Type':'application/json'});
  res.end(JSON.stringify({message:'NASIJ API v4 placeholder'}));
});

server.listen(PORT, () => console.log('API on', PORT));