$LOAD_PATH << File.join(File.dirname(__FILE__), 'lib')

require 'airport'
require 'led_string'
require 'utils'
require 'sucker_punch'
require 'yaml'

class MetarMap
  include SuckerPunch::Job

  CONFIG_FILENAME = 'metar_map_config.yaml'
  CONFIG_FILE = File.join(File.dirname(__FILE__), 'config', CONFIG_FILENAME)

  attr_reader :airports, :metar, :last_updated, :config

  def self.airports
    config = YAML.load(File.read(CONFIG_FILE))
    config[:airports]
  end

  def self.config
    config = YAML.load(File.read(CONFIG_FILE))
  end

  def initialize
    @config = read_config!

    @lights = LedString.create(led_count: config[:airports].count, brightness: config[:led][:brightness])
    @airports = []
    @metar = Metar.new(ids: config[:airports])
    @last_updated = Time.now

    fetch_metars!
    create_airports!

    # FIXME Change back from seconds to min
    logger.info "Updating in #{config[:update_rate]}"
    MetarMapJob.perform_in(config[:update_rate])
  end

  private

  def logger
    if Object.const_defined? 'MetarMapWeb'
      MetarMapWeb.settings.logger
    else
      Logger.new STDOUT
    end
  end

  def fetch_metars!
    logger.info "   Currently #{Time.now}"
    logger.info "Last updated #{last_updated}"
    @metar.fetch
  end

  def last_updated
    File.mtime(Metar::METAR_FILE)
  rescue
    nil
  end

  def create_airports!
    @config[:airports].each_with_index do |airport, i|
      @airports << Airport.new(id: airport, index: i, metar: @metar.for_airport(id: airport), lights: @lights, colors: config[:led][:colors])
    end

    @lights.show
  end

  def read_config!
    config = YAML.load(File.read(CONFIG_FILE))
    # TODO Create config validation
    puts config
    config
  end
end

