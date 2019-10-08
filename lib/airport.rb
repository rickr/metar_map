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

  def initialize(id:, index:, metar:, lights:, colors:)
    @id = id
    @index = index
    @metar = metar
    @lights = lights
    @colors = colors
    if @metar
      set_color!
    else
      logger.info "Metar for #{id} not found"
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

  # TODO Extend this to work for wind values and what else???
  def set_color!
    unknown_category! if metar.nil?

    if ifr?
      @lights.set!(@index, @colors[:ifr])
      logger.info "LED for #{id}: IFR (#{@colors[:ifr]})"
    elsif marginal?
      @lights.set!(@index, @colors[:marginal])
      logger.info "LED for #{id}: Marginal (#{@colors[:marginal]})"
    elsif vfr?
      @lights.set!(@index, @colors[:vfr])
      logger.info "LED for #{id}: VFR (#{@colors[:vfr]})"
    else
      unknown_category!
    end
  end

  private

  def unknown_category!
    @lights.set!(@index, [0, 0, 0])
    logger.info "Unknown flight category for ID '#{id}': #{flight_category}"
  end
end

