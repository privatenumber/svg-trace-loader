const svgTraceLoader = require.resolve('..');

const fs = require('fs');
const webpack = require('webpack');
const MemoryFS = require('memory-fs');
const { ufs } = require('unionfs');

const svgAsset = fs.readFileSync(__dirname + '/fixtures/wp.svg').toString();

function build(input, loaderConfig = {}) {
	return new Promise((resolve, reject) => {
		const mfs = new MemoryFS();

		const entryPath = '/entry.svg';
		const outputName = 'test.build.js';
		mfs.writeFileSync(entryPath, input);

		const compiler = webpack({
			mode: 'development',
			resolveLoader: {
				alias: {
					'svg-trace-loader': svgTraceLoader,
				},
			},
			module: {
				rules: [
					{
						test: /\.svg/,
						use: [
							'raw-loader',
							{
								loader: 'svg-trace-loader',
								options: loaderConfig,
							},
						],
					},
				],
			},
			entry: entryPath,
			output: {
				path: '/',
				filename: outputName,
			},
		});

		compiler.inputFileSystem = ufs.use(fs).use(mfs);
		compiler.outputFileSystem = mfs;

		compiler.run(function (err, stats) {
			if (err) {
				reject(err);
				return;
			}

			if (stats.compilation.errors.length > 0) {
				reject(stats.compilation.errors);
				return;
			}

			resolve(mfs.readFileSync(`/${outputName}`).toString());
		});
	});
}

test('Trace SVG', async () => {
	const built = await build(svgAsset);
	const { default: builtSvg } = eval(built);

	expect(/\<path/.test(builtSvg)).toBe(true);
});
