/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute.js")
const utilities = require("./utilities/index.js")

const express = require("express")
const env = require("dotenv").config()
const path = require("path");
const { connectToDb, getDb } = require('./controllers/conn.js');

const app = express();

;
const static = require("./routes/static")
const expressLayouts = require("express-ejs-layouts")

/* ***********************
 * Routes
 *************************/

const swaggerUi = require('swagger-ui-express');
const openapi = require('./swagger/swaggerapi.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapi));

app.use(static)
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")
app.get("/", utilities.handleErrors(baseController.buildHome))
// serve /public (so /images/... and /css/... work)
app.use(express.static(path.join(__dirname, "public")))


app.use("/inv", inventoryRoute)

app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' })
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if (err.status == 404) { message = err.message } else { message = 'Oh no! There was a crash. Maybe try a different route?' }
  res.render("errors/errors", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})
/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on http://${host}:${port}`)
})
