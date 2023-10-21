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
import {Line, getElementAtEvent, getDatasetAtEvent} from 'react-chartjs-2';
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
 * grid lines removed
 * zoom
 * draw vertical lines on canvas onclick + text box that tells you breakeven and tp
 * make the legend some important info and set redraw = true
 * 
 * find size of canvas w, h
 * calculate an array of positions of points [(w*, h*)] inside the canvas in pixels using the formulas
  
  * w* = n*(w/n)
  * h* = (n* (w/n))(n* (w/n))/16000

  * add a clickevent to the canvas that checks the click position against the positions recorded in the array
  * if((click_x >= w* - 5px && click_x <= w* = 5px) && (click_y >= h* - 5px && click_y <= h* + 5px))
 * 
 * ok so we already have the coordinates of the point clicked
 * 
 * want to, based on the element that was clicked, highlight where you are breakeven
 * 
 *
 * 
 * 
 */
//position tooltip up.
Tooltip.positioners.myCustomPositioner = function(elements, eventPos) {
  const tooltip = this;
  return {
    x: eventPos.x,
    y: eventPos.y - 30
  }
}
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
      tooltip: {
        position: 'myCustomPositioner',
      },
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
        text: 'Key Price / Number of Keys'
      },
    },
    };

  const labels = [];
  const fxvals = [];
  let n = 400;
  for(let i=0; i<=n; i++) {
    labels.push(i);
    fxvals.push(fcurve(i));
  };
  //console.log(labels);
  //console.log(fxvals);
  
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

  // const [count, setCount] = useState(0);
  // const updateCount = count + 1;

  let context, canvas;
  let relevant;
  const chartRef = useRef(null);
    //chart has a rendering context ctx and a canvas
  const clickE = (event) => {
    if(canvas.getContext) {
      context = canvas.getContext("2d");
      //console.log(context); //so... we have the canvasrenderingcontext2d but we can't call methods on it or what
      const pointClicked = getElementAtEvent(chartRef.current, event);
      const points = getDatasetAtEvent(chartRef.current, event);
      console.log(pointClicked);
      let clickI = pointClicked[0].index;
      let buySpend = fxvals[clickI]*1.1;
      let buyFee = fxvals[clickI]*0.1;

      for(let i = clickI; i < n; i++) {
        let sellFee = fxvals[i]*0.1;
        let sellReceive = 0.9*fxvals[i]
        if(sellReceive >= buySpend) {
          relevant = i;
          break;
        }
      }
      draw(canvas, context, pointClicked, relevant, points);
    }
  }
  const touchE = (e) => {
    e.preventDefault();
    e.target.onclick();
  }

  const draw = (cnv, ctx, point, index, pts) => {
    ctx.fillStyle = "rgb(10, 250, 200)";
    ctx.font = "16px sans-serif";
    console.log(pts[index].element);
    let xpos = pts[index].element.x;
    let ypos = pts[index].element.y;
    ctx.fillRect(xpos, ypos, 5, 50);
    ctx.fillStyle = "rgb(10, 10, 10)";
    ctx.fillText("Breakeven: " + pts[index].element.$context.parsed.y, xpos + 18, ypos + 18)
    ctx.fillText(pts[index].element.$context.parsed.x + " Keys", xpos + 18, ypos + 36)
  }
  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      canvas = chart.canvas;
      console.log('CanvasRenderingContext2D', chart.ctx);
      console.log('HTMLCanvasElement', chart.canvas);
    }
  }, [draw]);



  
  return (<div><Line ref={chartRef} options={options} data={chartData} onClick={clickE} onTouchStart={touchE} redraw={false}/></div> );
}

//x*x/16000 * 1 eth
function fcurve(x) {
  return ((x*x)/16000);
}

export default FTChart
