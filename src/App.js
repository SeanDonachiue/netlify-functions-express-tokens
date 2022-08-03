import logo from './logo.svg';
import './App.css';
import OrderbookDataHook from './OrderbookDataHook.js'
function App() {
  return (
    <div className="App">
      <OrderbookDataHook token="ethereum"/>
    </div>
  );
}

export default App;