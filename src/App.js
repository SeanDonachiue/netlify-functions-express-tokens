import logo from './logo.svg';
import './App.css';
import OrderbookDataHook from './OrderbookDataHook.js';
import OrderbookDepthChart from './OrderbookDepthChart.js';
import React, {useState} from 'react';
import FTChart from './FTChart.js';


function App() {
  return (
    <div className="App">
      <FTChart id="69"/>
      <OrderbookDepthChart token="ethereum" id="1"/> {/*need to handle visibility out here instead, potentially also toggle groups would make sense.*/}
      <OrderbookDepthChart token="bitcoin" id="2"/>
    </div>
  );
}

export default App;