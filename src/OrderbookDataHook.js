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
  			type: 'linear',
  			display: true,
  			position: 'left',
  			ticks: {
  				callback: function(value, index, ticks) {
  					return "$" + value / 1000000 + "M"
  				}
  			},
  		},
  		y1: {
  			type: 'linear',
  			display: true,
  			position: 'right',
  			ticks: {
  				callback: function(value, index, ticks) {
  					return "$" + value / 1000000000 + "B"
  				}
  			},
  			grid: {
  				drawOnChartArea: false,
  			},
  		},
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
      	text: '±2% Aggregated Spot Orderbook Depth'
    	},
  	},
	};
	options.plugins.title.text = props.token.substring(0,1).toUpperCase() + props.token.substring(1, props.token.length) + " ±2% Aggregated Spot Orderbook Depth";
	const [data, setData] = useState([{}]);
	const [timestamps, setTimestamps] = useState([]);
	const [obup, setObUp] = useState([]);
	const [obdown, setObDown] = useState([]);
	const [maUp, setMAUp] = useState([]);
	const [maDown, setMADown] = useState([]);
	const [volume, setVolume] = useState([]);

	const [isFetching, setIsFetching] = useState(true);
	const[isAll, setIsAll] = useState(props.isAllData);
	const[lookback, setLookback] = useState(props.lookback);
	const[maLength, setMALength] = useState(props.maLength);
	//maybe need to structure a new object for this
	

	//when the second param has a value changed, react calls useEffects again. this seems to be a bad pattern.
	const mounted = useRef();
	useEffect(() => {
		
		//component did mount logic. if not yet mounted, fetch the data
		if(!mounted.current) {
			mounted.current = true;
			console.log("not mounted, fetching data")
			fetchOBData(props.token);

		}
		//component did update logic. component HAS mounted, handle the data
		else {
				console.log("mounted, data fields fetched, handling data")
				handleOBData(props.maLength, props.lookback);
		}		
	}, [data]);
	

	//when isAll (state var) is updated, if the component is mounted, run HandleOBData();
	//when props.isAllData is updated, repaint the ui and set isAll state var.
	useEffect(()=> {
		if(mounted.current) {
			handleOBData(props.maLength, props.lookback);
		}
	},[lookback])
	useLayoutEffect(() => {
		setLookback(props.lookback);
	}, [props.lookback])

	useEffect(()=> {
		if(mounted.current) {
			handleOBData(props.maLength, props.lookback);
		}
	},[isAll])
	useLayoutEffect(() => {
		setIsAll(props.isAllData);
	}, [props.isAllData])

	useEffect(()=> {
		if(mounted.current) {
			handleOBData(props.maLength, props.lookback);
		}
	},[maLength])
	useLayoutEffect(() => {
		setMALength(props.maLength);
	}, [props.maLength])

	//so if I want to update anything in the UI quickly, it has to follow this pattern???? not sure
	//need to think more about what is happening here fundamentally

	const handleOBData = async (maLength, lookback) => {
		let aggArray = [...data];
		if(aggArray.length == 1) {
			console.log("data not yet written to state, returning...");
			return;
		}
		//aggArray.shift();
		console.log(aggArray);
		let newtimestamps = [];
		let newobup = []; 
		let newobdown = [];
		let newvolume = [];
		let newmaUp = [];
		let newmaDown = [];
		
		let lookbackStart = 0;

		//lookback period set here because we are setting state vars for the chart content
		if(!isAll) {
			lookbackStart = aggArray.length - 1 - lookback; 
		}
		//want to also take the 6ma of everything here or have a flag for that etc
		//pass a param for MAs I guess? idk.
		//console.log(lookbackStart + " lookbackstart")
		//console.log(aggArray.length + " array length")
		for(let i = lookbackStart; i < aggArray.length; i++) {

			let windowEnd = i - maLength;
			//console.log("windowEnd: " + windowEnd);
			//console.log("arr length: " + aggArray.length);
			if(windowEnd <= aggArray.length) {
				//console.log("windowEnd: " + windowEnd);
				let maUpSum = 0;
				let maDownSum = 0;
				for(let curr = i; curr > windowEnd; curr--) {
					//console.log("index i:" + i);
					//console.log("index curr: " + curr);
					maUpSum += aggArray[curr].obup;
					maDownSum += aggArray[curr].obdown;
				}

				newmaUp.push(maUpSum/maLength);
				newmaDown.push(maDownSum/maLength);					
			}
			
			//************ raw data and timestamps ******************//
			let currDate = new Date(aggArray[i].stamp);
			let month = currDate.getMonth();
			newtimestamps.push(currDate.getDate() + "-" + Months[month] + "-" + currDate.getFullYear().toString().substring(2,4) + "-" + currDate.getHours() + ":" + currDate.getMinutes())
			newvolume.push(aggArray[i].volume);
			newobup.push(aggArray[i].obup);
			newobdown.push(aggArray[i].obdown);
		}
		let j = 1;
		let k = 2;
		//prune outlier spikes (TODO prune in the database itself/simply save the prior value if spikes by 50% or more)
		// for(let i = 0; i < newobup.length-2; i++) {
		// 	if(newobup[j] >= newobup[i] + Math.floor(newobup[i]/2))
		// 		newobup[j] = Math.floor((newobup[i] + newobup[k])/2);
		// 	if(newobdown[j] >= newobdown[i] + Math.floor(newobdown[i]/2))
		// 		newobdown[j] = Math.floor((newobdown[i] + newobdown[k])/2);
		// 		j++;
		// 		k++;
		// }
		setTimestamps([...newtimestamps]);
		setVolume([...newvolume]);
		setMAUp([...newmaUp]);
		setMADown([...newmaDown]);
		setObUp([...newobup]);
		setObDown([...newobdown]);

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
					//TODO if you get code: "ECONN ABORTED", retry the request
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
      // {
      //   label: 'Ask',
      //   data: obup,
      //   borderColor: 'rgb(255, 99, 132)',
      //   backgroundColor: 'rgba(255, 99, 132, 0.5)',
      // },
      {
        label: 'Ask MA',
        data: maUp,
        borderColor: 'rgb(250, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.3)',
        yAxisID: 'y',
      },
      // {
      //   label: 'Bid',
      //   data: obdown,
      //   borderColor: 'rgb(53, 235, 162)',
      //   backgroundColor: 'rgba(53, 235, 162, 0.5)',
      // },
      {
        label: 'Bid MA',
        data: maDown,
        borderColor: 'rgb(53, 230, 162)',
        backgroundColor: 'rgba(53, 235, 162, 0.3)',
        yAxisID: 'y',
      },
      {
      	label: '24h Volume (right)',
      	data: volume,
      	borderColor: 'rgb(250,218,94)',
      	backgroundColor: 'rgba(250, 218, 94, 0.5)',
      	yAxisID: 'y1',
      }
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