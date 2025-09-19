exports.triggerIntentionalError = (req, res, next) => {
    const err = new Error("Intentional 500 test error")
    err.status = 500
    next(err)
}
