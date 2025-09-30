const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
const Util = {}


Util.getNav = async function () {
  const data = await invModel.getClassifications()
  let html = '<nav class="site-nav" aria-label="Primary"><ul>'
  html += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    html += `
        <li>
          <a href="/inv/type/${row.classification_id}"
             title="See our inventory of ${row.classification_name} vehicles">
            ${row.classification_name}
          </a>
        </li>`
  })
  html += "</ul></nav>"
  return html
}


Util.fmtUSD = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
    .format(Number(n))

Util.fmtInt = (n) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 })
    .format(Number(n))


Util.buildClassificationGrid = async function (data) {
  let grid = ""

  if (data && data.length > 0) {
    grid = '<ul id="inv-display" class="inv-grid" role="list">'
    data.forEach((vehicle) => {
      const price = Util.fmtUSD(vehicle.inv_price)
      const title = `${vehicle.inv_make} ${vehicle.inv_model}`
      const thumb = vehicle.inv_thumbnail || "/images/placeholder_car.jpg"
      grid += `
        <li class="inv-card">
          <a href="/inv/detail/${vehicle.inv_id}"
             title="View ${title} details">
            <img src="${thumb}"
                 alt="Image of ${title} on CSE Motors"
                 loading="lazy" />
          </a>
          <div class="namePrice">
            <hr />
            <h2>
              <a href="/inv/detail/${vehicle.inv_id}" title="View ${title} details">
                ${title}
              </a>
            </h2>
            <span class="price">${price}</span>
          </div>
        </li>
      `
    })
    grid += "</ul>"
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


Util.buildClassificationList = async function (classification_id = null) {
  const data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"

  data.rows.forEach((row) => {
    const selected =
      classification_id != null &&
        Number(row.classification_id) === Number(classification_id)
        ? " selected"
        : ""
    classificationList += `<option value="${row.classification_id}"${selected}>${row.classification_name}</option>`
  })

  classificationList += "</select>"
  return classificationList
}

Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

Util.buildVehicleDetailHTML = function (v) {
  const title = `${v.inv_make} ${v.inv_model} (${v.inv_year})`
  const img = v.inv_image || v.inv_thumbnail || "/images/placeholder_car.jpg"
  const price = Util.fmtUSD(v.inv_price)
  const miles = Util.fmtInt(v.inv_miles)

  return `
    <section class="vehicle-detail" aria-labelledby="veh-title">
      <div class="veh-media">
        <img src="${img}" alt="${title}" loading="eager" width="900" height="600" />
      </div>
      <div class="veh-info">
        <h1 id="veh-title" class="veh-title">${title}</h1>
        <div class="veh-meta">
          <p><strong>Make:</strong> ${v.inv_make}</p>
          <p><strong>Model:</strong> ${v.inv_model}</p>
          <p><strong>Year:</strong> ${v.inv_year}</p>
          <p><strong>Price:</strong> <span class="veh-price">${price}</span></p>
          <p><strong>Mileage:</strong> <span class="veh-miles">${miles}</span> miles</p>
        </div>
        <div class="veh-desc">
          <h2>Description</h2>
          <p>${v.inv_description ?? "No description available."}</p>
        </div>
      </div>
    </section>
  `
}


Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)



Util.checkLogin = (req, res, next) => {
  if (!res.locals?.loggedin) {
    req.flash("notice", "Please log in");
    return res.redirect("/account/login");
  }
  next();
};


Util.checkJWTToken = (req, res, next) => {
  const token = req.cookies && req.cookies.jwt;
  if (!token) return next();

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
    if (err) {
      res.clearCookie("jwt", { httpOnly: true, sameSite: "lax", path: "/" });
      return next();
    }
    res.locals.accountData = accountData;
    res.locals.loggedin = 1;
    next();
  });
};

module.exports = Util
