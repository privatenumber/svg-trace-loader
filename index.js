const { promisify } = require('util');
const sharp = require('sharp');
const potrace = require('potrace');
const cheerio = require('cheerio');

function getSvgDimensions(svg) {
	const $ = cheerio.load(svg, { xmlMode: true });
	const $svg = $('svg');
	return {
		width: parseInt($svg.attr('width'), 10),
		height: parseInt($svg.attr('height'), 10),
	};
}

const trace = promisify(potrace.trace);

module.exports = function(content, map, meta) {
	const callback = this.async();

	(async () => {
		let svg = content;

		try {
			const buf = await sharp(Buffer.from(svg), { density: 2400 }).toBuffer();
			svg = await trace(buf, getSvgDimensions(svg));			
		} catch (e) {
			return callback(e);
		}

		callback(null, svg);
	})();
};
