require 'net/http'
require 'xmlsimple'

class Metar
  API_URL = 'https://www.aviationweather.gov/adds/dataserver_current/httpparam'
  PARAMS = { dataSource: :metars, requestType: :retrieve, format: :xml, hoursBeforeNow: 3, mostRecent: true }

  attr_reader :id, :data

  def initialize(id:)
    @id = id
  end

  def fetch
    xml_data = Net::HTTP.get_response(url).body
    data = XmlSimple.xml_in xml_data
    @data = data['data'][0]['METAR'].first
  end

  def flight_category
    fetch if data.nil?
    data['flight_category'].first
  end

  private

  def url
    uri = URI.parse(API_URL)
    uri.query = URI.encode_www_form(url_params)
    uri
  end

  def url_params
    PARAMS.to_a << [:stationString, id]
  end
end
