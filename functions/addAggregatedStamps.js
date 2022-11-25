/**

BOILERPLATE FOR MAKING A SINGLE SERVERLESS-HTTP REQUEST LINKED WITH DB

**/


/* example using https://github.com/dougmoscrop/serverless-http */

import mongoose from 'mongoose'
import serverless from 'serverless-http'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import TokenModel, {TimestampModel} from './app/token.js';
import AggregatedStampModel from './app/aggregatedStamp.js';


// Connecting to database
var query = 'mongodb+srv://aegioh:jXMoXZsCliL5ku3K@cluster0.eusxn.mongodb.net/tokenDB?retryWrites=true&w=majority'
const db = (query);
mongoose.Promise = global.Promise;
  
mongoose.connect(db, { useNewUrlParser : true, 
useUnifiedTopology: true }, function(error) {
    if (error) {
        console.log("Error!" + error);
    }
});

const app = express();
const router = express.Router();

router.post('/addAggregatedStamps', (req, res) => {
    console.log(req.body.data);
    let inputData = JSON.parse(req.body.data);
    //input is going to be one AggregatedStampModel
    console.log(inputData.obup);
    let newAggStamp = new AggregatedStampModel();
    newAggStamp.token = inputData.token;
    newAggStamp.stamp = inputData.stamp;
    //newAggStamp.price = inputData.price;
    newAggStamp.obup = inputData.obup;
    newAggStamp.obdown = inputData.obdown;
    newAggStamp.volume = inputData.volume;
    
    AggregatedStampModel.find({ token: "ethereum"}, (err, aggregatedStamps) => {
        if (err) console.log(err);
        else console.log("find performed successfully, db connection established")
    })
    newAggStamp.save((err, data, numRows) => {
        if(err) {console.log('Error: ' + err);
            res.send(err);
        }
        else {
            console.log("New Aggregated Timestamp Saved: ");
            res.send("data: " + data);
        }
    });
});

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use('/.netlify/functions', router)

export default app;

// Export lambda handler
exports.handler = serverless(app);