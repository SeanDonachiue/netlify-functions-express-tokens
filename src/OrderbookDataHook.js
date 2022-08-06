import React, {useEffect, useState} from 'react';
import axios from "axios";
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
import {Line} from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
const Months = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
	];
//if you pass as input it seems you need new vars? no. just make a few and pass input to each
function OrderbookDataHook(props) {
	const [data, setData] = useState([{}]);

	const [timestamps, setTimestamps] = useState([]);
	const [obup, setObUp] = useState([]);
	const [obdown, setObDown] = useState([]);
	const [volume, setVolume] = useState([]);

	const [isFetching, setIsFetching] = useState(true);

	//maybe need to structure a new object for this
	
	//when the second param has a value changed, react calls useEffects again. this seems to be a bad pattern.
	useEffect(() => {
		fetchOBData(props.token);
	}, []);

	//todo switch URL on production environment via input or get all three


	const fetchOBData = (token) => {
				axios({
					method: 'get',
					url: "https://master--globaltokenbook.netlify.app/.netlify/functions/aggtokenusd",
					params: {token : token},
					responseType: 'json',
					timeout: '10000'
				})
				.then(res => {
					let aggArray = res.data;
					let newtimestamps = [];
					let newobup = []; 
					let newobdown = [];
					let newvolume = [];
					for(let i = 0; i < aggArray.length; i++) {
						//breaks the chart i guess
						let currDate = new Date(aggArray[i].stamp);
						let month = currDate.getMonth();

						newtimestamps.push(currDate.getDate() + "-" + Months[month] + "-" + currDate.getFullYear().substring(2,3) + "-" + currDate.getHours() + ":" + currDate.getMinutes())
						newobup.push(aggArray[i].obup);
						newobdown.push(aggArray[i].obdown); //probably strings rather than numbers
						newvolume.push(aggArray[i].volume);
					}
				//data returns an array of objects pretty sure
				//aggArray is an array of json objects with fields
				/*
					token,
					stamp,
					price,
					obup,
					obdown,
					volume
				*/
				//override every element of data with the elements of aggArray
					setData([...data, ...aggArray]);
					setObUp([...obup, ...newobup]);
					setObDown([...obdown, ...newobdown]);
					setVolume([...volume, ...newvolume]);
					setTimestamps([...timestamps, ...newtimestamps]);
					setIsFetching(false);	
				})
				.catch(err => {
					console.log(err);
					//leave the data the same but still "update" state to rerender
					setData(data);
					setIsFetching(false);
				});
		}
	console.log("OBUP:" + obup)
	console.log("OBDOWN:" + obdown)
	const options = {
  		responsive: true,
  		plugins: {
    		legend: {
      		position: 'top',
    		},
    		title: {
     		 	display: true,
      		text: props.token.charAt(0).toUpperCase() + props.token.substring(1, props.token.length-1) + ' Orderbook Depth vs Time'
    		},
  		},
  		scales: {
  			y: {
  				title: {
  					text: 'Aggregated ±2% Orderbook Depth ($)'
  				}
  			}
  		}
		};
	const labels = timestamps;
	const chartData = {
    labels,
    datasets: [
      {
        label: 'Ask',
        data: obup,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Bid',
        data: obdown,
        borderColor: 'rgb(53, 235, 162)',
        backgroundColor: 'rgba(53, 235, 162, 0.5)',
      },
    ],
  };
  return (isFetching ? <p>fetching data</p> : <Line options={options} data = {chartData} />);
}

export default OrderbookDataHook