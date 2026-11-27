
const { getDb } = require('../_db');
const { verifySession } = require('../_auth');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (!verifySession(req)) {
    return res.status(401).json({
      error: 'Sesión no autorizada'
    });
  }

  const { id } = req.query;

  try {
    const sql = await getDb();

    if (req.method === 'PUT') {
      const { product: p } = req.body || {};

      if (!p) {
        return res.status(400).json({
          error: 'Datos del producto no recibidos'
        });
      }

      const imagenes = JSON.stringify(
        Array.isArray(p.imagenes) ? p.imagenes : []
      );

      const pasos = JSON.stringify(
        Array.isArray(p.pasos) ? p.pasos : [1]
      );

      await sql`
        UPDATE products SET
          nombre = ${p.nombre || ''},
          descripcion = ${p.descripcion || ''},
          precio = ${parseFloat(p.precio) || 0},
          imagenes = ${imagenes},
          categoria = ${p.categoria || ''},
          stock = ${parseInt(p.stock) || 0},
          min_unidades = ${parseInt(p.min_unidades) || 1},
          pasos = ${pasos},
          variantes = ${p.variantes || ''},
          variantes_label = ${p.variantes_label || ''},
          orden = ${parseInt(p.orden) || 0}
        WHERE id = ${id}
      `;

      return res.status(200).json({
        ok: true
      });
    }

    if (req.method === 'DELETE') {
      await sql`
        UPDATE products
        SET activo = false
        WHERE id = ${id}
      `;

      return res.status(200).json({
        ok: true
      });
    }

    res.setHeader('Allow', 'PUT, DELETE, OPTIONS');

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
