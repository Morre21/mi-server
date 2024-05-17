import https from 'node:https'
import fs from 'node:fs/promises'
import { uptime } from 'node:process'

const hostname = '127.0.0.1';
const port = 3000;


const server = https.createServer(async (req, res) => {
 // responde solo GET 
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'text/plain')
    res.end('metodo no permitido')
    return
  }

  let url = req.url
  // si el path del request es / /index /index.html debe devolver index.html
  if (url === '/' || url === '/index' || url === '/index.html') {
    url = '/index.html';
  }

  // evitar que se pueda hacer un request a requests.log
  if (url === '/requests.log') {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain')
    res.end('No permitido')
    return
  }

  try {
    const data = await fs.promises.readFile(`.${url}`, 'utf-8');
     // imprime la fecha y la ruta de la peticion en el request.log 
    fs.appendFile('/request.log',`${new Date().toISOString()} - ${url} \n`, error => {
    //mostrar un error por consola si requests.log no existe
      if (error) {
         console.log('Error de actualizacion de requests.log', error)}
    });
    res.statusCode = 200
    // si es extension html responder con el content-type correcto sino text/plain
    if (url.endsWith('.html')) {
    res.setHeader('Content-Type', 'text/html');
    } 
    else {
    res.setHeader('Content-Type', 'text/plain');
    }
  
    res.end(data, 'utf-8')
  }
  catch (error) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'text/html')
    res.end(error = await fs.promises.readFile('./error404.html'), 'utf-8');
      }
    }); 

server.listen({ port, hostname }, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
}) 