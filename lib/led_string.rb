require 'ws2812'

LED_PIN = 18

class LedString
  attr_reader :leds

  def initialize(led_count:)
    @leds = Ws2812::Basic.new(led_count, LED_PIN)
    leds.open
    leds.brightness = 50
    leds.direct = false
  end

  def set!(index, color)
    leds.set(index, *color)
  end

  def off(index)
    leds[index] = Ws2812::Color.new(0, 0, 0)
    leds.show
  end

  def show
    leds.show
  end
end
