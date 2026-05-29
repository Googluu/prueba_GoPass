const supabase = require('../config/supabase');

async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ status: 'error', message: 'Token de autenticación requerido.' });
  }

  const token = header.slice(7);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({ status: 'error', message: 'Token inválido o expirado.' });
  }

  req.user = data.user;
  next();
}

module.exports = { requireAuth };
