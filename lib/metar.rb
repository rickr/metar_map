require 'net/http'
require 'xmlsimple'

class Metar
  API_URL = 'https://www.aviationweather.gov/adds/dataserver_current/httpparam'
  PARAMS = { dataSource: :metars, requestType: :retrieve, format: :xml, hoursBeforeNow: 3, mostRecentForEachStation: true }
  REFRESH_AFTER = 60 * 30

  attr_reader :ids, :data, :metars

  def initialize(ids:)
    @ids = ids
    validate_ids!
    @metars = {}
    @last_updated = 0
  end

  def validate_ids!
    @ids = [ ids ] if ids.is_a?(String) || ids.is_a?(Symbol)
    raise "ids must be a string or array of airport IDs (strings). Got #{ids.class}" unless ids.is_a? Array
  end

  def for_airport(id:)
    metars[id.to_sym]
  end

  def fetch
    xml_data = Net::HTTP.get_response(url).body
    data = XmlSimple.xml_in xml_data
    data['data'][0]['METAR'].each do |d|
      metar = Data.new(data: d)
      @metars[metar.station_id.to_sym] = metar
    end
    @last_updated = Time.now
  end

  def fetched?
    data
  end

  def refresh?
    Time.now - @last_updated > REFRESH_AFTER
  end

  private

  def url
    uri = URI.parse(API_URL)
    uri.query = URI.encode_www_form(url_params)
    uri
  end

  def url_params
    PARAMS.to_a << [:stationString, ids.join(' ')]
  end
end

class Metar
  class Data
    module MetarItems
      def metar_item(*names)
        names.each do |name|
          define_method(name) do
            data[name.to_s].first
          end
        end
      end
    end

    extend MetarItems

    FIELDS = %i[
      raw_text
      station_id
      observation_time
      temp_c
      dewpoint_c
      wind_dir_degrees
      wind_speed_kt
      visibility_statute_mi
      altim_in_hg
      flight_category
    ]

    attr_reader :data
    metar_item(*FIELDS)

    def initialize(data:)
      @data = data
    end
  end
end
