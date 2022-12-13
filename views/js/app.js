"use strict";

const useState = React.useState;
const useEffect = React.useEffect;

function App() {
  const [concert, setConcert] = useState(null);
  useEffect(() => {
    fetch("/concert")
      .then((response) => response.json())
      .then((data) => {
        setConcert(data);
        console.log(concert);
      });
  }, []);

  return (
    <div className="App">
      <h1>{concert ? concert.event.name : "loading"}</h1>
    </div>
  );
}

const rootNode = document.getElementById("root");
const root = ReactDOM.createRoot(rootNode);
root.render(<App />);
