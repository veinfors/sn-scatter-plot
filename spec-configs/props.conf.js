const path = require('path');
const pkg = require(path.resolve(__dirname, '../package.json'));

module.exports = {
  glob: ['./src/qae/object-definition.js'],
  package: path.resolve(__dirname, '../package.json'),
  api: {
    stability: 'experimental',
    properties: {
      'x-qlik-visibility': 'public',
    },
    visibility: 'public',
    name: `${pkg.name}:properties`,
    version: pkg.version,
    description: 'Scatter plot generic object definition',
  },
  output: {
    file: path.resolve(__dirname, '../api-specifications/properties.json'),
  },
  parse: {
    types: {
      HyperCubeDef: {},
      NxDimension: {},
      NxMeasure: {},
      StringExpression: {},
      ValueExpression: {},
    },
  },
};
