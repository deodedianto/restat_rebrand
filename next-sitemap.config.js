/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://restatolahdata.id',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  
  // Exclude these paths from sitemap
  exclude: [
    '/dashboard',
    '/dashboard/*',
    '/order',
    '/order/*',
    '/checkout',
    '/checkout/*',
    '/payment-confirmation',
    '/payment-confirmation/*',
    '/api/*',
  ],

  // Robots.txt configuration
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
      {
        userAgent: '*',
        disallow: ['/dashboard', '/order', '/checkout', '/payment-confirmation', '/api'],
      },
    ],
    additionalSitemaps: [
      'https://restatolahdata.id/sitemap.xml',
    ],
  },

  // Transform function to set priority and changefreq
  transform: async (config, path) => {
    // Set priority based on path
    let priority = 0.7
    let changefreq = 'monthly'

    if (path === '/') {
      priority = 1.0
      changefreq = 'daily'
    } else if (path === '/artikel') {
      priority = 0.9
      changefreq = 'weekly'
    } else if (path.startsWith('/artikel/')) {
      priority = 0.8
      changefreq = 'monthly'
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    }
  },
}
