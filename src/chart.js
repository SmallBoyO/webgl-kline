/* eslint-disable max-len */
import Grid from './grid';
import shaderSources from './shader';
import { bindFramebuffer } from './util/common-util';
import m3 from './util/m3';
/**
 * 初始化webglcontext相关
 */
function prepareContext(containerId) {
  // 使用Canvas
  const div = document.querySelector(`#${containerId}`);
  const webGlCanvasNode = document.createElement('canvas');
  div.appendChild(webGlCanvasNode);
  const textCanvasNode = document.createElement('canvas');
  div.appendChild(textCanvasNode);

  webGlCanvasNode.style.width = div.style.width;
  webGlCanvasNode.style.height = div.style.height;
  webGlCanvasNode.width = div.clientWidth;
  webGlCanvasNode.height = div.clientHeight;
  const container = webGlCanvasNode;
  const textcontainer = textCanvasNode;
  div.style.position = 'relative';
  textCanvasNode.style.backgroundColor = 'transparent';
  textCanvasNode.style.position = 'absolute';
  textCanvasNode.style.left = '0px';
  textCanvasNode.style.top = '0px';
  textCanvasNode.style.zIndex = '10';
  textCanvasNode.style.width = div.style.width;
  textCanvasNode.style.height = div.style.height;
  textCanvasNode.width = div.clientWidth;
  textCanvasNode.height = div.clientHeight;
  const gl = container.getContext('webgl', { antialias: true, antialiasSamples: 64 });
  const textCtx = textcontainer.getContext('2d');
  // 清空二维画布
  textCtx.clearRect(0, 0, container.width, container.height);
  if (!gl) {
    return null;
  }
  return {
    container,
    textcontainer,
    gl,
    textCtx,
  };
}
/**
   * 编译着色器
   * @param {WebGLRenderingContext} gl
   * @param {*} type
   * @param {*} source
   * @returns
   */
function setupShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    window.console.log(gl.getShaderInfoLog(shader));
  }
  if (success) {
    return shader;
  }
  gl.deleteShader(shader);
  return null;
}
/**
   *  链接着色器
   * @param {*} gl
   * @param {*} vertexShader
   * @param {*} fragmentShader
   * @returns
   */
function linkShader(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
  gl.deleteProgram(program);
  return null;
}
/**
 * 编译shader等
 * @param {*} webglcontext
 * @returns
 */
function prepareShader(webglcontext) {
  // 编译
  const lineVertexShader = setupShader(webglcontext.gl, webglcontext.gl.VERTEX_SHADER, shaderSources.lineVertexShaderSource);
  const lineFragmentShader = setupShader(webglcontext.gl, webglcontext.gl.FRAGMENT_SHADER, shaderSources.lineFragmentShaderSource);

  // 链接
  const lineShaderProgram = linkShader(webglcontext.gl, lineVertexShader, lineFragmentShader);
  const linePositionAttributeLocation = webglcontext.gl.getAttribLocation(lineShaderProgram, 'a_position');
  const lineMatrixLocation = webglcontext.gl.getUniformLocation(lineShaderProgram, 'matrix');

  // 获取u_FragColor变量的存储位置
  const lineFragColor = webglcontext.gl.getUniformLocation(lineShaderProgram, 'u_FragColor');

  // 编译
  const lineVertexShaderUseVaringColor = setupShader(webglcontext.gl, webglcontext.gl.VERTEX_SHADER, shaderSources.lineVertexShaderSourceUseVaringColor);
  const lineFragmentShaderUseVaringColor = setupShader(webglcontext.gl, webglcontext.gl.FRAGMENT_SHADER, shaderSources.lineFragmentShaderSourceUseVaringColor);

  // 链接
  const lineShaderProgramUseVaringColor = linkShader(webglcontext.gl, lineVertexShaderUseVaringColor, lineFragmentShaderUseVaringColor);

  const linePositionAttributeLocationUseVaringColor = webglcontext.gl.getAttribLocation(lineShaderProgramUseVaringColor, 'a_position');
  const lineColorAttributeLocationUseVaringColor = webglcontext.gl.getAttribLocation(lineShaderProgramUseVaringColor, 'a_color');

  // 获取matrix变量的存储位置
  const lineMatrixLocationUseVaringColor = webglcontext.gl.getUniformLocation(lineShaderProgramUseVaringColor, 'matrix');

  // 编译
  const imageVertexShader = setupShader(webglcontext.gl, webglcontext.gl.VERTEX_SHADER, shaderSources.imgVertexShaderSource);
  const imageFragmentShader = setupShader(webglcontext.gl, webglcontext.gl.FRAGMENT_SHADER, shaderSources.imgFragmentShaderSource);
  // console.log(webglcontext.gl.getError());
  const imageProgram = linkShader(webglcontext.gl, imageVertexShader, imageFragmentShader);
  const imagePositionAttributeLocation = webglcontext.gl.getAttribLocation(imageProgram, 'a_position');
  const imageTexcoordAttributeLocation = webglcontext.gl.getAttribLocation(imageProgram, 'a_texCoord');

  // u_matrix
  const imageMatrixLocation = webglcontext.gl.getUniformLocation(imageProgram, 'u_matrix');
  return {
    lineShaderProgram,
    linePositionAttributeLocation,
    lineMatrixLocation,
    lineFragColor,
    lineShaderProgramUseVaringColor,
    linePositionAttributeLocationUseVaringColor,
    lineColorAttributeLocationUseVaringColor,
    lineMatrixLocationUseVaringColor,
    imageProgram,
    imagePositionAttributeLocation,
    imageTexcoordAttributeLocation,
    imageMatrixLocation,
  };
}

function clearChartZone(context) {
  const { gl } = context;

  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function bindFramebufferToChart(context) {
  const {
    gl, framebuffer, fboTexture, container,
  } = context;

  bindFramebuffer(gl, framebuffer, fboTexture, container.width, container.height);
}

function unBindFramebufferToChart(context) {
  const { gl } = context;
  bindFramebuffer(gl, null, null, null, null);
}

function drawToScreen(context, shaders) {
  const { gl, container, fboTexture } = context;
  gl.viewport(0, 0, container.clientWidth, container.clientHeight);
  // 立方体使用刚才渲染的纹理
  gl.bindTexture(gl.TEXTURE_2D, fboTexture);
  gl.useProgram(shaders.imageProgram);

  function createBuffer(data) {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  }
  createBuffer([
    0, 0, // 0,0,
    container.clientWidth, 0, // 1,0
    0, container.clientHeight, // 0,1
    0, container.clientHeight, // 0,1
    container.clientWidth, 0, // 1,0
    container.clientWidth, container.clientHeight, // 1,1
  ]);

  gl.enableVertexAttribArray(shaders.imagePositionAttributeLocation);
  const size = 2; // 2 components per iteration
  const type = gl.FLOAT; // the data is 32bit floats
  const normalize = false; // don't normalize the data
  const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset = 0; // start at the beginning of the buffer
  gl.vertexAttribPointer(shaders.imagePositionAttributeLocation, size, type, normalize, stride, offset);

  createBuffer([
    0.0, 0.0,
    1.0, 0.0,
    0.0, 1.0,
    0.0, 1.0,
    1.0, 0.0,
    1.0, 1.0,
  ]);
  // Turn on the texcoord attribute
  gl.enableVertexAttribArray(shaders.imageTexcoordAttributeLocation);

  gl.vertexAttribPointer(shaders.imageTexcoordAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  // if (!series._projectionMatrix) {
  // 根据分辨率直接生成矩阵
  let projectionMatrix = m3.projection(container.clientWidth, container.clientHeight);
  // 因为上面的方法生成的矩阵原点在左上方 需要原点在左下方,所以先沿y轴平移canvas高度(向上),在沿y轴翻转 (这样原点的坐标就在左下了)
  const translationMatrix = m3.translation(0, container.clientHeight);
  projectionMatrix = m3.multiply(projectionMatrix, translationMatrix);
  // scaling 绕原点翻转(-1 ~ 1)
  projectionMatrix = m3.multiply(projectionMatrix, m3.scaling(1, -1));
  gl.uniformMatrix3fv(shaders.imageMatrixLocation, false, projectionMatrix);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}

function initFboTexture(context) {
  const framebuffer = context.gl.createFramebuffer();
  const fboTexture = context.gl.createTexture();
  context.gl.bindTexture(context.gl.TEXTURE_2D, fboTexture);
  context.gl.texImage2D(context.gl.TEXTURE_2D, 0, context.gl.RGB, context.container.width, context.container.height, 0, context.gl.RGB, context.gl.UNSIGNED_BYTE, null);
  context.gl.texParameteri(context.gl.TEXTURE_2D, context.gl.TEXTURE_MAG_FILTER, context.gl.LINEAR);
  context.gl.texParameteri(context.gl.TEXTURE_2D, context.gl.TEXTURE_MIN_FILTER, context.gl.LINEAR);
  context.gl.texParameteri(context.gl.TEXTURE_2D, context.gl.TEXTURE_WRAP_S, context.gl.CLAMP_TO_EDGE);
  context.gl.texParameteri(context.gl.TEXTURE_2D, context.gl.TEXTURE_WRAP_T, context.gl.CLAMP_TO_EDGE);

  context.framebuffer = framebuffer;
  context.fboTexture = fboTexture;
}

function Chart(initparam) {
  const context = prepareContext(initparam.container);
  const shaders = prepareShader(context);

  initFboTexture(context);

  const grids = [];
  context.textcontainer.onmousewheel = (event) => {
    const transformedX = event.offsetX;
    const transformedY = context.container.clientHeight - event.offsetY;
    grids.forEach((item) => {
      if (transformedX > item.left && transformedX < (context.container.clientWidth - item.right)
      && transformedY > item.bottom && transformedY < (context.container.clientHeight - item.top)) {
        if (item.onmousewheel) {
          item.onmousewheel(transformedX, transformedY, event.deltaY);
        }
      }
    });
  };
  context.textcontainer.onmousemove = (event) => {
    const transformedX = event.offsetX;
    const transformedY = context.container.clientHeight - event.offsetY;
    grids.forEach((item) => {
      if (transformedX > item.left && transformedX < (context.container.clientWidth - item.right)
      && transformedY > item.bottom && transformedY < (context.container.clientHeight - item.top)) {
        if (item.onmousemove) {
          item.onmousemove(transformedX, transformedY);
        }
        // eslint-disable-next-line no-param-reassign
        item.mouseInSeries = true;
      } else if (item.mouseInSeries) {
        if (item.onmouseleave) {
          item.onmouseleave();
        }
        // eslint-disable-next-line no-param-reassign
        item.mouseInSeries = false;
      }
    });
  };
  context.textcontainer.onmousedown = (event) => {
    const transformedX = event.offsetX;
    const transformedY = context.container.clientHeight - event.offsetY;
    grids.forEach((item) => {
      if (transformedX > item.left && transformedX < (context.container.clientWidth - item.right)
      && transformedY > item.bottom && transformedY < (context.container.clientHeight - item.top)) {
        if (item.onmousedown) {
          item.onmousedown(transformedX, transformedY);
        }
      }
    });
  };
  context.textcontainer.onmouseup = (event) => {
    const transformedX = event.offsetX;
    const transformedY = context.container.clientHeight - event.offsetY;
    grids.forEach((item) => {
      if (transformedX > item.left && transformedX < (context.container.clientWidth - item.right)
      && transformedY > item.bottom && transformedY < (context.container.clientHeight - item.top)) {
        if (item.onmouseup) {
          item.onmouseup(transformedX, transformedY);
        }
      }
    });
  };
  function refreshChart() {
    bindFramebufferToChart(context);
    clearChartZone(context);
    context.textCtx.clearRect(0, 0, context.textcontainer.width, context.textcontainer.height);
    grids.forEach((item) => {
      if (item.refresh) {
        item.refresh();
      }
    });
    unBindFramebufferToChart(context);
    drawToScreen(context, shaders);
  }
  return {
    compass: () => ({
      refresh: () => {

      },
    }),
    addGrid: (gridConfig) => {
      const grid = new Grid();
      grid.init(context, shaders);
      grid.setConfig(gridConfig);
      grids.push(grid);
      grid.setRefreshAll(refreshChart);
      return {
        refresh: refreshChart,
        setXData: (data) => {
          grid.setXData(data);
        },
        setYData: (data) => {
          grid.setXData(data);
        },
        addKline: () => grid.addKline(),
        addLine: (config) => grid.addLine(config),
        addOnXIntervalChangeListener: (listener) => {
          grid.addOnXIntervalChangeListener(listener);
        },
        setYInterval: (interval) => {
          grid.setYInterval(interval);
        },
      };
    },
  };
}

export default Chart;
