
const { getDb } = require('./_db');
const { verifySession } = require('./_auth');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const sql = await getDb();

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT data FROM store_config WHERE id = 1
      `;

      return res.status(200).json({
        config: rows[0]?.data || {}
      });
    }

    if (req.method === 'PUT') {
      if (!verifySession(req)) {
        return res.status(401).json({
          error: 'Sesión no autorizada'
        });
      }

      const config = req.body || {};

      await sql`
        INSERT INTO store_config (id, data)
        VALUES (1, ${JSON.stringify(config)}::jsonb)
        ON CONFLICT (id)
        DO UPDATE SET data = EXCLUDED.data
      `;

      return res.status(200).json({
        ok: true
      });
    }

    res.setHeader('Allow', 'GET, PUT, OPTIONS');

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

