/* Express App */
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import compression from 'compression'
import api from './api.js'
/* My express App */
export default function expressApp() {
  const app = express()

  // gzip responses
  //router.use(compression())

  
  // Setup routes
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())

  // Set router base path for local dev
  //in production, route requests to lambda
  //all requests still go thru api.js
  if(process.env.NODE_ENV === 'dev') {
    app.use('./api', api)
  }
  else {
    app.use('/.netlify/functions/', api)
  }
  // Apply express middlewares
  app.use(cors())
  app.use(bodyParser.urlencoded({ extended: true }))
  app.use(bodyParser.json())
  

  return app
}
