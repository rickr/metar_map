load 'metar.rb'
ids = [:KISP, :KHWV]

m = Metar.new(ids: ids)
m.fetch
ids.each { |i| puts "#{m.metars[i].station_id}: #{m.metars[i].flight_category}" }
