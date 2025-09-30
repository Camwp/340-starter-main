/* ******************************************
 * Primary server file
 *******************************************/
require("dotenv").config()
const express = require("express")
const path = require("path")
const expressLayouts = require("express-ejs-layouts")

/* Controllers / Routes / Utils */
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const staticRoutes = require("./routes/static")
const utilities = require("./utilities")
const cookieParser = require("cookie-parser")

/* Swagger */
const swaggerUi = require("swagger-ui-express")
const openapi = require("./swagger/swaggerapi.json")

/* Sessions + Flash */
const session = require("express-session")
const flash = require("connect-flash")
const expressMessages = require("express-messages")

const pool = require("./database")
const PgSession = require("connect-pg-simple")(session)

const app = express()


app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(expressLayouts)
app.set("layout", "./layouts/layout")


app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

/* Static assets and optional static routes */
app.use(express.static(path.join(__dirname, "public")))
app.use(staticRoutes)

/* Swagger UI */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapi))

app.use(session({
  // store: new PgSession({ pool, createTableIfMissing: true }), 
  secret: process.env.SESSION_SECRET || "dev-secret",
  resave: true,
  saveUninitialized: true,
  name: "sessionId",
}))
app.use(flash())
app.use(utilities.checkJWTToken);   // <-- populates res.locals.loggedin + accountData


app.use((req, res, next) => {
  res.locals.messages = expressMessages(req, res)
  next()
})
// after cookieParser, session, flash middleware

/* Routes */
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/inv", inventoryRoute)

const accountRoute = require("./routes/accountRoute")
app.use("/account", accountRoute)


app.get("/errors/trigger", (req, res, next) => {
  const err = new Error("Intentional 500 test error")
  err.status = 500
  next(err)
})

/* 404 (after all normal routes) */
app.use((req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

/* Centralized Error Handler (last) */
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
  const message = status === 404
    ? (err.message || "The requested resource was not found.")
    : "Oh no! There was a crash. Maybe try a different route?"

  if (status >= 500) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`)
    console.error(err.stack || err)
  }

  res.status(status).render("errors/errors", {
    title,
    status,
    message,
    nav,
    // pass err only in dev if you want to show a <details>
    err: process.env.NODE_ENV !== "production" ? err : null,
  })
})

/* Server */
const port = process.env.PORT || 3000
const host = process.env.HOST || "localhost"
app.listen(port, () => {
  console.log(`app listening on http://${host}:${port}`)
})

module.exports = app
