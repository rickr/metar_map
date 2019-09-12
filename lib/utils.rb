module IntegerWithMinutes
  def minutes
    self * 60
  end
end

class Integer
  include IntegerWithMinutes
end
