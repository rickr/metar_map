#require_relative 'metar'
require 'metar'
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
    set_color!
  end

  def set_color!
    if ifr?
      puts "LED #{MetarMap::IFR_COLOR}"
    elsif marginal?
      puts "LED #{MetarMap::MARGINAL_COLOR}"
    elsif vfr?
      puts "LED #{MetarMap::VFR_COLOR}"
    else
      puts "Unknown flight category: #{flight_category}"
    end
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

