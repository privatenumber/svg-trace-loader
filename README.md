# svg-trace-loader

> Webpack loader to trace and flatten SVGs into one `path`

## :rocket: Install
```sh
npm i svg-trace-loader
```

## :beginner: Usage
In your Webpack config
```json5
module: {
	rules: [
		...,
		{
			test: /\.svg$/,
			use: [
				'file-loader',
				'svg-trace-loader',
			],
		},
		...
```

Set target dimensions with the `dimensions` option:
```json5
module: {
	rules: [
		...,
		{
			test: /\.svg$/,
			use: [
				'file-loader',
				{
					loader: 'svg-trace-loader',
					options: {
						dimensions: {
							width: 16,
							height: 16,
						},
					},
				}
			],
		},
		...
```
