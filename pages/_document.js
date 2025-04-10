import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="icon" href="/favicon_io/android-chrome-512x512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon_io/android-chrome-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon_io/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon_io/favicon-16x16.png" />
        {/* Add more links for different sizes and formats as needed */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 