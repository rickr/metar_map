require 'ws2812'

LED_PIN = 18

class LedString
  # If we are not on a RASPI we can't use GPIO so we can't initialize our
  # LEDS. To fix this we can return a mocked object.
  def self.create(*args)
    if raspi?
      return LedString::Real.new(*args)
    else
      return LedString::Mock.new(args)
    end
  end

  def logger
    if Object.const_defined? 'MetarMapWeb'
      MetarMapWeb.settings.logger
    else
      Logger.new STDOUT
    end
  end
end

class LedString::Real
  attr_reader :leds

  def initialize(led_count:, brightness:)
    @leds = Ws2812::Basic.new(led_count, LED_PIN)
    leds.open
    leds.brightness = brightness
    leds.direct = false
  end

  def set!(index, color)
    leds.set(index, *color)
    leds.show
  end

  def off(index)
    leds[index] = Ws2812::Color.new(0, 0, 0)
    leds.show
  end

  def show
    leds.show
  end
end

class LedString::Mock < LedString
  def initialize(args)
    logger.info 'LedString in mock mode'
    mock_response
  end

  def set!(index, color)
    logger.info "Setting led index #{index} to color #{color}"
    mock_response
  end

  def show
    mock_response
  end

  private

  def mock_response
    true
  end
end

