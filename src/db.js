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

db.exec(`
  CREATE TABLE IF NOT EXISTS itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    descricao TEXT,
    tipo TEXT,         -- 'pronta_entrega' || 'conversa'
    preco INTEGER,
    estoque INTEGER DEFAULT 0,   -- usado para itens de pronta entrega (e opcional para itens de conversa)
    recompensa TEXT    -- exemplo: código de gift card, apenas para itens de pronta entrega
  )
`);

module.exports = db;
