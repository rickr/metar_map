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

  # Filters
  before do
    @title = 'METAR Map Web'
  end

  # Routes
  get '/' do
    @metar = Metar.from_disk
    @last_updated = (Time.now - Metar.last_updated).truncate

    airports = params[:show] ? params[:show].split(',') : MetarMap.airports
    airports = [airports] unless airports.is_a? Array

    # Fix this!!!
    @metars = airports.flat_map.collect do |airport|
      @metar.find do |key, value|
        key == airport.upcase.to_sym
      end
    end
    @metars = @metars.reject { |m| m.nil? }

    erb :index
  end

  get '/settings' do
    add_to_title 'Settings'
    erb :settings
  end

  def add_to_title(content)
    @title += " | #{content}"
    @config = MetarMap.config
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

