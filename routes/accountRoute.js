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

router.get(
    "/",
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.buildAccount)
);

router.get("/update/:accountId",
    utilities.checkLogin,
    utilities.handleErrors(accountController.buildUpdate)
);

router.post("/update/:accountId",
    utilities.checkLogin,
    regValidate.updateAccountRules(),
    regValidate.checkUpdateAccountData,
    utilities.handleErrors(accountController.updateAccount)
);

router.post("/update-password",
    utilities.checkLogin,
    regValidate.passwordChangeRules(),
    regValidate.checkPasswordChangeData,
    utilities.handleErrors(accountController.changePassword)
);



router.post("/logout", utilities.handleErrors(accountController.accountLogout));

module.exports = router
