require_relative 'airport'

class MetarMap
  # Has many airports
  # Config Opts
  AIRPORTS = %i[KISP KHWV KBDR KFOK]

  attr_reader :airports

  def initialize
    @airports = []
    @metar = Metar.new(ids: AIRPORTS)
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
