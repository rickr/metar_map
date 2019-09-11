require 'sucker_punch'
require_relative 'metar_map'

class MetarMapJob
  include SuckerPunch::Job

  def perform
    MetarMap.new
  end
end

MetarMapJob.perform_async
