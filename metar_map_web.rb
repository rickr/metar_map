$LOAD_PATH << File.join(File.dirname(__FILE__))

require 'sinatra/base'
require "sinatra/reloader"
require 'metar_map'


class MetarMapWeb < Sinatra::Base
  set :bind, '0.0.0.0'

  configure :development do
    register Sinatra::Reloader
  end

  get '/' do
    #@metar = ::MetarMap.new
    m = ::MetarMap.new
    m.airports.collect { |a| "#{a.raw_text} <br />" }
  end


  def run!
    1/0
    super
  end

  run! if app_file == $0
end

