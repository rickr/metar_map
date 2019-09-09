class Airport
  attr_reader :id, :metar

  def initialize(id:)
    @id = id
    @metar = Metar.new(id: id)
  end

  def ifr?
  end

  def vfr?
  end

  def marginal?
  end
end

