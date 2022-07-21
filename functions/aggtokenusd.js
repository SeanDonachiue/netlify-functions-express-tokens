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
router.get('/aggtokenusd', (req, res) => {
    console.log("req received")
    console.log(req.query.token);
    AggregatedStampModel.find({ token: req.query.token}, (err, aggregatedStamps) => {
        if (err) {
            console.log(err);
            res.send(err);
        }
        else {
            console.log(aggregatedStamps);
            res.send(aggregatedStamps);
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