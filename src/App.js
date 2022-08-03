import logo from './logo.svg';
import './App.css';
import OrderbookDataHook from './OrderbookDataHook.js'
function App() {
  return (
    <div className="App">
      <OrderbookDataHook token="ethereum"/>
      <OrderbookDataHook token="bitcoin"/>
      <OrderbookDataHook token="solana"/> {/*TODO add inputs to this after datafetch*/}
    </div>
  );
}

export default App;