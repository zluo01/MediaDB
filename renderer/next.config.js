// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withTM = require('next-transpile-modules');

module.exports = withBundleAnalyzer(
  withTM(['@mui/material', '@mui/icons-material'])({
    webpack: (config, { isServer }) => {
      if (!isServer) {
        config.target = 'electron-renderer';
      }

      // Overcome Webpack referencing `window` in chunks
      config.output.globalObject = `(typeof self !== 'undefined' ? self : this)`;

      config.output.webassemblyModuleFilename = 'static/wasm/[modulehash].wasm';
      config.experiments = { asyncWebAssembly: true };

      return config;
    },
    transpileModules: ['@material-ui/core', '@material-ui/icons'],
  })
);
