// controllers/accountController.js
const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const bcrypt = require("bcryptjs");

async function buildLogin(req, res) {
    const nav = await utilities.getNav();
    res.render("account/login", { title: "Login", nav, errors: null });
}

async function buildRegister(req, res) {
    const nav = await utilities.getNav();
    res.render("account/register", { title: "Register", nav, errors: null });
}

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
        return res.redirect("/account/login");
    }
    req.flash("notice", "Sorry, the registration failed.");
    return res.status(501).render("account/register", { title: "Registration", nav, errors: null });
}


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

            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

            const cookieOpts = { httpOnly: true, maxAge: 3600 * 1000 };
            if (process.env.NODE_ENV !== "development") Object.assign(cookieOpts, { secure: true });
            res.cookie("jwt", accessToken, cookieOpts);

            return res.redirect("/account/");
        }

        req.flash("notice", "Please check your credentials and try again.");
        return res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        });
    } catch (error) {
        throw new Error("Access Forbidden");
    }
}


async function buildAccount(req, res) {
    const nav = await utilities.getNav();
    const account = res.locals.accountData || null;
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

    res.clearCookie("jwt", cookieOpts);


    if (req.session) {
        req.session.regenerate(err => {
            if (err) return next(err);
            req.flash("notice", "You have been logged out.");
            res.clearCookie("sessionId");
            return res.redirect("/account/login");
        });
    } else {
        return res.redirect("/account/login");
    }
};



async function buildUpdate(req, res) {
    const nav = await utilities.getNav();
    const id = Number(req.params.accountId);
    const account = await accountModel.getAccountById(id);
    if (!account) { const e = new Error("Account not found"); e.status = 404; throw e; }
    res.render("account/update", {
        title: "Update Account",
        nav,
        account,
        errors: null,
        notice: req.flash("notice"),
    });
}

async function updateAccount(req, res) {
    const nav = await utilities.getNav();
    const { account_id, account_firstname, account_lastname, account_email } = req.body;

    if (await accountModel.emailTakenByAnother(account_email, account_id)) {
        return res.status(400).render("account/update", {
            title: "Update Account",
            nav,
            errors: [{ msg: "That email is already in use." }],
            account: req.body,
            notice: req.flash("notice"),
        });
    }

    const ok = await accountModel.updateAccount({ account_id, account_firstname, account_lastname, account_email });
    req.flash("notice", ok ? "Account updated." : "Update failed.");
    const updated = await accountModel.getAccountById(account_id);
    return res.render("account/management", {
        title: "Account Management",
        nav,
        errors: null,
        account: updated,
        notice: req.flash("notice"),
    });
}

async function changePassword(req, res) {
    const nav = await utilities.getNav();
    const { account_id, account_password } = req.body;

    const hash = bcrypt.hashSync(account_password, 10);
    const ok = await accountModel.updatePassword({ account_id, account_password: hash });
    req.flash("notice", ok ? "Password changed." : "Password change failed.");
    const account = await accountModel.getAccountById(account_id);
    return res.render("account/management", {
        title: "Account Management",
        nav,
        errors: null,
        account,
        notice: req.flash("notice"),
    });
}


module.exports = {
    buildLogin,
    buildRegister,
    registerAccount,
    accountLogin,
    buildAccount,
    accountLogout,
    changePassword,
    updateAccount,
    buildUpdate,
};
