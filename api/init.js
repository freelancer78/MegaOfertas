
const { neon } = require('@neondatabase/serverless');
const { verifySession } = require('./_auth');

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

  try {
    const sql = neon(process.env.DATABASE_URL);

    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL DEFAULT '',
        descripcion TEXT DEFAULT '',
        precio NUMERIC(12,2) NOT NULL DEFAULT 0,
        imagenes TEXT DEFAULT '[]',
        categoria TEXT DEFAULT '',
        stock INTEGER DEFAULT 0,
        min_unidades INTEGER DEFAULT 1,
        pasos TEXT DEFAULT '[1]',
        variantes TEXT DEFAULT '',
        variantes_label TEXT DEFAULT '',
        activo BOOLEAN DEFAULT true,
        orden INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS store_config (
        id INTEGER PRIMARY KEY DEFAULT 1,
        data JSONB DEFAULT '{}'
      )
    `;

    await sql`
      INSERT INTO store_config (id, data)
      VALUES (1, '{}')
      ON CONFLICT DO NOTHING
    `;

    return res.status(200).json({
      ok: true,
      message: 'Tablas creadas correctamente'
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: err.message
    });
  }
};
