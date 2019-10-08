require 'sucker_punch'
require_relative 'metar_map'

class MetarMapJob
  include SuckerPunch::Job

  def perform
    MetarMap.new
  rescue
    # Make sure we run a job
    puts "RUNNING THIS"
    raise
  end
end
