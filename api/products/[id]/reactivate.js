
const { getDb } = require('../../_db');
const { verifySession } = require('../../_auth');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');

    return res.status(405).json({
      error: 'Método no permitido'
    });
  }

  if (!verifySession(req)) {
    return res.status(401).json({
      error: 'Sesión no autorizada'
    });
  }

  const { id } = req.query;

  try {
    const sql = await getDb();

    await sql`
      UPDATE products
      SET activo = true
      WHERE id = ${id}
    `;

    return res.status(200).json({
      ok: true
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: err.message
    });
  }
};

