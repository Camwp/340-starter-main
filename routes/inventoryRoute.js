const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const validate = require("../validations/inventory-validation");
// const utilities = require("../utilities"); // <- uncomment & add to routes to require login

// Management page
router.get("/", invController.buildManagement);

// ---- Classification name management ----
router.get("/classifications", invController.buildClassificationsAdmin);
router.get("/edit-classification/:classificationId", invController.buildEditClassification);
router.post(
    "/edit-classification/:classificationId",
    validate.classificationRules(),
    validate.checkClassData,
    invController.updateClassification
);
router.get("/delete-classification/:classificationId", invController.buildDeleteClassification);
router.post("/delete-classification/:classificationId", invController.deleteClassification);

// JSON for select -> table
router.get("/getInventory/:classification_id", invController.getInventoryJSON);

// By classification
router.get("/type/:classificationId", invController.buildByClassificationId);

// Add Classification
router.get("/add-classification", invController.buildAddClassification);
router.post(
    "/add-classification",
    validate.classificationRules(),
    validate.checkClassData,
    invController.addClassification
);

// Add Inventory
router.get("/add-inventory", invController.buildAddInventory);
router.post(
    "/add-inventory",
    validate.inventoryRules(),
    validate.checkInvData,
    invController.addInventory
);

// Vehicle detail
router.get("/detail/:invId", invController.buildVehicleDetail);

module.exports = router;
