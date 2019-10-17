const yaml = require('js-yaml');
const fs = require('fs');

class Config {
  static data(){
    const defaultFileName = __dirname + '/../../config/metar_map_config.yml';
    const localFileName = __dirname + '/../../config/metar_map_config.local.yml';
    const defaultConfig = yaml.safeLoad(fs.readFileSync(defaultFileName, 'utf8'));
    const localConfig = yaml.safeLoad(fs.readFileSync(localFileName, 'utf8'));
    let config = {...defaultConfig, ...localConfig };
    return config;
  }
}

module.exports = Config.data();

