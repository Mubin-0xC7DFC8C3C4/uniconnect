const pool = require('../config/db');

async function writeAudit(actorId, action, record, reason, db = pool) {
  await db.execute(
    'INSERT INTO audit_logs (actor_id, action, record, reason) VALUES (?, ?, ?, ?)',
    [
      actorId,
      action,
      record ? String(record).slice(0, 100) : null,
      reason ? String(reason).slice(0, 255) : null
    ]
  );
}

module.exports = { writeAudit };