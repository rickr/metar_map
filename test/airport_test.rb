require 'test_helper'
require 'minitest/autorun'

class AirportTest < Minitest::Test
  def setup
    @airport = Airport.new(id: 'KTST')
  end

  def test_can_be_instantiated
    assert @airport
  end

  def test_has_an_identifier
    assert_equal 'KTST', @airpot.id
  end
end
