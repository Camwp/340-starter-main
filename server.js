/* ******************************************
 * Primary server file
 *******************************************/
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

/* Views & Layout */
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* Parsers (needed for form POSTs) */
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

/* Static assets */
app.use(express.static(path.join(__dirname, "public")))

/* Optional custom static router */
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

/* 404 */
app.use((req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
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
    message,
    nav
  })
})

/* Server */
const port = process.env.PORT
const host = process.env.HOST
app.listen(port, () => {
  console.log(`app listening on http://${host}:${port}`)
})

module.exports = app
