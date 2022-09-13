import OrderbookDataHook from './OrderbookDataHook.js'
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import ToggleButton from '@mui/material/ToggleButton';
import TextField from '@mui/material/TextField';
import React, {useLayoutEffect, useRef, useEffect, useState} from 'react';

function OrderbookDepthChart(props) {
	//have toggles controlling these states => props for charts
	const [isVis, setVis] = useState(true);
	const [isAllData, setIsAllData] = useState(true);
	const [maLength, setMALength] = useState(1);
	const [lookback, setLookback] = useState(144);
	const handleLookback = (e) => {
		e.preventDefault();
		setLookback(e.currentTarget.value);
	}
	const handleMAUpdate = (e) => {
		e.preventDefault();
		setMALength(e.currentTarget.value);
	}
	const handleVisClick = () => {
		setVis(isVis => !isVis);
	}
	const handleDataClick = (e) => {
		e.preventDefault();
		setIsAllData(isAllData => !isAllData);
	}


	const mounted = useRef();
	useEffect(() => {
  		if (!mounted.current) {
  			setIsAllData(isAllData => !isAllData);
  			//console.log("I am mounted")
    	// do componentDidMount logic
    	mounted.current = true;
 		 } else {
 		 //console.log(props.token + props.id);
    	// do componentDidUpdate logic
  	}}, []);

	//blocks renders until function is done
  	// useLayoutEffect(() => {
  	// 	console.log("useLayoutEffects")
  	// }, [isVis, isAllData]);

	//trigger rerender if you alter this stuff maybe idk. none of the prop changes do anything.

  return(
  	<div>
  		<div style={{display: 'flex', flexDirection: 'row', position: 'relative', left: '12px', top: '50px', marginTop: '-25px', height: '40px', width: '250px'}}>
  			<ToggleButton value="display" aria-label="toggle-display">
  				{isVis ? <VisibilityIcon fontSize="medium" onClick={handleVisClick}/> : <VisibilityOffIcon fontSize="medium" onClick={handleVisClick}/>}
  			</ToggleButton>
  			<ToggleButton value="lookback" aria-label="toggle-lookback-period">
  				{isAllData ? <HistoryToggleOffIcon fontSize="medium" onClick={handleDataClick}/> : <MoreTimeIcon fontSize="medium" onClick={handleDataClick}/>}
  			</ToggleButton>
  			<TextField
  				id="ma-input"
  				label="Mov Avg"
  				
  				type="number"
  				defaultValue="1"
  				variant="outlined"
  				size="small"
  				aria-label="Moving Average"
  				onChange={handleMAUpdate}
  			/>
  			<TextField
  				id="lookbackInput"
  				label="Lookback"
  				type='number'
  				defaultValue="144"
  				variant="outlined"
  				size="small"
  				aria-label="Lookback Period"
  				onChange={handleLookback}
  			/>
  		</div>
		{isVis ? <OrderbookDataHook style={{position: 'relative', bottom: '10px'}} key={props.token} token={props.token} maLength={maLength} lookback={lookback} isAllData={isAllData} isVis={isVis}/> : <></>}
    </div>
    
  )

}

export default OrderbookDepthChart;