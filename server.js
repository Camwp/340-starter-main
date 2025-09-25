const express = require("express")
const path = require("path")
require("dotenv").config()

/* Controllers / Routes / Utils */
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute.js")
const utilities = require("./utilities/index.js")
const staticRoutes = require("./routes/static")
const expressLayouts = require("express-ejs-layouts")

/* Swagger */
const swaggerUi = require("swagger-ui-express")
const openapi = require("./swagger/swaggerapi.json")

/* NEW: session + flash */
const session = require("express-session")
const flash = require("connect-flash")

const app = express()




/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res)
  next()
})


// Middleware (near other app.use calls)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* Parsers (needed for form POSTs) */
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

/* Static assets */
app.use(express.static(path.join(__dirname, "public")))
app.use(staticRoutes)

/* Swagger UI */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapi))


/* NEW: session + flash (before routes) */
app.use(session({
  secret: process.env.SESSION_SECRET || "dev-secret",
  resave: true,
  saveUninitialized: true,
}))
app.use(flash())
// make flash available in all views as `notice`
app.use((req, res, next) => {
  res.locals.notice = req.flash("notice")
  next()
})


/* Routes */
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute);




/* Intentional error test route (Task 3) */
app.get("/errors/trigger", (req, res, next) => {
  const err = new Error("Intentional 500 test error")
  err.status = 500
  next(err) // pass to the error middleware
})


/* Error Handler */
app.use(async (err, req, res, next) => {
  const status = err.status || 500
  const nav = await utilities.getNav()
  const message = (status === 404)
    ? (err.message || "The requested resource was not found.")
    : "Oh no! There was a crash. Maybe try a different route?"

  console.error(`Error at: "${req.originalUrl}":`, err.stack || err.message)
  res.status(status).render("errors/errors", {
    title: status,

app.use(async (err, req, res, next) => {
  const status = err.status || 500
  const nav = await utilities.getNav().catch(() => "")

  const titles = {
    400: "400 Bad Request",
    401: "401 Unauthorized",
    403: "403 Forbidden",
    404: "404 Not Found",
    500: "500 Server Error",
  }
  const title = titles[status] || `${status} Error`

  const message =
    status === 404
      ? err.message || "The requested resource was not found."
      : "Oh no! There was a crash. Maybe try a different route?"

  if (status >= 500) {
    console.error(`[${new Date().toISOString()}] Error at "${req.originalUrl}"`)
    console.error(err.stack || err.message)
  }

  res.status(status).render("errors/errors", {
    title,
    status,
    message,
    nav,
    err: process.env.NODE_ENV !== "production" ? err : null,
  })
})
/* Server */
const port = process.env.PORT
const host = process.env.HOST

const port = process.env.PORT || 3000
const host = process.env.HOST || "localhost"

app.listen(port, () => {
  console.log(`app listening on http://${host}:${port}`)
})

module.exports = app
