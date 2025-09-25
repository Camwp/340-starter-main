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


async function addClassification(classification_name) {
    const sql = `
    INSERT INTO public.classification (classification_name)
    VALUES ($1)
    RETURNING classification_id, classification_name;
  `
    const result = await pool.query(sql, [classification_name])
    return result.rows[0] || null
}

async function addInventory(v) {
    const sql = `
    INSERT INTO public.inventory
      (inv_make, inv_model, inv_year, inv_description,
       inv_image, inv_thumbnail, inv_price, inv_miles, classification_id)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING inv_id;
  `
    const params = [
        v.inv_make,
        v.inv_model,
        Number(v.inv_year),
        v.inv_description,
        v.inv_image,
        v.inv_thumbnail,
        Number(v.inv_price),
        Number(v.inv_miles),
        Number(v.classification_id),
    ]
    const result = await pool.query(sql, params)
    return result.rows[0] || null
}

/* If you don’t already have it from A3: */

async function getInventoryById(inv_id) {
    const q = `
    SELECT inv_id, inv_make, inv_model, inv_year, inv_price, inv_miles,
           inv_description, inv_image, inv_thumbnail

    FROM public.inventory
    WHERE inv_id = $1
    LIMIT 1;

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

    getInventoryById,   // ensure this is exported
    addClassification,
    addInventory

    getInventoryById,
}
