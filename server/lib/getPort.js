function getPort(){ return process.env.METAR_MAP_ENV == 'production' ? 80 : 4567 }

module.exports = getPort

