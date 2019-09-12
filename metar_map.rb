$LOAD_PATH << File.join(File.dirname(__FILE__), 'lib')
require 'airport'
require 'utils'
require 'sucker_punch'

class MetarMap
  include SuckerPunch::Job

  # Has many airports
  AIRPORTS = %i[KISP KHWV KBDR KFOK KFRG KJFK KLGA KHTO]

  # Config Opts
  VFR_COLOR = '04,166,14'
  MARGINAL_COLOR = '03,46,241'
  IFR_COLOR = '196,0,0'

  #UPDATE_IN = 15.minutes
  UPDATE_IN = 5

  attr_reader :airports, :metar, :last_updated

  def initialize
    @airports = []
    @metar = Metar.new(ids: AIRPORTS)
    @last_updated = Time.now
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

