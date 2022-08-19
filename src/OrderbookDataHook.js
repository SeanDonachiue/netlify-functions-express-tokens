import React, {useLayoutEffect, useRef, useEffect, useState} from 'react';
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
import zoomPlugin from 'chartjs-plugin-zoom';
import {Line} from 'react-chartjs-2';


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

//if you pass as input it seems you need new vars? no. just make a few and pass input to each
function OrderbookDataHook(props) {
	let options = {
  	responsive: true,
  	scales: {
  		x: {
  		},
  		y: {
  			ticks: {
  				callback: function(value, index, ticks) {
  					return "$" + value / 1000000 + "M"
  				}
  			},
  		}
  	},
  	plugins: {
  		
  		zoom: {
  			limits: {
  				x: {min: 'original', max: 'original'},
  				y: {min: 'original', max: 'original'},
  			},
  			pan: {
  				enabled: true,
  				mode: 'xy',
  			},
  			zoom: {
  				wheel: {
  					enabled: true,
  					modifierKey: 'ctrl',
  				},
  				pinch: {
  					enabled: true,
  				},
  			},
  			mode: 'xy',
  		},
    	legend: {
      	position: 'top',
    	},
    	title: {
      	display: true,
      	text: '±2% Aggregated Orderbook Depth'
    	},
  	},
	};
	options.plugins.title.text = props.token.substring(0,1).toUpperCase() + props.token.substring(1, props.token.length) + " ±2% Aggregated Orderbook Depth";
	const [data, setData] = useState([{}]);
	const [timestamps, setTimestamps] = useState([]);
	const [obup, setObUp] = useState([]);
	const [obdown, setObDown] = useState([]);
	//const [volume, setVolume] = useState([]);

	const [isFetching, setIsFetching] = useState(true);
	const[isAll, setIsAll] = useState(props.isAllData);
	//maybe need to structure a new object for this
	
	//when the second param has a value changed, react calls useEffects again. this seems to be a bad pattern.
	const mounted = useRef();
	useEffect(() => {
		
		//component did mount logic
		if(!mounted.current) {
			mounted.current = true;
			fetchOBData(props.token);
		}
		//component did update logic
		else {
				handleOBData();
		}		
	}, [data]);
	
	useEffect(()=> {
		if(mounted.current) {
			handleOBData();
		}
	},[isAll])
	useLayoutEffect(() => {
		let foo = props.isAllData;
		setIsAll(foo);
	}, [props.isAllData])

	const handleOBData = async () => {
		data.shift();
		let aggArray = data;
		let newtimestamps = [];
		let newobup = []; 
		let newobdown = [];
		let newvolume = [];
		let j = 1;
		let k = 2;
		let lookbackStart = 0;

		//lookback period set here because we are setting state vars for the chart content
		if(!isAll) lookbackStart = aggArray.length - 144;
		//want to also take the 6ma of everything here or have a flag for that etc
		//pass a param for MAs I guess? idk.

		for(let i = lookbackStart; i < aggArray.length; i++) {
			let currDate = new Date(aggArray[i].stamp);
			let month = currDate.getMonth();
			newtimestamps.push(currDate.getDate() + "-" + Months[month] + "-" + currDate.getFullYear().toString().substring(2,4) + "-" + currDate.getHours() + ":" + currDate.getMinutes())
			newobup.push(aggArray[i].obup);
			newobdown.push(aggArray[i].obdown); //probably strings rather than numbers
			newvolume.push(aggArray[i].volume);
		}

		//prune outlier spikes (TODO prune in the database itself/simply save the prior value if spikes by 50% or more)
		for(let i = 0; i < newobup.length-2; i++) {
			if(newobup[j] >= newobup[i] + Math.floor(newobup[i]/2))
				newobup[j] = Math.floor((newobup[i] + newobup[k])/2);
			if(newobdown[j] >= newobdown[i] + Math.floor(newobdown[i]/2))
				newobdown[j] = Math.floor((newobdown[i] + newobdown[k])/2);
				j++;
				k++;
		}
		setObUp([...newobup]);
		setObDown([...newobdown]);
		//setVolume([...volume, ...newvolume]);
		setTimestamps([...newtimestamps]);
	}

	const fetchOBData = async (token) => {
		try{
				const res = await axios({
					method: 'get',
					url: "https://master--globaltokenbook.netlify.app/.netlify/functions/aggtokenusd",
					params: {token : token},
					responseType: 'json',
					timeout: '10000'
				})
				let aggArray = res.data
				setIsFetching(false);	
				setData([...data, ...aggArray]);
			}
				catch(err) {
					console.log(err);
					//leave the data the same but still "update" state to rerender
					setData(data);
					setIsFetching(false);
				};
		}

	// console.log("OBUP:" + obup)
	// console.log("OBDOWN:" + obdown)
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
  return (
  	isFetching 
  	? 
  	<p>fetching data</p> 
  	: <> 
  					<Line options={options} data={chartData} redraw={false} /> 
  		</>
  	);
}

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
	]

export default OrderbookDataHook