import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom';
import {Line} from 'react-chartjs-2';
import React, {useLayoutEffect, useRef, useEffect, useState} from 'react';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    zoomPlugin,
  );
/** TODOS
 * y axis tick size
 * grid lines removed
 * zoom
 * draw vertical lines on canvas onclick + text box that tells you breakeven and tp
 * make the legend some important info and set redraw = true
 * 
 * 
 */
function FTChart(props) {
  let options = {
    responsive: true,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        ticks: {
          callback: function(value, index, ticks) {
            return value + "E"
          }
        },
      },
    },
    plugins: {
      zoom: {
        limits: {
          x:{min: 'original', max: 'original'},
          y:{min: 'original', max: 'original'}
        },
        pan: {
          enabled: true,
          mode: 'xy',
        },
        zoom: {
          wheel: {
            enabled: true,
            modifierKey:'ctrl',
          },
          pinch: {
            enabled: true,
          },
        },
        mode: 'xy',
      },
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Friend Room Key Price / Number of Keys'
      },
    },
    };
  const labels = [];
  const fxvals = [];
  for(let i=0; i<=400; i++) {
    labels.push(i);
    fxvals.push(fcurve(i));
  };
  console.log(labels);
  console.log(fxvals);
  
  const chartData = {
    
    labels,
    datasets: [
    {
      fill: true,
      label: 'Price (ETH)',
      data: fxvals,
      borderColor: 'rgb(145, 145, 230)',
      backgroundColor: 'rgba(145, 145, 230, 0.3)',
    }
    ]
  };
  return (<div><Line options={options} data={chartData} /></div> );
}

//x*x/16000 * 1 eth
function fcurve(x) {
  return ((x*x)/16000);
}

export default FTChart
