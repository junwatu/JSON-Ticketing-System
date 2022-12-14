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
    }).catch((err) => {
      console.log(err);
    });
  };

  return (
    <>
      <div className="text-start">
        <h1>{concert ? concert.event.name : "loading"}</h1>
        <p className="h4">{concert ? concert.event.location : "loading"}</p>
        <p className="h6">{concert ? concert.event.date : "loading"}</p>
      </div>
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

        <button type="submit" className="btn btn-primary" disabled={isDisabled}>
          Save
        </button>
      </form>
    </>
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

const rootNode = document.getElementById("root");
const root = ReactDOM.createRoot(rootNode);
root.render(<App />);
