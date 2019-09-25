module IntegerWithMinutes
  def minutes
    self * 60
  end
end

class Integer
  include IntegerWithMinutes
end

def raspi?
  RUBY_PLATFORM != 'x86_64-linux'
end

def logger
  MetarMapWeb.settings.logger
end
