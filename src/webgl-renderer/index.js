import createRendererBox from './renderer-box';
import initShaderProgram from './shaders';

function dpiScale(gl) {
  const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
  const backingStorePixelRatio =
    gl.webkitBackingStorePixelRatio ||
    gl.mozBackingStorePixelRatio ||
    gl.msBackingStorePixelRatio ||
    gl.oBackingStorePixelRatio ||
    gl.backingStorePixelRatio ||
    1;
  return dpr / backingStorePixelRatio;
}

const rgbToNum = (r, g, b) => r * 256 * 256 + g * 256 + b;
const hexToNum = (hex) => parseInt(hex.replace('#', ''), 16);

function generateData(nodes, canvas, dpiRatio) {
  const data = [];
  let j = 0;
  for (let i = 0; i < nodes.length; i++) {
    data[j++] = nodes[i].cx * dpiRatio;
    data[j++] = canvas.height - nodes[i].cy * dpiRatio; // inverted scale?
    data[j++] = Math.floor(nodes[i].r * dpiRatio);
    data[j++] = hexToNum(nodes[i].fill);
  }

  return data;
}

export default function renderer(opts = {}) {
  let el;
  let hasChangedRect = false;
  let rect = createRendererBox();

  const canvasRenderer = {
    element: () => el,
    root: () => el,
    appendTo: (element) => {
      if (!el) {
        el = element.ownerDocument.createElement('canvas');
        el.style.position = 'absolute';
        el.style['-webkit-font-smoothing'] = 'antialiased';
        el.style['-moz-osx-font-smoothing'] = 'antialiased';
        el.style.pointerEvents = 'none';
      }

      element.appendChild(el);

      return el;
    },
    render: (nodes) => {
      if (!el) {
        return false;
      }
      const dpiRatio = 2; // dpiScale(gl); // TODO: fixifixi

      if (hasChangedRect) {
        el.style.left = `${rect.computedPhysical.x}px`;
        el.style.top = `${rect.computedPhysical.y}px`;
        el.style.width = `${rect.computedPhysical.width}px`;
        el.style.height = `${rect.computedPhysical.height}px`;
        el.width = Math.round(rect.computedPhysical.width * dpiRatio);
        el.height = Math.round(rect.computedPhysical.height * dpiRatio);
      }

      const gl = el.getContext('webgl', {
        antialias: true,
      });

      // If we don't have a GL context, give up now
      if (!gl) {
        // TODO: Fallback to use canvas renderer?
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
      }

      const data = generateData(nodes, el, dpiRatio);
      const shaderProgram = initShaderProgram(gl); // TODO: Only initialize once?
      gl.useProgram(shaderProgram);
      canvasRenderer.clear();

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      const vertexLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
      const offsetLocation = gl.getUniformLocation(shaderProgram, 'uOffset');
      const scaleLocation = gl.getUniformLocation(shaderProgram, 'uScale');
      const edgeColorLocation = gl.getUniformLocation(shaderProgram, 'uEdgeColor');
      const lineWidthLocation = gl.getUniformLocation(shaderProgram, 'uLineWidth');
      {
        const type = gl.FLOAT; // the data in the buffer is 32bit floats
        const normalize = false; // don't normalize
        const stride = 0; // how many bytes to get from one set of values to the next
        // 0 = use type and numComponents above
        const offset = 0; // how many bytes inside the buffer to start from
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.vertexAttribPointer(vertexLocation, 4, type, normalize, stride, offset);
        gl.enableVertexAttribArray(vertexLocation);
      }

      const dataBuffer = new Float32Array(data);
      gl.bufferData(gl.ARRAY_BUFFER, dataBuffer, gl.STATIC_DRAW);
      gl.uniform2fv(offsetLocation, [0, 0]);
      gl.uniform2fv(scaleLocation, [el.width, el.height]);
      gl.uniform4fv(edgeColorLocation, [1, 1, 1, 1]);
      gl.uniform1f(lineWidthLocation, 0.1);

      gl.drawArrays(gl.POINTS, 0, nodes.length);

      hasChangedRect = false;
      return true;
    },
    itemsAt: (input) => [],

    findShapes: (selector) => [],

    clear: () => {
      if (el) {
        el.width = el.width; // eslint-disable-line
      }

      return canvasRenderer;
    },

    size: (sizeOpts) => {
      if (sizeOpts) {
        const newRect = createRendererBox(sizeOpts);

        if (JSON.stringify(rect) !== JSON.stringify(newRect)) {
          hasChangedRect = true;
          rect = newRect;
        }
      }

      return rect;
    },

    destroy: () => {
      if (el) {
        if (el.parentElement) {
          el.parentElement.removeChild(el);
        }
        el = null;
      }
    },
  };

  return canvasRenderer;
}
