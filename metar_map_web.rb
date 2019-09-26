$LOAD_PATH << File.join(File.dirname(__FILE__))

require 'sinatra/base'
require "sinatra/reloader"
require 'metar_map'
require 'metar_map_job'

class MetarMapWeb < Sinatra::Base
  set :bind, '0.0.0.0'

  configure :development do
    register Sinatra::Reloader
    set :logging, nil
    logger = Logger.new STDOUT
    logger.level = Logger::INFO
    set :logger, logger
  end

  get '/' do
    @metar = Metar.from_disk
    @last_updated = (Time.now - Metar.last_updated).truncate

    erb :index
  end

  def self.run!
    begin
      MetarMapJob.perform_async
    rescue
      MetarMapJob.perform_async
    end
    super
  end

  run! if app_file == $0
end

