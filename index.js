const assert = require('assert');
const { promisify } = require('util');
const sharp = require('sharp');
const potrace = require('potrace');
const cheerio = require('cheerio');
const loaderUtils = require('loader-utils');

const dimensions = (width = 0, height = 0) => ({
	width: parseInt(width, 10),
	height: parseInt(height, 10),
});

function getSvgDimensions($svg) {
	let d = dimensions($svg.attr('width'), $svg.attr('height'));

	if (d.width && d.height) { return d; }

	const viewBox = $svg.attr('viewBox');
	if (viewBox) {
		return dimensions(...viewBox.split(' ').slice(2));
	}
}

const trace = promisify(potrace.trace);
module.exports = function(content, map, meta) {
	const callback = this.async();

	(async () => {
		let svg = content;
		const $ = cheerio.load(svg, { xmlMode: true });
		const $svg = $('svg');

		const options = loaderUtils.getOptions(this) || {};
		const {
			density = 2400,
			dimensions = getSvgDimensions($svg),
		} = options;

		assert(dimensions.width, 'SVG missing width');
		assert(dimensions.height, 'SVG missing height');

		// The dimensions here are used by sharp to render it as a PNG
		// Since we're using a high rendering density, a high SVG dimension creates too big of a PNG and crashes
		$svg.attr({ width: 20, height: 20 });

		const buf = await sharp(Buffer.from($.html()), { density }).toBuffer();
		svg = await trace(buf, dimensions);

		return svg;
	})().then(
		svg => callback(null, svg),
		err => callback(err),
	);
};
