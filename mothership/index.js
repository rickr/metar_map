class MetarMapMothershipServer {
  constructor() {
    const express = require("express");
    const MetarMapDb = require("./lib/metar_map_db");
    this.app = express();
    this.app.use(express.json())
    this.port = process.env.METAR_MAP_ENV == 'production' ? 80 : 4567;
    this.db = new MetarMapDb();
  }

  start() {
    this.registerPaths();
    this.app.listen(this.port, () => {
      console.log("Server started at http://localhost:%i", this.port);
    });
  }

  metaTag(ip){
    return '<meta http-equiv="Refresh" content="0; url=http://' + ip + '" />'
  }

  registerPaths() {
    this.redirectorPath();
    this.dataGathererPath();
  }

  dataGathererPath() {
    // This takes a post with the version and internal ip and 
    // stores it in the db with the remote ip
    this.app.post("/", (req, res) => {
      let data = req.body
      data.external_ip = req.ip;
      data.last_updated = Date.now();
      console.log(data);
      this.db.update(data);
      res.send("ok\n");
    });
  }

  redirectorPath() {
    // FIXME Handle errors
    this.app.get("/", (req, res) => {
      this.db.find(req.ip).then((result) => {
        if(result.length) { 
          res.send(this.metaTag(result[0].internal_ip))
        }else{
          res.send("Your IP " + req.ip + " was not found in the mothership database");
        }
      });
    });
  }
}

(new MetarMapMothershipServer()).start();
