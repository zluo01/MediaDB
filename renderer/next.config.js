module.exports = {
  webpack: config => {
    config.target = 'electron-renderer';

    // Overcome Webpack referencing `window` in chunks
    config.output.globalObject = `(typeof self !== 'undefined' ? self : this)`;

    return config;
  },
};
