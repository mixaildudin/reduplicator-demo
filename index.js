const http = require('http');
const url = require('url');
const config = require('./config.json');
const static = require('node-static');

const DynamicStressManager = require('reduplicator').DynamicStressManager;
const Reduplicator = require('reduplicator').Reduplicator;

console.log('Initializing reduplicator');

const dict = new DynamicStressManager();
const r = new Reduplicator(dict);

console.log('Reduplicator initialized');

const file = new static.Server('./public');

const server = http.createServer((request, response) => {
	const q = url.parse(request.url, true);

	if (request.method === 'POST' && q.pathname === '/action') {
		let param = ((q.query || {}).param || '').trim();
		if (!param) {
			response.end();
			return;
		}

		param = decodeURIComponent(param);
		console.log(`${new Date()}: ${param}`);

		const words = param.replace(/[^\p{L}\d ]/ug, '').split(/\s+/).filter(item => !!item);
		const result = words.map(w => r.reduplicate(w) || w).join(' ');

		response.end(result);
		return;
	}

	file.serve(request, response);
});

if (!config.port) {
	throw new Error('No port specified');
}

server.listen(config.port, error => {
	if (error) {
		console.log(`Could not start server: ${err}`);
		return;
	}

	console.log(`Server listening on port ${config.port}`);
});