// controllers/accountController.js
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/login", { title: "Login", nav });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/register", { title: "Register", nav, errors: null });
}

/* ****************************************
*  Process Registration
* *************************************** */

async function registerAccount(req, res) {
    const nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    // hash
    let hashedPassword;
    try {
        hashedPassword = bcrypt.hashSync(account_password, 10);
    } catch (e) {
        req.flash("notice", "Sorry, there was an error processing the registration.");
        return res.status(500).render("account/register", { title: "Registration", nav, errors: null });
    }

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword // ← use hash, not plain text
    );

    if (regResult && regResult.rows && regResult.rows.length) {
        req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
        return res.redirect("/account/login"); // PRG so flash shows
    }
    req.flash("notice", "Sorry, the registration failed.");
    return res.status(501).render("account/register", { title: "Registration", nav, errors: null });
}


module.exports = { buildLogin, buildRegister, registerAccount };
