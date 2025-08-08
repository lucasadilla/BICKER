export default {
  title: 'Bicker',
  description: 'The game of instigating, debating, and deliberating!',
  canonical: 'https://bicker.ca/',
  additionalMetaTags: [
    {
      name: 'keywords',
      content:
        'bicker, debate, deliberate, instigate, online debate game',
    },
    { name: 'robots', content: 'index, follow' },
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://bicker.ca/',
    site_name: 'Bicker',
    images: [
      {
        url: 'https://bicker.ca/favicon_io/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'Bicker Logo',
      },
    ],
  },

  twitter: {
    cardType: 'summary_large_image',
  },

};
