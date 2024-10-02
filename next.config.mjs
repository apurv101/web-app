// @ts-check
// import webpack from 'webpack'

// const FRONTEND_ENV_KEYS = ['NODE_ENV', 'API_HOSTNAME_OVERRIDE']

// const envPlugin = FRONTEND_ENV_KEYS.reduce(
// 	(result, key) =>
// 		Object.assign({}, result, {
// 			[`process.env.${key}`]: JSON.stringify(process.env[key]),
// 		}),
// 	{},
// )

/** @type {import('next').NextConfig} */
const nextConfig = {
	// output: 'export',
	// Optional: Change links `/me` -> `/me/` and emit `/me.html` -> `/me/index.html`
	// trailingSlash: true,
	// Optional: Prevent automatic `/me` -> `/me/`, instead preserve `href`
	// skipTrailingSlashRedirect: true,
	// Optional: Change the output directory `out` -> `dist`
	// distDir: 'assets/dist',
	// temporarily disable optimization until we create a custom loader
	// https://nextjs.org/docs/app/building-your-application/deploying/static-exports#image-optimization
	// images: { unoptimized: true },
	// webpack: (config, _context) => {
	// 	config.plugins.push(new webpack.DefinePlugin(envPlugin))
	// 	// Important: return the modified config
	// 	return config
	// },
}

export default nextConfig
