class MetarMapDb {
  static DB_PATH() { return process.cwd() + "/db/metar_map.db"; }

  constructor() {
    const sqlite3 = require("sqlite3").verbose();

    this.db = new sqlite3.Database(MetarMapDb.DB_PATH(), (err) => {
      if (err) {
        console.error(err.message);
        return false;
      }
      this.db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
        if (err) {
          console.error(err.message);
          return false;
        }
        if(rows.length == 0){
          console.log("Empty table")
          this.db.run("CREATE TABLE maps(id text unique, version text, internal_ip text, external_ip text, last_updated integer);", (err, rows) => {
            console.log("Created table");
          });
        }
      });
      console.log("Connected to the MetarMap database at ", MetarMapDb.DB_PATH());
    });
  }

  runQuery(query) {
    this.db.all(query, function(err, rows){
      if (err) {
        console.error(err.message);
        return false;
      }
      return rows
    });
  }

  update(data) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * from maps where id = ?";
      this.db.all(query, [data.id], (err, row) => {
        if(row.length){
          console.log(`ID ${data.id} already exists`);
          const query = "UPDATE maps SET version=?, internal_ip=?, external_ip=?, last_updated=? WHERE id = ?"
          this.db.run(query, [data.version, data.internal_ip, data.external_ip, data.last_updated, data.id], function(err, rows){
            if(err){
              reject(err.message)
            } else {
              console.log(`Rows updated ${this.changes}`);
              resolve(rows);
            }
          })
        } else {
          console.log("Inserting data")
          this.db.run("INSERT INTO maps VALUES(?, ?, ?, ?, ?)", [data.id, data.version, data.internal_ip, data.external_ip, data.last_updated]), function(err){
            if(err){
              reject(err.message)
            } else {
              console.log(this.db.lastID);
              resolve(row);
            }
          }
        }
      });
    });
  }

  find(ip) {
    return new Promise((resolve, reject) => {
      const query = "SELECT * from maps where external_ip = ?";
      this.db.all(query, [ip], (err, row) => {
        resolve(row);
      });
    });
  }
}

module.exports = MetarMapDb;
