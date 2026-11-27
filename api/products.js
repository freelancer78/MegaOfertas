
const { getDb } = require('./_db');
const { verifySession } = require('./_auth');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    if (req.method === 'GET') {
      const { admin } = req.query;

      const isAdmin = admin === '1';

      if (isAdmin && !verifySession(req)) {
        return res.status(401).json({
          error: 'Sesión no autorizada'
        });
      }

      const sql = await getDb();

      const rows = isAdmin
        ? await sql`
            SELECT * FROM products
            ORDER BY orden ASC, created_at ASC
          `
        : await sql`
            SELECT * FROM products
            WHERE activo = true
            ORDER BY orden ASC, created_at ASC
          `;

      return res.status(200).json({
        products: rows.map(parseRow)
      });
    }

    if (req.method === 'POST') {
      if (!verifySession(req)) {
        return res.status(401).json({
          error: 'Sesión no autorizada'
        });
      }

      const { product } = req.body || {};
      const p = product || {};

      const sql = await getDb();

      const id =
        Date.now().toString(36) +
        Math.random().toString(36).slice(2, 6);

      const imagenes = JSON.stringify(
        Array.isArray(p.imagenes) ? p.imagenes : []
      );

      const pasos = JSON.stringify(
        Array.isArray(p.pasos) ? p.pasos : [1]
      );

      await sql`
        INSERT INTO products
          (
            id, nombre, descripcion, precio, imagenes,
            categoria, stock, min_unidades, pasos,
            variantes, variantes_label, activo, orden
          )
        VALUES (
          ${id},
          ${p.nombre || ''},
          ${p.descripcion || ''},
          ${parseFloat(p.precio) || 0},
          ${imagenes},
          ${p.categoria || ''},
          ${parseInt(p.stock) || 0},
          ${parseInt(p.min_unidades) || 1},
          ${pasos},
          ${p.variantes || ''},
          ${p.variantes_label || ''},
          true,
          ${parseInt(p.orden) || 0}
        )
      `;

      return res.status(200).json({
        ok: true,
        id
      });
    }

    res.setHeader('Allow', 'GET, POST, OPTIONS');

    return res.status(405).json({
      error: 'Método no permitido'
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: err.message
    });
  }
};

function parseRow(row) {
  return {
    ...row,
    precio: parseFloat(row.precio),
    stock: parseInt(row.stock),
    min_unidades: parseInt(row.min_unidades),
    orden: parseInt(row.orden),
    imagenes: tryParse(row.imagenes, []),
    pasos: tryParse(row.pasos, [1])
  };
}

function tryParse(val, fallback) {
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}
