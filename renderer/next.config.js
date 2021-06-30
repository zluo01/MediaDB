module.exports = {
  webpack5: false, // temporary work around
  webpack: config => {
    config.target = 'electron-renderer';

    // Overcome Webpack referencing `window` in chunks
    config.output.globalObject = `(typeof self !== 'undefined' ? self : this)`;

    return config;
  },
};
