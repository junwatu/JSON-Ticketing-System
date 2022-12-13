import * as url from "url";
import express from "express";
import fs from "fs";
import path from "path";

const PORT = process.env.PORT || 5115;

/**
 * __dirname is the path to the current directory
 * source:
 * https://blog.logrocket.com/alternatives-dirname-node-js-es-modules/
 */
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const server = express();
server.use(express.static(__dirname + "/views"));

function addDataToJSON(ticketOrder) {
  // read json data asynchronously
  fs.readFile(path.resolve(__dirname, "data.json"), (err, data) => {
    if (err) {
      // handle the error
      console.log(err);
    } else {
      // parse the JSON data
      let jsonData = JSON.parse(data);
      // add the new data to the JSON object
      jsonData.orders.push(ticketOrder);
      // write the JSON data back to the file
      fs.writeFile(
        path.resolve(__dirname, "data.json"),
        JSON.stringify(jsonData),
        (err) => {
          if (err) {
            // handle the error
            console.log(err);
          } else {
            // data has been written successfully
          }
        }
      );
    }
  });
}

server.get("/", (req, res) => {
  // sendfile from views folder
  res.sendFile(__dirname + "/views/index.html");
});

const ticketOrder = {
  orderId: "321",
  event: {
    name: "Concert of the Century",
    location: "Stadium",
    date: "2022-12-31",
  },
  orderer: {
    firstName: "Michele",
    lastName: "Hannah",
    email: "mhann@gmail.com",
  },
  tickets: [
    {
      type: "VIP",
      price: 199.99,
      quantity: 10,
    },
    {
      type: "Early Bird",
      price: 99.99,
      quantity: 1,
    },
  ],
};

server.get("/addTicket", (req, res) => {
  addDataToJSON(ticketOrder);
  res.end();
});

// start the server
server.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
