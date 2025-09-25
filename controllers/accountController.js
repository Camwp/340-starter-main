// controllers/accountController.js
const utilities = require("../utilities");
const accountModel = require("../models/account-model");

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

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        account_password
    );

    // Success only if the INSERT returned a row set
    if (regResult && regResult.rows && regResult.rows.length) {
        req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
        return res.redirect("/account/login"); // PRG pattern so refresh won't resubmit
    }

    // Failure path
    req.flash("notice", "Sorry, the registration failed.");
    return res.status(501).render("errors/error", { title: "Registration", nav });
}


module.exports = { buildLogin, buildRegister, registerAccount };
