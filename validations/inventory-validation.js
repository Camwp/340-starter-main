const { body, validationResult } = require("express-validator")
const utilities = require("../utilities")

const classificationRules = () => [
    body("classification_name")
        .trim().escape()
        .notEmpty().withMessage("Classification name is required.")
        .matches(/^[A-Za-z]+$/).withMessage("Letters only, no spaces or special characters.")
        .isLength({ min: 3, max: 20 }).withMessage("Length 3–20 characters.")
]

const inventoryRules = () => [
    body("inv_make").trim().escape().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().escape().notEmpty().withMessage("Model is required."),
    body("inv_year").trim().toInt().isInt({ min: 1900, max: 2099 }).withMessage("Year must be 1900–2099."),
    body("inv_description").trim().escape().notEmpty().withMessage("Description is required."),
    body("inv_image").trim().notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
    body("inv_price").trim().toFloat().isFloat({ min: 0 }).withMessage("Price must be a positive number."),
    body("inv_miles").trim().toInt().isInt({ min: 0 }).withMessage("Miles must be a non-negative integer."),
    body("classification_id").trim().toInt().isInt({ min: 1 }).withMessage("Choose a classification.")
]

const checkClassData = async (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) return next()
    const nav = await utilities.getNav()
    res.status(400).render("./inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: errors.array(),
        classification_name: req.body.classification_name
    })
}

const checkInvData = async (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) return next()
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)
    res.status(400).render("./inventory/add-inventory", {
        title: "Add New Vehicle",
        nav,
        classificationList,
        errors: errors.array(),
        invData: { ...req.body }
    })
}

module.exports = { classificationRules, checkClassData, inventoryRules, checkInvData }
