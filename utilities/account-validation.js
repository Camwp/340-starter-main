const utilities = require(".");
const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model");

const validate = {};


validate.registationRules = () => [
    body("account_firstname").trim().escape().notEmpty().withMessage("Please provide a first name."),
    body("account_lastname").trim().escape().notEmpty().isLength({ min: 2 }).withMessage("Please provide a last name."),
    body("account_email")
        .trim()
        .notEmpty()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email);
            if (emailExists) throw new Error("Email exists. Please log in or use a different email.");
        }),
    body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
];


validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav();
        return res.status(400).render("account/register", {
            title: "Registration",
            nav,
            errors: errors.array(),
            account_firstname,
            account_lastname,
            account_email,
        });
    }
    next();
};


validate.loginRules = () => [
    body("account_email").trim().notEmpty().isEmail().normalizeEmail().withMessage("A valid email is required."),
    body("account_password").trim().notEmpty().withMessage("Password is required."),
];


validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav();
        return res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: errors.array(),
            account_email,
        });
    }
    next();
};


validate.updateAccountRules = () => [
    body("account_firstname").trim().notEmpty().withMessage("First name is required"),
    body("account_lastname").trim().notEmpty().withMessage("Last name is required"),
    body("account_email").trim().isEmail().withMessage("Valid email required"),
    body("account_id").isInt().withMessage("Invalid account id"),
    body("account_email").custom(async (email, { req }) => {
        const account_id = Number(req.body.account_id);
        if (await accountModel.emailTakenByAnother(email, account_id)) {
            throw new Error("That email is already in use.");
        }
        return true;
    }),
];

validate.checkUpdateAccountData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav();
        return res.status(400).render("account/update", {
            title: "Update Account",
            nav,
            errors: errors.array(),
            account: {
                account_id: req.body.account_id,
                account_firstname: req.body.account_firstname || "",
                account_lastname: req.body.account_lastname || "",
                account_email: req.body.account_email || "",
            },
            notice: req.flash("notice"),
        });
    }
    next();
};


validate.passwordChangeRules = () => [
    body("account_password")
        .trim()
        .isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    body("account_id").isInt().withMessage("Invalid account id"),
];


validate.checkPasswordChangeData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav();
        const account = await require("../models/account-model").getAccountById(Number(req.body.account_id)).catch(() => null);
        return res.status(400).render("account/update", {
            title: "Update Account",
            nav,
            errors: errors.array(),
            account: account || { account_id: req.body.account_id },
            notice: req.flash("notice"),
        });
    }
    next();
};

module.exports = validate;
