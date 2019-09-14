$LOAD_PATH << File.join(File.dirname(__FILE__))

require 'sinatra/base'
require "sinatra/reloader"
require 'metar_map'
require 'metar_map_job'

class MetarMapWeb < Sinatra::Base
  set :bind, '0.0.0.0'

  configure :development do
    register Sinatra::Reloader
  end

  get '/' do
    metar = Metar.from_disk

    page = metar.metars.collect { |m| "#{m[1].station_id}: #{m[1].flight_category} #{m[1].raw_text} <br />" }
    page << "<br />Last updated: #{(Time.now - Metar.last_updated).truncate} seconds ago"
  end

  def self.run!
    MetarMapJob.perform_async
    super
  end

  run! if app_file == $0
end

