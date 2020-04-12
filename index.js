const http = require('http');
const url = require('url');
const static = require('node-static');

const DynamicStressManager = require('reduplicator').DynamicStressManager;
const Reduplicator = require('reduplicator').Reduplicator;

console.log('Initializing reduplicator');

const dict = new DynamicStressManager();
const r = new Reduplicator(dict);

console.log('Reduplicator initialized');

const file = new static.Server('./public');

const server = http.createServer((request, response) => {
	console.log(request.url);

	const q = url.parse(request.url, true);

	if (request.method === 'POST' && q.pathname === '/action') {
		let param = ((q.query || {}).param || '').trim();
		if (!param) {
			response.end();
			return;
		}

		param = decodeURIComponent(param);
		console.log(param);

		const words = param.replace(/[^\p{L}\d ]/ug, '').split(/\s+/).filter(item => !!item);
		const result = words.map(w => r.reduplicate(w)).join(' ');

		response.end(result);
		return;
	}

	file.serve(request, response);
});

server.listen(3000, error => {
	if (error) {
		console.log(`Could not start server: ${err}`);
		return;
	}

	console.log('Server started');
});