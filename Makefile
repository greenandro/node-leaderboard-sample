install: #node_modules
	rm -rf node_modules && npm install

server:
	node ./app.js

.PHONY: server
