const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const validate = require("../validations/inventory-validation")


// Management
router.get("/", invController.buildManagement)

// By classification (existing)
router.get("/type/:classificationId", invController.buildByClassificationId)

// Add Classification
router.get("/add-classification", invController.buildAddClassification)
router.post(
    "/add-classification",
    validate.classificationRules(),
    validate.checkClassData,
    invController.addClassification
)

// Add Inventory
router.get("/add-inventory", invController.buildAddInventory)
router.post(
    "/add-inventory",
    validate.inventoryRules(),
    validate.checkInvData,
    invController.addInventory
)

router.get("/type/:classificationId", invController.buildByClassificationId)
router.get("/detail/:invId", invController.buildVehicleDetail)
router.get("/type/:classificationId", invController.buildByClassificationId)
router.get("/detail/:invId", invController.buildVehicleDetail)



module.exports = router
