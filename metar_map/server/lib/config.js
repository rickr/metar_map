const yaml = require('js-yaml');
const fs = require('fs');

class Config {
  static data(){
    const fileName = __dirname + '/../../config/metar_map_config.yml';
    const config = yaml.safeLoad(fs.readFileSync(fileName, 'utf8'));
    return config
  }
}

module.exports = Config.data();

