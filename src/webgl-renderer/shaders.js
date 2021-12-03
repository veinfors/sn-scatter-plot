// Shaders
const vsSource = `
precision lowp float;
attribute vec4 aVertexPosition;

uniform vec2 uOffset;
uniform vec2 uScale;
uniform float uLineWidth;

varying float vSize;
varying vec3 vColor3;

void main() {
    vec2 vertex = vec2(aVertexPosition[0], aVertexPosition[1]);
    vec2 clipSpace = 2.0 * (vertex - uOffset) / uScale - 1.0;
    float r = floor(aVertexPosition[3] / 65536.0);
    float gb = aVertexPosition[3] - r * 65536.0;
    float g = floor(gb / 256.0);
    float b = gb - g * 256.0;

    vSize = aVertexPosition[2] * 2.0 + uLineWidth / 2.0;
    vColor3 = vec3(r / 255.0, g / 255.0, b / 255.0);
    gl_PointSize = vSize + 1.0;
    gl_Position = vec4(clipSpace, 0.0, 1.0);
}`;

const fsSource = `
precision lowp float;

uniform float uLineWidth;
uniform vec4 uEdgeColor;

varying float vSize;
varying vec3 vColor3;

void main() {
    float dist = length(2.0 * gl_PointCoord - 1.0) * vSize;
    float inner = vSize - 2.0 * uLineWidth - 1.0;
    vec4 vColor4 = vec4(vColor3, 1.0);

    if (dist > vSize + 1.0) {
        discard;
    } else if (uEdgeColor[3] < 0.1) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    } else if (dist < inner) {
        gl_FragColor = vColor4;
    } else {
        float rAlias = clamp((dist - vSize) / 2.0 + 0.5, 0.0, 1.0);
        vec4 transparent = vec4(0.0);
        vec4 edgeColor = rAlias * transparent + (1.0 - rAlias) * uEdgeColor;

        float rEdge = clamp(dist - inner, 0.0, 1.0);
        gl_FragColor = rEdge * edgeColor + (1.0 - rEdge) * vColor4;
    }
}`;

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Send the source to the shader object

  gl.shaderSource(shader, source);

  // Compile the shader program

  gl.compileShader(shader);

  // See if it compiled successfully

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(`An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

//
// Initialize a shader program, so WebGL knows how to draw our data
// This is where all the lighting for the vertices and so forth is established.
//
function initShaderProgram(gl) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
    return null;
  }

  return shaderProgram;
}

export default initShaderProgram;
