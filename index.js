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
server.use(express.json());

/**
 *
 * @param {*} ticketOrder
 *
 * This function adds new data ticketOrder to a JSON file. It does this by reading
 * the data from the JSON file asynchronously, parsing it as a JSON object,
 * adding the new ticketOrder to the object, and then writing
 * the updated object back to the JSON file.
 */
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

function deleteDataFromJSON(ticketOrderIdToDelete) {
  // Read the JSON file
  fs.readFile(path.resolve(__dirname, "data.json"), (err, data) => {
    if (err) {
      // Handle the error
      console.log(err);
      return;
    }

    // Parse the JSON data
    const jsonData = JSON.parse(data);

    // Use the filter method to create a new array of orders
    // that does not include the order with the specified orderId
    const updatedOrders = jsonData.orders.filter(
      (order) => order.orderId !== ticketOrderIdToDelete
    );

    // Overwrite the existing orders with the updated orders
    jsonData.orders = updatedOrders;

    // Write the updated data back to the file
    fs.writeFile("data.json", JSON.stringify(jsonData), (err) => {
      if (err) {
        // Handle the error
        console.log(err);
        return;
      }

      // The data has been successfully updated
    });
  });
}

server.get("/", (req, res) => {
  // sendfile from views folder
  res.sendFile(__dirname + "/views/index.html");
});

server.get("/concert", (req, res) => {
  // read json data asynchronously
  fs.readFile(path.resolve(__dirname, "ticket.json"), (err, data) => {
    if (err) {
      // handle the error
      console.log(err);
    } else {
      // parse the JSON data
      let jsonData = JSON.parse(data);
      // send the JSON data back to the client
      res.json(jsonData);
    }
  });
});

server.get("/tickets", (req, res) => {
  // read json data asynchronously
  fs.readFile(path.resolve(__dirname, "data.json"), (err, data) => {
    if (err) {
      // handle the error
      console.log(err);
    } else {
      // parse the JSON data
      let jsonData = JSON.parse(data);
      // send the JSON data back to the client
      res.json(jsonData);
    }
  });
});

server.post("/addTicket", (req, res) => {
  //get json data from request body
  const ticketOrder = req.body;
  // add the new data to the JSON file
  addDataToJSON(ticketOrder);
  res.redirect("back");
});

server.post("/deleteTicket", (req, res) => {
  // get delete id from request body
  const ticketOrderIdToDelete = req.body.orderId;
  deleteDataFromJSON(ticketOrderIdToDelete);
  res.redirect("back");
});

// start the server
server.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
