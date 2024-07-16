/** @type {import('next').NextConfig} */
const nextConfig = {
	output: 'export',

	// Optional: Change links `/me` -> `/me/` and emit `/me.html` -> `/me/index.html`
	// trailingSlash: true,

	// Optional: Prevent automatic `/me` -> `/me/`, instead preserve `href`
	// skipTrailingSlashRedirect: true,

	// Optional: Change the output directory `out` -> `dist`
	distDir: 'dist',

	// temporarily disable optimization until we create a custom loader
	// https://nextjs.org/docs/app/building-your-application/deploying/static-exports#image-optimization
	images: { unoptimized: true },
}

export default nextConfig
