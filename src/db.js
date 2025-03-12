const Database = require('better-sqlite3');
const db = new Database('database.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS jogadores (
    discord_id TEXT PRIMARY KEY,
    nome TEXT,
    level INTEGER,
    xp INTEGER DEFAULT 0,
    partidas INTEGER,
    kills INTEGER,
    vitorias INTEGER,
    posicao INTEGER,
    pontos INTEGER DEFAULT 0
  )
`);

module.exports = db;
