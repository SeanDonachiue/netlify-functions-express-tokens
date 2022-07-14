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
router.post('/addObservations', (req, res) => {
    var inputData = JSON.parse(req.body.data);

    //Array of JSON apprximately conforming to DB Schema
    //Save each entry to the database
    for(let i = 0; i < inputData.length; i++) {

        //Load models with corresponding input data
        let newToken = new TokenModel();
        newToken.token = inputData[i].token;
        newToken.pair = inputData[i].pair;
        newToken.exchange = inputData[i].exchange;

        //Convert strings to int for db schema
        let newStamp = new TimestampModel();
        newStamp.stamp = inputData[i].stamp;
        newStamp.price = parseFloat(inputData[i].price.replace(/,/g, ''));
        newStamp.obup = parseFloat(inputData[i].obup.replace(/,/g, ''));
        newStamp.obdown = parseFloat(inputData[i].obdown.replace(/,/g, ''));
        newStamp.volume = parseFloat(inputData[i].volume.replace(/,/g, ''));

        //Check exchange token pair against db, if none stored, save
        TokenModel.findOne({ pair: inputData[i].pair, exchange: inputData[i].exchange }, (err, exchPair) => {
            if(exchPair == null) {
                if(err) console.log("Error: " + err);
                console.log("attempting to save new token pair");
                newToken.timestamps.push(newStamp);
                newToken.save((err, data, numRows) => {
                    if (err) {
                        console.log("Error: " + err);
                    }
                    else {
                        console.log("New Token Exchange Pair Saved");
                        console.log("data " + data);
                    }
                });
            }
            else {
                if(err) console.log("Error: " + err);
                console.log("Attemping to save new timestamp to existing token exchange pair");
                exchPair.timestamps.push(newStamp);
                exchPair.save((err, data, numRows) => {
                    if (err) {
                        console.log("Error: " + err);
                    }
                    else {
                        console.log("New " + exchPair.exchange + " " + exchPair.pair + " Saved");
                        console.log("data " + data);
                    }
                });
            }
        });
    }
    res.send("finished attempting to save data");
}).then(() => {
    mongoose.disconnect();
});

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use('/.netlify/functions', router)

export default app;

// Export lambda handler
exports.handler = serverless(app);