require 'net/http'
require 'xmlsimple'

class Metar
  API_URL = 'https://www.aviationweather.gov/adds/dataserver_current/httpparam'
  PARAMS = { dataSource: :metars, requestType: :retrieve, format: :xml, hoursBeforeNow: 3, mostRecentForEachStation: true }
  METAR_FILE = '/tmp/metar'

  attr_reader :ids, :data, :metars

  def self.last_updated
    File.mtime(METAR_FILE)
  end

  def self.from_disk
    metars = Metar.new(ids: 'none')
    metars.parse_metar_xml(xml_data: File.read(METAR_FILE))
    metars.metars
  end

  def initialize(ids:)
    @ids = ids
    validate_ids!
    @metars = {}
  end

  def for_airport(id:)
    metars[id.to_sym]
  end

  def fetch
    xml_data = Net::HTTP.get_response(url).body

    write_to_file xml_data

    parse_metar_xml(xml_data: xml_data)
  end

  def fetched?
    data
  end

  def parse_metar_xml(xml_data:)
    data = XmlSimple.xml_in xml_data
    data['data'][0]['METAR'].each do |d|
      metar = Data.new(data: d)
      @metars[metar.station_id.to_sym] = metar
    end
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

  def write_to_file(data)
    File.open(METAR_FILE, 'w') { |f| f.write data }
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
      return 'VFR' if data['sky_condition']&.first['sky_cover']
    end

    # Return a CSS class for use in the UI
    def css_class
      case flight_category
      when 'VFR'
        'is-success'
      when 'IFR'
        'is-danger'
      when 'MARGINAL'
        'is-info'
      else
        'is-dark'
      end
    end
  end
end

