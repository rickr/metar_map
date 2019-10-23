all:
	cd client && npm run build

release:
	git checkout master && cd client && npm run build && git commit -a -m 'Version'

