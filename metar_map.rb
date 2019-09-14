$LOAD_PATH << File.join(File.dirname(__FILE__), 'lib')

require 'airport'
require 'led_string'
require 'utils'
require 'sucker_punch'

class MetarMap
  include SuckerPunch::Job

  # Has many airports
  AIRPORTS = %i[KHZL KISP KHPN KBDR KFOK KFRG KJFK KLGA KHTO]

  # Config Opts
  VFR_COLOR = [04, 166, 14]
  MARGINAL_COLOR = [03, 46, 241]
  IFR_COLOR = [196, 0, 0]
  BRIGHTNESS = 10

  UPDATE_IN = 1.minutes

  attr_reader :airports, :metar, :last_updated

  def initialize
    @lights = LedString.new(led_count: AIRPORTS.count)
    @airports = []
    @metar = Metar.new(ids: AIRPORTS)
    @last_updated = Time.now

    fetch_metars!
    create_airports!

    puts "Updating in #{UPDATE_IN}"
    MetarMapJob.perform_in(UPDATE_IN)
  end

  private

  def fetch_metars!
    puts "   Currently #{Time.now}"
    puts "Last updated #{last_updated}"
    @metar.fetch
  end

  def last_updated
    File.mtime(Metar::METAR_FILE)
  rescue
    nil
  end

  def create_airports!
    AIRPORTS.each_with_index do |airport, i|
      @airports << Airport.new(id: airport, index: i, metar: @metar.for_airport(id: airport), lights: @lights)
    end

    @lights.show
  end
end

