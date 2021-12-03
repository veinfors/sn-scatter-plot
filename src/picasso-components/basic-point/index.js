import extend from 'extend';

const PX_RX = /px$/;

const DEFAULT_DATA_SETTINGS = {
  /** Type of shape
   * @type {DatumString=} */
  shape: 'circle',
  /** Label
   * @type {DatumString=} */
  label: '',
  /** Fill color
   * @type {DatumString=} */
  fill: '#333',
  /** Stroke color
   * @type {DatumString=} */
  stroke: '#ccc',
  /** Stroke dash array
   * @type {DatumString=} */
  strokeDasharray: '',
  /** Stroke width
   * @type {DatumNumber=} */
  strokeWidth: 0,
  /** Stroke line join
   * @type {DatumString=} */
  strokeLinejoin: 'miter',
  /** Opacity of shape
   * @type {DatumNumber=} */
  opacity: 1,
  /** Normalized x coordinate
   * @type {DatumNumber=} */
  x: 0.5,
  /** Normalized y coordinate
   * @type {DatumNumber=} */
  y: 0.5,
  /** Normalized size of shape
   * @type {DatumNumber=} */
  size: 1,
  /** Whether or not to show the point
   * @type {DatumBoolean=} */
  show: true,
};

const basicPoint = () => ({
  require: ['chart', 'resolver', 'symbol'],
  defaultSettings: {
    settings: {},
    data: {},
    animations: {
      enabled: false,
      trackBy: function trackBy(node) {
        return node.data.value;
      },
    },
    style: {
      item: '$shape',
    },
  },
  render: function render(_ref2) {
    const { data } = _ref2;
    const resolved = this.resolver.resolve({
      data,
      defaults: extend({}, DEFAULT_DATA_SETTINGS, this.style.item),
      settings: this.settings.settings,
      scaled: {
        x: this.rect.width,
        y: this.rect.height,
      },
    });
    const { width, height } = this.rect;
    const points = resolved.items;
    const pointSize = {
      min: 0.01 * Math.max(width, height),
      max: 0.1 * Math.min(width, height),
      maxGlobal: 10000,
      minGlobal: 1,
    };

    return points.map((p) => {
      const s = p;
      const size = PX_RX.test(p.size) ? parseInt(p.size, 10) : pointSize.min + s.size * (pointSize.max - pointSize.min);

      return {
        cx: p.x * width,
        cy: p.y * height,
        r: size / 2,
        fill: p.fill,
      };
    });
  },
});

export default basicPoint;
