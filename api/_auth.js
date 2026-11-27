
const crypto = require('crypto');

const COOKIE_NAME = 'mega_admin_session';
const SESSION_DURATION = 8 * 60 * 60;

function createSignature(payload) {
  return crypto
    .createHmac('sha256', process.env.ADMIN_KEY)
    .update(payload)
    .digest('base64url');
}

function createSession() {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + SESSION_DURATION
    })
  ).toString('base64url');

  return `${payload}.${createSignature(payload)}`;
}

function verifySession(req) {
  const cookieHeader = req.headers.cookie || '';

  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(cookie => {
      const index = cookie.indexOf('=');
      if (index < 0) return ['', ''];

      return [
        cookie.slice(0, index).trim(),
        cookie.slice(index + 1).trim()
      ];
    })
  );

  const token = cookies[COOKIE_NAME];
  if (!token || !process.env.ADMIN_KEY) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  const expected = createSignature(payload);

  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  if (
    receivedBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  ) {
    return false;
  }

  try {
    const data = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    );

    return Number.isFinite(data.exp) &&
      data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function setSessionCookie(res) {
  const token = createSession();

  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_DURATION}`
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
  );
}

module.exports = {
  createSession,
  verifySession,
  setSessionCookie,
  clearSessionCookie
};
