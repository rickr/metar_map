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

  def initialize(id:, index:,  metar:, lights:)
    @id = id
    @index = index
    @metar = metar
    @lights = lights
    set_color!
  end

  def set_color!
    if ifr?
      @lights.set!(@index, MetarMap::IFR_COLOR)
      puts "LED for #{id}: IFR (#{MetarMap::IFR_COLOR})"
    elsif marginal?
      @lights.set!(@index, MetarMap::MARGINAL_COLOR)
      puts "LED for #{id}: Marginal (#{MetarMap::MARGINAL_COLOR})"
    elsif vfr?
      @lights.set!(@index, MetarMap::VFR_COLOR)
      puts "LED for #{id}: VFR (#{MetarMap::VFR_COLOR})"
    else
      @lights.set!(@index, 0, 0, 0)
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

