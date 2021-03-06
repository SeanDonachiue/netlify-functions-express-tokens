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
const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Aggregated Orderbook Depth ($)'
    },
  },
};

//if you pass as input it seems you need new vars? no. just make a few and pass input to each
function OrderbookDataHook(token) {
	const [data, setData] = useState([{}]);

	const [timestamps, setTimestamps] = useState([]);
	const [obup, setObUp] = useState([]);
	const [obdown, setObDown] = useState([]);
	const [volume, setVolume] = useState([]);

	const [isFetching, setIsFetching] = useState(true);

	//maybe need to structure a new object for this
	
	//when the second param has a value changed, react calls useEffects again. this seems to be a bad pattern.
	useEffect(() => {
		fetchOBData(token);
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
						let month = currDate.getMonth() + 1;
						newtimestamps.push(currDate.getHours() + ":" + currDate.getMinutes() + "-" + currDate.getDate() + "-" + month + "-" + currDate.getFullYear())
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