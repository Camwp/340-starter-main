const pool = require("../database/")

async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}


async function getInventoryByClassificationId(classification_id) {
    const q = `
    SELECT * FROM public.inventory AS i
    JOIN public.classification AS c
      ON i.classification_id = c.classification_id
   WHERE i.classification_id = $1
  `
    const data = await pool.query(q, [classification_id])
    return data.rows
}


async function getInventoryById(inv_id) {
    const q = `
    SELECT inv_id, inv_make, inv_model, inv_year, inv_price, inv_miles,
           inv_description, inv_image, inv_thumbnail
      FROM public.inventory
     WHERE inv_id = $1
     LIMIT 1
  `
    const result = await pool.query(q, [inv_id])
    return result.rows[0] || null
}

module.exports = {
    getClassifications,
    getInventoryByClassificationId,
    getInventoryById,
}
