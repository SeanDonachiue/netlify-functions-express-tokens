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
    console.log("db connected")
    if (error) {
        console.log("Error!" + error);
    }
});

const app = express();
const router = express.Router();
router.post('/addAggregatedStamps', (req, res) => {
    let inputData = JSON.parse(req.body.data);
    //input is going to be one AggregatedStampModel
    let newAggStamp = new AggregatedStampModel();
    newAggStamp.token = inputData.token;
    newAggStamp.stamp = inputData.stamp;
    newAggStamp.price = parseFloat(inputData.price);
    newAggStamp.obup = parseFloat(inputData.obup);
    newAggStamp.obdown = parseFloat(inputData.obdown);
    newAggStamp.volume = parseFloat(inputData.volume);

    newAggStamp.save((err, data, numRows) => {
        if(err) console.log('Error: ' + err);
        else {
            console.log("New Aggregated Timestamp Saved: ");
            console.log("data: " + data);
        }
    })
    mongoose.disconect();
    res.send("finished attempting to save data");
})

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use('/.netlify/functions', router)

export default app;

// Export lambda handler
exports.handler = serverless(app);