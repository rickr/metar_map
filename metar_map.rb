$LOAD_PATH << File.join(File.dirname(__FILE__), 'lib')

require 'airport'

module IntegerWithMinutes
  def minutes
    self * 60
  end
end

class Fixnum
  include IntegerWithMinutes
end

class MetarMap
  # Has many airports
  # Config Opts
  AIRPORTS = %i[KISP KHWV KBDR KFOK]

  VFR_COLOR = '04,166,14'
  MARGINAL_COLOR = '03,46,241'
  IFR_COLOR = '196,0,0'

  REFRESH_AFTER = 15.minutes

  attr_reader :airports

  def initialize
    @airports = []
    @metar = Metar.new(ids: AIRPORTS)
    puts "Update after #{REFRESH_AFTER}"
    fetch_metars!
    create_airports!
  end

  private

  def fetch_metars!
    @metar.fetch
  end

  def create_airports!
    AIRPORTS.each { |airport| @airports << Airport.new(id: airport, metar: @metar.for_airport(id: airport)) }
  end
end
