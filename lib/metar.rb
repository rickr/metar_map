require 'net/http'
require 'xmlsimple'

class Metar
  API_URL = 'https://www.aviationweather.gov/adds/dataserver_current/httpparam'
  PARAMS = { dataSource: :metars, requestType: :retrieve, format: :xml, hoursBeforeNow: 3, mostRecentForEachStation: true }

  attr_reader :ids, :data, :metars

  def initialize(ids:)
    @ids = ids
    validate_ids!
    @metars = {}
    @last_updated = 0
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

  private

  def validate_ids!
    @ids = [ ids ] if ids.is_a?(String) || ids.is_a?(Symbol)
    raise "ids must be a string or array of airport IDs (strings). Got #{ids.class}" unless ids.is_a? Array
  end

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
            return nil if data[name.to_s].nil?
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

    def flight_category
      return data['flight_category'].first unless data['flight_category'].nil?
      # Hack to fix this METAR that broke VFR flight category:
      # KFOK 111853Z COR 230/15G21KT 10SMSM CLR 75/68 A3009
      return 'VFR' if data['sky_condition'].first['sky_cover']
    end
  end
end

