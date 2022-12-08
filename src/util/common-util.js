/**
* 创建缓冲区，并填入顶点数据
*/
function createBuffer(gl, data) {
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
}

/**
 * 绘制矩形
 */
function drawTrangles(gl, shaders, points, matrix, color) {
  createBuffer(gl, points);
  // gl.enable(gl.BLEND);
  // 指定混合函数
  // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.useProgram(shaders.lineShaderProgram);
  gl.enableVertexAttribArray(shaders.linePositionAttributeLocation);
  // size=2表示每次迭代读取两个数据，即x和y。由于顶点着色器中gl_Position的类型是vec4，包含x,y,z,w四个数据，而这里只需要前两个x和y。
  // type=gl_FLOAT表示使用的是32为浮点类型的数据。
  // normalize=false表示不需要归一化数据。
  // offset=0表示从缓冲区的开始位置读取数据。
  gl.vertexAttribPointer(shaders.linePositionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  if (color.a) {
    // 设置颜色
    gl.uniform4f(shaders.lineFragColor, color.r, color.g, color.b, color.a);
  } else {
    // 设置颜色
    gl.uniform4f(shaders.lineFragColor, color.r, color.g, color.b, 1);
  }

  // 设置变换矩阵
  gl.uniformMatrix3fv(shaders.lineMatrixLocation, false, matrix);
  gl.drawArrays(gl.TRIANGLES, 0, points.length / 2);
}
/**
   * 绘制线段组
   * @param {*} points 点数据
   * @param {*} matirx 变换矩阵
   * @param {*} color 颜色
   */
function drawLineGroup(gl, shaders, points, matirx, color) {
  createBuffer(gl, points);
  gl.useProgram(shaders.lineShaderProgram);
  gl.enableVertexAttribArray(shaders.linePositionAttributeLocation);
  // size=2表示每次迭代读取两个数据，即x和y。由于顶点着色器中gl_Position的类型是vec4，包含x,y,z,w四个数据，而这里只需要前两个x和y。
  // type=gl_FLOAT表示使用的是32为浮点类型的数据。
  // normalize=false表示不需要归一化数据。
  // offset=0表示从缓冲区的开始位置读取数据。
  gl.vertexAttribPointer(shaders.linePositionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  // 设置颜色
  gl.uniform4f(shaders.lineFragColor, color.r, color.g, color.b, 1);

  // 设置变换矩阵
  gl.uniformMatrix3fv(shaders.lineMatrixLocation, false, matirx);
  gl.drawArrays(gl.LINES, 0, points.length / 2);
}

function drawLineGroupWithVaringColor(gl, shaders, points, matrix, colors) {
  createBuffer(gl, points);
  gl.useProgram(shaders.lineShaderProgramUseVaringColor);
  gl.enableVertexAttribArray(shaders.linePositionAttributeLocationUseVaringColor);
  // size=2表示每次迭代读取两个数据，即x和y。由于顶点着色器中gl_Position的类型是vec4，包含x,y,z,w四个数据，而这里只需要前两个x和y。
  // type=gl_FLOAT表示使用的是32为浮点类型的数据。
  // normalize=false表示不需要归一化数据。
  // offset=0表示从缓冲区的开始位置读取数据。
  gl.vertexAttribPointer(
    shaders.linePositionAttributeLocationUseVaringColor,
    2,
    gl.FLOAT,
    false,
    0,
    0,
  );

  // 设置颜色
  createBuffer(gl, colors);
  gl.enableVertexAttribArray(shaders.lineColorAttributeLocationUseVaringColor);
  // size=2表示每次迭代读取两个数据，即x和y。由于顶点着色器中gl_Position的类型是vec4，包含x,y,z,w四个数据，而这里只需要前两个x和y。
  // type=gl_FLOAT表示使用的是32为浮点类型的数据。
  // normalize=false表示不需要归一化数据。
  // offset=0表示从缓冲区的开始位置读取数据。
  gl.vertexAttribPointer(
    shaders.lineColorAttributeLocationUseVaringColor,
    4,
    gl.FLOAT,
    false,
    0,
    0,
  );

  // 设置变换矩阵
  gl.uniformMatrix3fv(shaders.lineMatrixLocationUseVaringColor, false, matrix);

  gl.drawArrays(gl.LINES, 0, points.length / 2);
}

function drawTranglesWithVaringColor(gl, shaders, points, matrix, colors) {
  createBuffer(gl, points);
  gl.enable(gl.BLEND);
  // 指定混合函数
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.useProgram(shaders.lineShaderProgramUseVaringColor);
  gl.enableVertexAttribArray(shaders.linePositionAttributeLocationUseVaringColor);
  // size=2表示每次迭代读取两个数据，即x和y。由于顶点着色器中gl_Position的类型是vec4，包含x,y,z,w四个数据，而这里只需要前两个x和y。
  // type=gl_FLOAT表示使用的是32为浮点类型的数据。
  // normalize=false表示不需要归一化数据。
  // offset=0表示从缓冲区的开始位置读取数据。
  gl.vertexAttribPointer(shaders.linePositionAttributeLocationUseVaringColor, 2, gl.FLOAT, false, 0, 0);

  // 设置颜色
  createBuffer(gl, colors);
  gl.enableVertexAttribArray(shaders.lineColorAttributeLocationUseVaringColor);
  // size=2表示每次迭代读取两个数据，即x和y。由于顶点着色器中gl_Position的类型是vec4，包含x,y,z,w四个数据，而这里只需要前两个x和y。
  // type=gl_FLOAT表示使用的是32为浮点类型的数据。
  // normalize=false表示不需要归一化数据。
  // offset=0表示从缓冲区的开始位置读取数据。
  gl.vertexAttribPointer(shaders.lineColorAttributeLocationUseVaringColor, 4, gl.FLOAT, false, 0, 0);

  // 设置变换矩阵
  gl.uniformMatrix3fv(shaders.linematrixLocationUseVaringColor, false, matrix);

  gl.drawArrays(gl.TRIANGLES, 0, points.length / 2);
}

function bindFramebuffer(gl, frameBuffer, texture, width, height) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
  if (frameBuffer) {
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    // 新建渲染缓冲区对象作为帧缓冲区的深度缓冲区对象
    const depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    // 检测帧缓冲区对象的配置状态是否成功
    const e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (gl.FRAMEBUFFER_COMPLETE !== e) {
      window.console.log('Frame buffer object is incomplete');
    }
  } else {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  }
}

export {
  drawTrangles, drawLineGroup, drawLineGroupWithVaringColor, drawTranglesWithVaringColor, createBuffer, bindFramebuffer,
};
