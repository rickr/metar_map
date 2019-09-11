#load 'metar.rb'
load 'metar_map.rb'
#ids = %i[KISP KHWV KPOU]

#m = Metar.new(ids: ids)
#m.fetch
#puts m.refresh?
#ids.each do |i|
#  puts "#{m.metars[i].station_id}: #{m.metars[i].flight_category} #{m.metars[i].wind_dir_degrees}@#{m.metars[i].wind_speed_kt}"
#end


module IntegerWithMinutes
  def minutes
    self * 60
  end
end

class Fixnum
  include IntegerWithMinutes
end

mm = MetarMap.new
mm.airports.each { |a| puts "#{a.id}: #{a.raw_text}" }
#puts mm.airports.first.wind_dir_degrees
#puts mm.airports.first.vfr?
#puts mm.airports.first.ifr?
