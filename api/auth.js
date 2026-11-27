
const {
  setSessionCookie,
  clearSessionCookie,
  verifySession
} = require('./_auth');

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      authenticated: verifySession(req)
    });
  }

  if (req.method === 'POST') {
    const { key } = req.body || {};

    if (
      !process.env.ADMIN_KEY ||
      typeof key !== 'string' ||
      key !== process.env.ADMIN_KEY
    ) {
      return res.status(401).json({
        error: 'Clave incorrecta'
      });
    }

    setSessionCookie(res);

    return res.status(200).json({
      ok: true,
      authenticated: true
    });
  }

  if (req.method === 'DELETE') {
    clearSessionCookie(res);

    return res.status(200).json({
      ok: true,
      authenticated: false
    });
  }

  res.setHeader('Allow', 'GET, POST, DELETE, OPTIONS');

  return res.status(405).json({
    error: 'Método no permitido'
  });
};
