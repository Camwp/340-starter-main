require("dotenv").config()
const express = require("express")
const path = require("path")
const expressLayouts = require("express-ejs-layouts")

const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const staticRoutes = require("./routes/static")
const utilities = require("./utilities")

/* Swagger */
const swaggerUi = require("swagger-ui-express")
const openapi = require("./swagger/swaggerapi.json")

/* App */
const app = express()

/* View Engine & Layouts */
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* Parsers */
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

/* Static assets */
app.use(express.static(path.join(__dirname, "public")))

/* Optional custom static routes */
app.use(staticRoutes)

/* Swagger UI */
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapi))

/* Routes */
app.get("/", utilities.handleErrors(baseController.buildHome))
app.use("/inv", inventoryRoute)




/* Intentional error test route (Task 3) */
app.get("/errors/trigger", (req, res, next) => {
  const err = new Error("Intentional 500 test error")
  err.status = 500
  next(err) // pass to the error middleware
})

/* 404 handler */
app.use((req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

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

const port = process.env.PORT || 3000
const host = process.env.HOST || "localhost"
app.listen(port, () => {
  console.log(`app listening on http://${host}:${port}`)
})

module.exports = app
