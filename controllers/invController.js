// controllers/invController.js
const invModel = require("../models/inventory-model")
const utilities = require("../utilities")

const invCont = {}


/* ===== Task 1: Management ===== */
invCont.buildManagement = utilities.handleErrors(async (req, res) => {
    const nav = await utilities.getNav()
    res.render("./inventory/management", { title: "Inventory Management", nav })
})

/* ===== Task 2: Add Classification ===== */
invCont.buildAddClassification = utilities.handleErrors(async (req, res) => {
    const nav = await utilities.getNav()
    res.render("./inventory/add-classification", { title: "Add New Classification", nav, errors: null })
})

invCont.addClassification = utilities.handleErrors(async (req, res) => {
    const { classification_name } = req.body
    const result = await invModel.addClassification(classification_name)
    if (result) {
        req.flash("notice", `Added classification "${classification_name}".`)
        const nav = await utilities.getNav()
        return res.status(201).render("./inventory/management", { title: "Inventory Management", nav })
    }
    const nav = await utilities.getNav()
    res.status(500).render("./inventory/add-classification", {
        title: "Add New Classification", nav,
        errors: [{ msg: "Insert failed. Try again." }],
        classification_name
    })
})

/* ===== Task 3: Add Inventory ===== */
invCont.buildAddInventory = utilities.handleErrors(async (req, res) => {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.render("./inventory/add-inventory", {
        title: "Add New Vehicle", nav, classificationList, errors: null, invData: {}
    })
})

invCont.addInventory = utilities.handleErrors(async (req, res) => {
    const {
        inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles, classification_id
    } = req.body

    const inserted = await invModel.addInventory({
        inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles, classification_id
    })

    if (inserted) {
        req.flash("notice", "Vehicle added successfully.")
        const nav = await utilities.getNav()
        return res.status(201).render("./inventory/management", { title: "Inventory Management", nav })
    }

    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)
    res.status(500).render("./inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        errors: [{ msg: "Insert failed. Check values and try again." }],
        invData: { ...req.body } // sticky
    })
})

/* ===== Your existing A3 handlers ===== */

invCont.buildByClassificationId = utilities.handleErrors(async (req, res) => {
    const classification_id = Number(req.params.classificationId)
    if (!Number.isInteger(classification_id) || classification_id <= 0) {
        const err = new Error("Invalid classification id"); err.status = 400; throw err
    }
    const data = await invModel.getInventoryByClassificationId(classification_id)
    if (!data || data.length === 0) { const err = new Error("No vehicles found"); err.status = 404; throw err }
    const grid = await utilities.buildClassificationGrid(data)
    const nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", { title: className + " vehicles", nav, grid })
})

/* If you have buildVehicleDetail already, keep it here */


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
