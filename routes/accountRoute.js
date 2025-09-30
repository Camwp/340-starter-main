const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

router.get(
    "/login",
    utilities.handleErrors(accountController.buildLogin)
);

router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
)

router.get(
    "/register",
    utilities.handleErrors(accountController.buildRegister)
);

router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

// Default account landing (requires login)
router.get(
    "/",
    regValidate.checkLoginData,                                    // <-- gate access
    utilities.handleErrors(accountController.buildAccount)
);

router.post("/logout", utilities.handleErrors(accountController.accountLogout));

module.exports = router
