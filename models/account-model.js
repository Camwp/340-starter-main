const pool = require("../database/");

async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
    try {
        const sql = `
      INSERT INTO account
        (account_firstname, account_lastname, account_email, account_password, account_type)
      VALUES ($1, $2, $3, $4, 'Client')
      RETURNING *`;
        return await pool.query(sql, [
            account_firstname,
            account_lastname,
            account_email,
            account_password,
        ]);
    } catch (error) {
        return error.message;
    }
}

async function checkExistingEmail(account_email) {
    try {
        const sql = "SELECT 1 FROM account WHERE account_email = $1";
        const email = await pool.query(sql, [account_email]);
        return email.rowCount;
    } catch (error) {
        return error.message;
    }
}

async function getAccountByEmail(account_email) {
    try {
        const result = await pool.query(
            `SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password
         FROM account
        WHERE account_email = $1`,
            [account_email]
        );
        return result.rows[0];
    } catch (error) {
        return new Error("No matching email found");
    }
}



async function getAccountById(account_id) {
    const { rows } = await pool.query(
        `SELECT account_id, account_firstname, account_lastname, account_email, account_type
       FROM account
      WHERE account_id = $1`,
        [Number(account_id)]
    );
    return rows[0] || null;
}

async function emailTakenByAnother(account_email, account_id) {
    const { rowCount } = await pool.query(
        `SELECT 1 FROM account
      WHERE account_email = $1 AND account_id <> $2`,
        [account_email, Number(account_id)]
    );
    return rowCount > 0;
}

async function updateAccount({ account_id, account_firstname, account_lastname, account_email }) {
    const { rows } = await pool.query(
        `UPDATE account
        SET account_firstname = $1,
            account_lastname  = $2,
            account_email     = $3
      WHERE account_id = $4
      RETURNING account_id`,
        [account_firstname, account_lastname, account_email, Number(account_id)]
    );
    return rows[0] || null;
}

async function updatePassword({ account_id, account_password }) {
    const { rows } = await pool.query(
        `UPDATE account
        SET account_password = $1
      WHERE account_id = $2
      RETURNING account_id`,
        [account_password, Number(account_id)]
    );
    return rows[0] || null;
}

module.exports = {
    registerAccount,
    checkExistingEmail,
    getAccountByEmail,
    getAccountById,
    emailTakenByAnother,
    updateAccount,
    updatePassword,
};
