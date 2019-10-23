all:
	cd client && npm run build

release:
	git checkout master && cd client && git merge develop && npm run build && git add -A && git commit -a -m 'New Version $(cat VERSION)'

install-systemd:
	cp -v os/metar-map.service /lib/systemd/system/metar-map.service && systemctl daemon-reload

install-systemd:
	cp -v os/metar-map.service /lib/systemd/system/metar-map.service && systemctl daemon-reload

