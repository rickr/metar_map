require_relative 'metar'
require 'forwardable'

class Airport
  # Has a light
  #     a metar
  # Belongs to MetarMap
  attr_reader :id, :metar

  extend Forwardable

  # Allows all metar fields to be accessed via the Airport class
  # Is this confusing?
  def_delegators :@metar, *Metar::Data::FIELDS

  def initialize(id:, metar:)
    @id = id
    @metar = metar
  end

  def ifr?
    flight_category == 'IFR'
  end

  def vfr?
    flight_category == 'VFR'
  end

  def marginal?
    flight_category == 'MVFR'
  end
end

