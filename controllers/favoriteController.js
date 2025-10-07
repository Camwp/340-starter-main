const utilities = require("../utilities");
const favoriteModel = require("../models/favorite-model");

const fav = {};

// GET /account/garage
fav.buildGarage = utilities.handleErrors(async (req, res) => {
    const nav = await utilities.getNav();
    const account = res.locals.accountData;
    const items = await favoriteModel.listByAccount(account.account_id);

    res.render("account/garage", {
        title: "My Garage",
        nav,
        items,
        utilities,
        account,
        errors: null,
        notice: req.flash("notice"),
    });
});

// POST /account/favorites/:invId
fav.add = utilities.handleErrors(async (req, res) => {
    const account = res.locals.accountData;
    const invId = Number(req.params.invId);

    await favoriteModel.addFavorite({ account_id: account.account_id, inv_id: invId });
    req.flash("notice", "Saved to your garage.");
    res.redirect(`/inv/detail/${invId}`);
});

// POST /account/favorites/:invId/delete
fav.remove = utilities.handleErrors(async (req, res) => {
    const account = res.locals.accountData;
    const invId = Number(req.params.invId);

    await favoriteModel.removeFavorite({ account_id: account.account_id, inv_id: invId });
    req.flash("notice", "Removed from your garage.");
    res.redirect(`/inv/detail/${invId}`);
});

module.exports = fav;
