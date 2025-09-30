const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const validate = require("../validations/inventory-validation");

router.get("/", invController.buildManagement);

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

router.get("/getInventory/:classification_id", invController.getInventoryJSON);

router.get("/type/:classificationId", invController.buildByClassificationId);

router.get("/add-classification", invController.buildAddClassification);
router.post(
    "/add-classification",
    validate.classificationRules(),
    validate.checkClassData,
    invController.addClassification
);

router.get("/add-inventory", invController.buildAddInventory);
router.post(
    "/add-inventory",
    validate.inventoryRules(),
    validate.checkInvData,
    invController.addInventory
);

router.get("/detail/:invId", invController.buildVehicleDetail);

router.get("/edit/:invId", invController.buildEditInventory);
router.post(
    "/edit/:invId",
    validate.inventoryRules(),
    validate.checkInvData,
    invController.updateInventory
);

router.get("/delete/:invId", invController.buildDeleteInventory);
router.post("/delete/:invId", invController.deleteInventory);
module.exports = router;
