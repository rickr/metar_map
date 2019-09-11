#!/usr/bin/env ruby

require 'rubygems'
require 'ws2812'

LED_COUNT = 1
LED_PIN = 18

class LedString attr_reader :leds

  def initialize
    @leds = Ws2812::Basic.new(LED_COUNT, LED_PIN)
    leds.open
    leds.brightness = 1
    leds.direct = true
  end

  def set(index, color)
    leds[index] = Ws2812::Color.new(0, 0, 0)
    leds.show
    leds[index] = color
    leds.show
  end

  def off(index)
    leds[index] = Ws2812::Color.new(0, 0, 0)
    leds.show
  end
end

class Pixel
  #R, G, B
  def self.red
    Ws2812::Color.new(255, 0, 0)
  end

  def self.green
    Ws2812::Color.new(0, 255, 0)
  end

  def self.blue
    Ws2812::Color.new(0, 0, 255)
  end
end


string = LedString.new
#string.set(0, Ws2812::Color.new(0,0,0))
#string.set(0, Pixel.blue)

10.times do
  0.upto(255) { |i| string.set(0, Ws2812::Color.new(0, i, 255)); sleep 0.01 }
  255.downto(0) { |i| string.set(0, Ws2812::Color.new(0, i, 255)); sleep 0.01 }
  sleep 2
end


#%i[red green blue].each { |i| string.set(0, Pixel.send(i)); sleep 1 }
