// controllers/accountController.js
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcryptjs");

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res) {
    const nav = await utilities.getNav();
    res.render("account/login", { title: "Login", nav, errors: null });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res) {
    const nav = await utilities.getNav();
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
        hashedPassword
    );

    if (regResult && regResult.rows && regResult.rows.length) {
        req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
        return res.redirect("/account/login"); // PRG so flash shows
    }
    req.flash("notice", "Sorry, the registration failed.");
    return res.status(501).render("account/register", { title: "Registration", nav, errors: null });
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    const nav = await utilities.getNav();
    const { account_email, account_password } = req.body;

    const accountData = await accountModel.getAccountByEmail(account_email);
    if (!accountData || accountData instanceof Error) {
        req.flash("notice", "Please check your credentials and try again.");
        return res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        });
    }

    try {
        const ok = await bcrypt.compare(account_password, accountData.account_password);
        if (ok) {
            delete accountData.account_password;

            // IMPORTANT: jsonwebtoken expects seconds or a string, not ms
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

            const cookieOpts = { httpOnly: true, maxAge: 3600 * 1000 };
            if (process.env.NODE_ENV !== "development") Object.assign(cookieOpts, { secure: true });
            res.cookie("jwt", accessToken, cookieOpts);

            return res.redirect("/account/");
        }

        // Wrong password path
        req.flash("notice", "Please check your credentials and try again."); // fixed flash key
        return res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        });
    } catch (error) {
        // will be caught by your global error handler
        throw new Error("Access Forbidden");
    }
}

/* ****************************************
*  Deliver Account Management view
* *************************************** */
async function buildAccount(req, res) {
    const nav = await utilities.getNav();
    const account = res.locals.accountData || null; // set by checkJWTToken
    return res.render("account/management", {
        title: "Account Management",
        nav,
        errors: null,
        account,
    });
}

async function accountLogout(req, res) {

    const cookieOpts = { httpOnly: true };
    if (process.env.NODE_ENV !== "development") cookieOpts.secure = true;

    res.clearCookie("jwt", cookieOpts); // clear auth cookie

    // Regenerate to get a fresh, empty session we can flash into
    if (req.session) {
        req.session.regenerate(err => {
            if (err) return next(err);
            req.flash("notice", "You have been logged out.");
            // If you changed the session cookie name, clear it explicitly if desired:
            // res.clearCookie("sessionId"); // you set name: "sessionId" in express-session
            return res.redirect("/account/login");
        });
    } else {
        return res.redirect("/account/login");
    }
};



module.exports = {
    buildLogin,
    buildRegister,
    registerAccount,
    accountLogin,
    buildAccount,           // <-- export it
    accountLogout,
};
