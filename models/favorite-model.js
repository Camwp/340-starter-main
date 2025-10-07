const pool = require("../database");

async function addFavorite({ account_id, inv_id }) {
    const { rows } = await pool.query(
        `INSERT INTO favorite (account_id, inv_id)
     VALUES ($1, $2)
     ON CONFLICT (account_id, inv_id) DO NOTHING
     RETURNING favorite_id`,
        [Number(account_id), Number(inv_id)]
    );
    return rows[0] || null; // null means it already existed
}

async function removeFavorite({ account_id, inv_id }) {
    const { rowCount } = await pool.query(
        `DELETE FROM favorite WHERE account_id = $1 AND inv_id = $2`,
        [Number(account_id), Number(inv_id)]
    );
    return rowCount > 0;
}

async function isFavorite(account_id, inv_id) {
    const { rowCount } = await pool.query(
        `SELECT 1 FROM favorite WHERE account_id = $1 AND inv_id = $2`,
        [Number(account_id), Number(inv_id)]
    );
    return rowCount > 0;
}

async function listByAccount(account_id) {
    const { rows } = await pool.query(
        `SELECT f.favorite_id, f.created_at,
            i.inv_id, i.inv_make, i.inv_model, i.inv_year, i.inv_price, i.inv_thumbnail
       FROM favorite f
       JOIN inventory i ON i.inv_id = f.inv_id
      WHERE f.account_id = $1
      ORDER BY f.created_at DESC`,
        [Number(account_id)]
    );
    return rows;
}

async function countForVehicle(inv_id) {
    const { rows } = await pool.query(
        `SELECT COUNT(*)::int AS cnt FROM favorite WHERE inv_id = $1`,
        [Number(inv_id)]
    );
    return rows[0]?.cnt ?? 0;
}

module.exports = {
    addFavorite,
    removeFavorite,
    isFavorite,
    listByAccount,
    countForVehicle,
};
