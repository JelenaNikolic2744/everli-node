import bodyParser from 'body-parser'
import express from 'express'

import { router } from '../routes/witnessReportRoutes.js'

const app = express()
const port = 3000

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
)
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  )
  next()
})

app.use(router)

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

app.listen(port, () => {
  console.log(`Server is up on the port localhost:${port}`)
})
