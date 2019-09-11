module IntegerWithMinutes
  def minutes
    self * 60
  end
end

class Fixnum
  include IntegerWithMinutes
end
