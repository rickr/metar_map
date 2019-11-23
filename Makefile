VERSION = $(shell cat VERSION)

all:
	cd client && npm run build

release:
	./os/new_version.sh

install-systemd:
	cp -v os/metar-map.service /lib/systemd/system/metar-map.service && systemctl daemon-reload

install-mothership:
	cp -v os/metar-map-mothership.service /lib/systemd/system/metar-map-mothership.service && systemctl daemon-reload

