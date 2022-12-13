import * as url from 'url';
import express, { application } from "express";

const PORT = 5115;

/**
 * __dirname is the path to the current directory
 * source:
 * https://blog.logrocket.com/alternatives-dirname-node-js-es-modules/
 */
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const server = express();
server.use(express.static(__dirname + "/views"));

server.get("/", (req, res) => {
   // sendfile from views folder
   res.sendFile(__dirname + "/views/index.html");
})

server.listen(PORT, () => {
	console.log(`server running on port ${PORT}`)
})