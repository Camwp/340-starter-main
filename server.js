/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
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
app.get("/", function (req, res) {
  res.render("index", { title: "Home" })
})
// serve /public (so /images/... and /css/... work)
app.use(express.static(path.join(__dirname, "public")))
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
