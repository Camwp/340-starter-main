// models/inventory-model.js
const pool = require("../database/");

/* ===== Classifications ===== */

async function getClassifications() {
  // returns { rows: [...] } – other code expects .rows
  return await pool.query(
    "SELECT classification_id, classification_name FROM public.classification ORDER BY classification_name"
  );
}

async function getClassificationById(classification_id) {
  const { rows } = await pool.query(
    "SELECT classification_id, classification_name FROM public.classification WHERE classification_id = $1",
    [classification_id]
  );
  return rows[0] || null;
}

async function addClassification(classification_name) {
  const sql = `
    INSERT INTO public.classification (classification_name)
    VALUES ($1)
    RETURNING classification_id, classification_name;
  `;
  const { rows } = await pool.query(sql, [classification_name]);
  return rows[0] || null;
}

async function updateClassificationName(classification_id, classification_name) {
  // returns number of rows updated (1 on success, 0 on not found / conflict handling below)
  try {
    const { rowCount } = await pool.query(
      "UPDATE public.classification SET classification_name = $1 WHERE classification_id = $2",
      [classification_name, classification_id]
    );
    return rowCount;
  } catch (e) {
    // 23505 = unique_violation (if you have a UNIQUE constraint on classification_name)
    if (e.code === "23505") return 0;
    throw e;
  }
}

async function deleteClassification(classification_id) {
  // returns number of rows deleted (1 on success)
  try {
    const { rowCount } = await pool.query(
      "DELETE FROM public.classification WHERE classification_id = $1",
      [classification_id]
    );
    return rowCount;
  } catch (e) {
    // 23503 = foreign_key_violation (still referenced by inventory)
    if (e.code === "23503") return 0;
    throw e;
  }
}

/* Optional: faster pre-delete check */
async function getInventoryCountByClassificationId(classification_id) {
  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS count FROM public.inventory WHERE classification_id = $1",
    [classification_id]
  );
  return rows[0]?.count ?? 0;
}

/* ===== Inventory ===== */

async function getInventoryByClassificationId(classification_id) {
  const q = `
    SELECT i.*, c.classification_name
      FROM public.inventory AS i
      JOIN public.classification AS c
        ON i.classification_id = c.classification_id
     WHERE i.classification_id = $1
     ORDER BY i.inv_make, i.inv_model
  `;
  const { rows } = await pool.query(q, [classification_id]);
  return rows;
}

async function addInventory(v) {
  const sql = `
    INSERT INTO public.inventory
      (inv_make, inv_model, inv_year, inv_description,
       inv_image, inv_thumbnail, inv_price, inv_miles, classification_id)
    VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING inv_id;
  `;
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
  ];
  const { rows } = await pool.query(sql, params);
  return rows[0] || null;
}

async function getInventoryById(inv_id) {
  const q = `
    SELECT inv_id, inv_make, inv_model, inv_year, inv_price, inv_miles,
           inv_description, inv_image, inv_thumbnail, classification_id
      FROM public.inventory
     WHERE inv_id = $1
     LIMIT 1
  `;
  const { rows } = await pool.query(q, [inv_id]);
  return rows[0] || null;
}

module.exports = {
  // classifications
  getClassifications,
  getClassificationById,
  addClassification,
  updateClassificationName,
  deleteClassification,
  getInventoryCountByClassificationId, // optional, but handy

  // inventory
  getInventoryByClassificationId,
  addInventory,
  getInventoryById,
};
