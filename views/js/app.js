"use strict";

const useState = React.useState;
const useEffect = React.useEffect;

function generateOrderId() {
  // Generate a random number between 100000 and 999999
  let orderId = Math.floor(Math.random() * 900000) + 100000;

  // Convert the number to a string
  orderId = orderId.toString();

  // Keep only the first 6 digits
  orderId = orderId.substring(0, 6);

  return orderId;
}

function App() {
  const [concert, setConcert] = useState(null);
  const [ticketType, setTicketType] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [update, setUpdate] = useState(false);

  // Use the useState hook to create a new state variable for the disabled state of the submit button
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    fetch("/concert")
      .then((response) => response.json())
      .then((data) => {
        setConcert(data);
      });
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    const tickets = [];
    let id = generateOrderId();

    if (!ticketType) {
      tickets.push({
        type: concert.ticketTypes[0].type,
        price: concert.ticketTypes[0].price,
        quantity: quantity,
      });
    } else {
      tickets.push({
        type: ticketType.order.split(":")[0],
        price: ticketType.order.split(":")[1],
        quantity: quantity,
      });
    }

    const ticketOrder = {
      orderId: id,
      orderer: {
        name,
      },
      tickets,
      totalCost: ticketType
        ? quantity * ticketType.order.split(":")[1]
        : quantity * concert.ticketTypes[0].price,
    };

    // Send the data to the server using the fetch API
    fetch("/addTicket", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ticketOrder),
    })
      .then(() => {
        setUpdate(!update);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="d-grid gap-3">
      <div className="container">
        <div className="card">
          <img
            src="https://unsplash.com/photos/8XLapfNMW04/download?ixid=MnwxMjA3fDB8MXxzZWFyY2h8N3x8Y29uY2VydCUyMHN0YWRpdW18ZW58MHx8fHwxNjcxMDAyMTM5&force=true&w=1920"
            className="card-img-top"
            alt="stadium concert hall"
          />
          <div className="card-body">
            <div className="text-start">
              <h1>{concert ? concert.event.name : "loading"}</h1>
              <p className="h4">
                {concert ? concert.event.location : "loading"}
              </p>
              <p className="h6">{concert ? concert.event.date : "loading"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <h4>Order Tickets</h4>
        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Ticket</label>
                <TicketSelect
                  ticketTypes={concert ? concert.ticketTypes : []}
                  onChange={(event) => {
                    setTicketType({
                      order: event.target.value,
                    });
                  }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  className="form-control"
                  pattern="[0-9]+" // only allow numbers
                  value={quantity}
                  max="50"
                  onChange={(event) => {
                    if (event.target.value > 50) {
                      setQuantity(50);
                    } else if (event.target.value < 1) {
                      setQuantity(1);
                    } else {
                      setQuantity(event.target.value);
                    }
                  }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  maxLength="45"
                  className="form-control"
                  onChange={(event) => {
                    setName(event.target.value);
                    setIsDisabled(event.target.value === "");
                  }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={isDisabled}
              >
                Save
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container">
        <h4>Order History</h4>
        <TicketTable update={update} />
      </div>
    </div>
  );
}

function TicketSelect(props) {
  const ticketTypes = props.ticketTypes;
  const onChangeHandler = props.onChange;

  return (
    <select className="form-select" onChange={onChangeHandler}>
      {ticketTypes.map((ticketType) => (
        <option
          key={ticketType.id}
          value={`${ticketType.type}:${ticketType.price}`}
        >
          {ticketType.type} - ${ticketType.price}
        </option>
      ))}
    </select>
  );
}

function TicketTable(props) {
  const { update } = props;
  const [tableData, setTableData] = useState([]);
  const [internalUpdate, setInternalUpdate] = useState(false);

  // Use useEffect() hook to retrieve table data from an API
  useEffect(() => {
    fetch("/tickets")
      .then((response) => response.json())
      .then((data) => {
        setTableData(data.orders);
      });
  }, [update, internalUpdate]);

  function onClickHandler(event, row) {
    event.preventDefault();

    const dataId = row.orderId;

    // send id to server for deletion using fetch API
    fetch("/deleteTicket", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderId: dataId }),
    })
      .then(() => {
        setInternalUpdate(!internalUpdate);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <table className="table table-hover table-bordered">
      <thead>
        <tr>
          <th>#</th>
          <th>Name</th>
          <th>Ticket</th>
          <th>Total Cost</th>
          <th>Order ID</th>
          <th className="text-center">🗑️</th>
        </tr>
      </thead>
      <tbody>
        {tableData.map((row, index) => (
          <tr key={index}>
            <td>{index + 1}</td>
            <td>{row.orderer.name}</td>
            <td>
              {row.tickets[0].quantity} {row.tickets[0].type}
            </td>
            <td>${row.totalCost.toFixed(2)}</td>
            <td>{row.orderId}</td>
            <td className="text-center">
              <button
                type="button"
                className="btn btn-lg btn-danger btn-sm"
                onClick={(event) => onClickHandler(event, row)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const rootNode = document.getElementById("root");
const root = ReactDOM.createRoot(rootNode);
root.render(<App />);
