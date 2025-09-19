// controllers/invController.js
const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invCont = {}

invCont.buildByClassificationId = utilities.handleErrors(async (req, res) => {
    const classification_id = Number(req.params.classificationId)
    if (!Number.isInteger(classification_id) || classification_id <= 0) {
        const err = new Error("Invalid classification id"); err.status = 400; throw err
    }

    const data = await invModel.getInventoryByClassificationId(classification_id)
    if (!data || data.length === 0) {
        const err = new Error("No vehicles found for this classification"); err.status = 404; throw err
    }

    const grid = await utilities.buildClassificationGrid(data)
    const nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
})

invCont.buildVehicleDetail = utilities.handleErrors(async (req, res) => {
    const invId = Number(req.params.invId)
    if (!Number.isInteger(invId) || invId <= 0) {
        const err = new Error("Invalid vehicle id"); err.status = 400; throw err
    }

    const vehicle = await invModel.getInventoryById(invId)
    if (!vehicle) {
        const err = new Error("Vehicle not found"); err.status = 404; throw err
    }

    const nav = await utilities.getNav()
    const content = utilities.buildVehicleDetailHTML(vehicle)
    const title = `${vehicle.inv_make} ${vehicle.inv_model} (${vehicle.inv_year})`
    res.status(200).render("./inventory/detail", { title, nav, content })
})

module.exports = invCont
