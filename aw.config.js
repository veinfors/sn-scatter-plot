const specFiles = ['src/**/*.spec.js'];

module.exports = {
  glob: specFiles,
  src: [],
  watchGlob: specFiles,
  coverage: true,
  warnings: true,
  mocha: {
    bail: false,
    reporter: 'min',
  },
  mocks: [],
  babel: {
    options: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current',
            },
          },
        ],
        '@babel/preset-react',
      ],
    },
  },
};
