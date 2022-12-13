"use strict";

function App() {
  return (
    <div className="App">
      <h1>Concert of the Century</h1>
    </div>
  );
}

const rootNode = document.getElementById("root");
const root = ReactDOM.createRoot(rootNode);
root.render(<App />);
