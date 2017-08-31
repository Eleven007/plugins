build: node_modules/ assert es5shimsham

es5shimsham:
	(curl https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.1.1/es5-shim.min.js; echo ''; curl https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.1.1/es5-sham.min.js) > test/es5shimsham.js

test: node_modules/ build lint
	./script/test

lint: node_modules/
	./node_modules/.bin/jshint *.js test/*.js

assert: node_modules/
	./node_modules/.bin/browserify src/assert.js -s assert > test/assert.js

node_modules/:
	npm install

clean:
	rm -rf ./node_modules

.PHONY: build clean lint test saucelabs travis
