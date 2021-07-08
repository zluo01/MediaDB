import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';

import { wrapper } from '../lib/store';
import { theme } from '../lib/theme';

const cache = createCache({ key: 'css' });
cache.compat = true;

function MyApp(props: AppProps): JSX.Element {
  const router = useRouter();
  const { Component, pageProps } = props;

  return (
    <CacheProvider value={cache}>
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <title>MediaDB</title>
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} key={router.asPath} />
      </ThemeProvider>
    </CacheProvider>
  );
}

export default wrapper.withRedux(MyApp);
