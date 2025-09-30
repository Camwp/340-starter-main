// controllers/invController.js
const invModel = require("../models/inventory-model");
const utilities = require("../utilities");

const invCont = {};

invCont.buildManagement = utilities.handleErrors(async (req, res) => {
    const nav = await utilities.getNav();
    const classificationSelect = await utilities.buildClassificationList();
    const account = res.locals.accountData || null;

    res.render("./inventory/management", {
        title: "Inventory Management",
        nav,
        classificationSelect,
        errors: null,
        account,
    });
});

invCont.getInventoryJSON = utilities.handleErrors(async (req, res) => {
    const classification_id = parseInt(req.params.classification_id, 10);
    if (!Number.isInteger(classification_id)) {
        const err = new Error("Invalid classification id"); err.status = 400; throw err;
    }
    const invData = await invModel.getInventoryByClassificationId(classification_id);
    if (invData && invData.length) return res.json(invData);
    const err = new Error("No data returned"); err.status = 404; throw err;
});

invCont.buildAddClassification = utilities.handleErrors(async (req, res) => {
    const nav = await utilities.getNav();
    res.render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: null,
    });
});

invCont.addClassification = utilities.handleErrors(async (req, res) => {
    const { classification_name } = req.body;
    const result = await invModel.addClassification(classification_name);
    const nav = await utilities.getNav();

    if (result) {
        req.flash("notice", `Added classification "${classification_name}".`);
        return res.status(201).render("./inventory/management", {
            title: "Inventory Management",
            nav,
        });
    }

    res.status(500).render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: [{ msg: "Insert failed. Try again." }],
        classification_name,
    });
});

invCont.buildAddInventory = utilities.handleErrors(async (req, res) => {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList();
    res.render("./inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        errors: null,
        invData: {},
    });
});

invCont.addInventory = utilities.handleErrors(async (req, res) => {
    const {
        inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles, classification_id,
    } = req.body;

    const inserted = await invModel.addInventory({
        inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles, classification_id,
    });

    if (inserted) {
        req.flash("notice", "Vehicle added successfully.");
        return res.redirect("/inv/");
    }

    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(classification_id);
    res.status(500).render("./inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        errors: [{ msg: "Insert failed. Check values and try again." }],
        invData: { ...req.body },
    });
});

invCont.buildByClassificationId = utilities.handleErrors(async (req, res) => {
    const classification_id = Number(req.params.classificationId);
    if (!Number.isInteger(classification_id) || classification_id <= 0) {
        const err = new Error("Invalid classification id"); err.status = 400; throw err;
    }
    const data = await invModel.getInventoryByClassificationId(classification_id);
    if (!data || data.length === 0) {
        const err = new Error("No vehicles found"); err.status = 404; throw err;
    }
    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
        title: `${className} vehicles`,
        nav,
        grid,
    });
});

invCont.buildVehicleDetail = utilities.handleErrors(async (req, res) => {
    const invId = Number(req.params.invId);
    if (!Number.isInteger(invId) || invId <= 0) {
        const err = new Error("Invalid vehicle id"); err.status = 400; throw err;
    }
    const vehicle = await invModel.getInventoryById(invId);
    if (!vehicle) {
        const err = new Error("Vehicle not found"); err.status = 404; throw err;
    }
    const nav = await utilities.getNav();
    const content = utilities.buildVehicleDetailHTML(vehicle);
    const title = `${vehicle.inv_make} ${vehicle.inv_model} (${vehicle.inv_year})`;
    res.status(200).render("./inventory/detail", { title, nav, content });
});


invCont.buildClassificationsAdmin = utilities.handleErrors(async (req, res) => {
    const nav = await utilities.getNav();
    const data = await invModel.getClassifications();
    const classes = Array.isArray(data) ? data : data.rows;
    res.render("./inventory/classifications", {
        title: "Manage Classifications",
        nav,
        classes,
        errors: null,
    });
});

invCont.buildEditClassification = utilities.handleErrors(async (req, res) => {
    const nav = await utilities.getNav();
    const id = parseInt(req.params.classificationId, 10);
    if (!Number.isInteger(id)) { const e = new Error("Invalid id"); e.status = 400; throw e; }
    const classification = await invModel.getClassificationById(id);
    if (!classification) { const e = new Error("Classification not found"); e.status = 404; throw e; }
    res.render("./inventory/edit-classification", {
        title: "Edit Classification",
        nav,
        classification,
        errors: null,
    });
});


invCont.updateClassification = utilities.handleErrors(async (req, res) => {
    const id = parseInt(req.params.classificationId, 10);
    const { classification_name } = req.body;
    if (!Number.isInteger(id)) { const e = new Error("Invalid id"); e.status = 400; throw e; }

    const updated = await invModel.updateClassificationName(id, classification_name);
    if (updated) {
        req.flash("notice", "Classification updated.");
        return res.redirect("/inv/classifications");
    }

    const nav = await utilities.getNav();
    const classification = { classification_id: id, classification_name };
    res.status(400).render("./inventory/edit-classification", {
        title: "Edit Classification",
        nav,
        classification,
        errors: [{ msg: "Update failed. Try a different name." }],
    });
});


invCont.buildDeleteClassification = utilities.handleErrors(async (req, res) => {
    const nav = await utilities.getNav();
    const id = parseInt(req.params.classificationId, 10);
    if (!Number.isInteger(id)) { const e = new Error("Invalid id"); e.status = 400; throw e; }
    const classification = await invModel.getClassificationById(id);
    if (!classification) { const e = new Error("Classification not found"); e.status = 404; throw e; }
    const vehicles = await invModel.getInventoryByClassificationId(id);
    res.render("./inventory/delete-classification", {
        title: "Delete Classification",
        nav,
        classification,
        vehicleCount: vehicles.length,
        errors: null,
    });
});


invCont.deleteClassification = utilities.handleErrors(async (req, res) => {
    const id = parseInt(req.params.classificationId, 10);
    if (!Number.isInteger(id)) { const e = new Error("Invalid id"); e.status = 400; throw e; }


    const vehicles = await invModel.getInventoryByClassificationId(id);
    if (vehicles.length > 0) {
        req.flash("notice", "Cannot delete: this classification still has vehicles. Reassign or remove them first.");
        return res.redirect("/inv/classifications");
    }

    const deleted = await invModel.deleteClassification(id);
    req.flash("notice", deleted ? "Classification deleted." : "Delete failed.");
    res.redirect("/inv/classifications");
});

invCont.buildEditInventory = utilities.handleErrors(async (req, res) => {
    const invId = Number(req.params.invId);
    if (!Number.isInteger(invId) || invId <= 0) {
        const err = new Error("Invalid vehicle id"); err.status = 400; throw err;
    }
    const vehicle = await invModel.getInventoryById(invId);
    if (!vehicle) {
        const err = new Error("Vehicle not found"); err.status = 404; throw err;
    }

    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(vehicle.classification_id);

    res.render("./inventory/edit-inventory", {
        title: `Edit ${vehicle.inv_make} ${vehicle.inv_model}`,
        nav,
        classificationList,
        errors: null,
        invData: vehicle,
    });
});

invCont.updateInventory = utilities.handleErrors(async (req, res) => {
    const inv_id = Number(req.params.invId);
    const {
        inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles, classification_id,
    } = req.body;

    const updated = await invModel.updateInventory({
        inv_id,
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        classification_id,
    });

    if (updated) {
        req.flash("notice", "Vehicle updated successfully.");
        return res.redirect("/inv/");
    }

    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(classification_id);
    res.status(400).render("./inventory/edit-inventory", {
        title: `Edit ${inv_make} ${inv_model}`,
        nav,
        classificationList,
        errors: [{ msg: "Update failed. Check values and try again." }],
        invData: { inv_id, ...req.body },
    });
});

invCont.buildDeleteInventory = utilities.handleErrors(async (req, res) => {
    const invId = Number(req.params.invId);
    if (!Number.isInteger(invId) || invId <= 0) {
        const err = new Error("Invalid vehicle id"); err.status = 400; throw err;
    }
    const vehicle = await invModel.getInventoryById(invId);
    if (!vehicle) {
        const err = new Error("Vehicle not found"); err.status = 404; throw err;
    }

    const nav = await utilities.getNav();
    res.render("./inventory/delete-inventory", {
        title: `Delete ${vehicle.inv_make} ${vehicle.inv_model}`,
        nav,
        errors: null,
        invData: vehicle,
    });
});

invCont.deleteInventory = utilities.handleErrors(async (req, res) => {
    const invId = Number(req.params.invId);
    const deleted = await invModel.deleteInventory(invId);
    req.flash("notice", deleted ? "Vehicle deleted." : "Delete failed.");
    res.redirect("/inv/");
});


module.exports = invCont;
