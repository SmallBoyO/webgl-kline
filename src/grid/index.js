import {
  drawTrangles, drawLineGroup,
} from '../util/common-util';
import m3 from '../util/m3';
import Kline from '../series/kline';
import Line from '../series/line';

class Grid {
  init(context, shaders) {
    this.context = context;
    this.shaders = shaders;
    this.axisMatrix = null;
    this.seriesList = [];

    // 初始化一些交互的参数
    this.isMouseDown = false;
    this.mouseDownPosition = null;
    this.mouseStrapPoints = [];
  }

  setConfig(config) {
    this.left = config.left;
    this.right = config.right;
    this.top = config.top;
    this.bottom = config.bottom;
    this.backgroundColor = config.backgroundColor;
    this.xAxis = {
      type: config.xAxis.type,
      data: config.xAxis.data,
      padding: config.xAxis.padding,
      defaltPadding: config.xAxis.defaltPadding,
      markNum: config.xAxis.markNum,
      interval: config.xAxis.interval,
      initialInterval: config.xAxis.interval,
      points: [],
      words: [],
      color: config.xAxis.color,
      fontSize: config.xAxis.fontSize,
    };
    this.yAxis = {
      type: config.yAxis.type,
      data: config.yAxis.data,
      padding: config.yAxis.padding,
      defaltPadding: config.yAxis.defaltPadding,
      markNum: config.yAxis.markNum,
      interval: config.yAxis.interval,
      initialInterval: config.yAxis.interval,
      points: [],
      words: [],
      color: config.yAxis.color,
      fontSize: config.yAxis.fontSize,
    };
    if (this.yAxis.type === 'category') {
      this.yAxis.interval = [0, this.yAxis.data.length];
      this.yAxis.initialInterval = [0, this.yAxis.data.length];
    }
    if (this.xAxis.type === 'category') {
      this.xAxis.interval = [0, this.xAxis.data.length];
      this.xAxis.initialInterval = [0, this.xAxis.data.length];
    }
  }

  setRefreshAll(refreshAll) {
    this.refreshAll = refreshAll;
  }

  addKline() {
    const kline = new Kline(this);
    this.seriesList.push(kline);
    return {
      setData(data) {
        kline.setData(data);
      },
    };
  }

  addLine(config) {
    const line = new Line(this, config);
    this.seriesList.push(line);
    return {
      setData(data) {
        line.setData(data);
      },
    };
  }

  clearSeriesCaculateData() {
    this.seriesList.forEach((series) => {
      if (series.clearCaculateData) {
        series.clearCaculateData();
      }
    });
  }

  generateSeriesMatrix() {
    const { container } = this.context;
    // 计算矩阵
    // 根据分辨率直接生成矩阵
    let projectionMatrix = m3.projection(
      container.clientWidth - this.left - this.right - this.yAxis.padding - this.yAxis.defaltPadding,
      container.clientHeight - this.top - this.bottom - this.xAxis.padding - this.xAxis.defaltPadding,
    );
      // 因为上面的方法生成的矩阵原点在左上方 需要原点在左下方,所以先沿y轴平移canvas高度(向上),在沿y轴翻转 (这样原点的坐标就在左下了)
    const translationMatrix = m3.translation(
      0,
      container.clientHeight - this.top - this.bottom - this.xAxis.padding - this.xAxis.defaltPadding,
    );
    projectionMatrix = m3.multiply(projectionMatrix, translationMatrix);
    // scaling 绕原点翻转(-1 ~ 1)
    projectionMatrix = m3.multiply(projectionMatrix, m3.scaling(1, -1));

    const xTransfer = (this.xAxis.interval[1] - this.xAxis.interval[0])
          / (container.clientWidth - this.left - this.right - this.yAxis.padding - this.yAxis.defaltPadding);
    const yTransfer = (this.yAxis.interval[1] - this.yAxis.interval[0])
            / (container.clientHeight - this.top - this.bottom - this.xAxis.padding - this.xAxis.defaltPadding);
    projectionMatrix = m3.multiply(projectionMatrix, m3.scaling(1 / xTransfer, 1 / yTransfer));
    projectionMatrix = m3.multiply(
      projectionMatrix,
      m3.translation(-this.xAxis.interval[0], -this.yAxis.interval[0]),
    );
    this.klineMatrix = projectionMatrix;
  }

  onmousewheel(x, y, deltaY) {
    const { container } = this.context;
    if (x < (this.left + this.yAxis.padding) || x > container.clientWidth - this.right - this.yAxis.defaltPadding
      || y < (this.bottom + this.xAxis.padding) || y > container.clientHeight - this.top - this.xAxis.defaltPadding) {
      return;
    }
    if (deltaY < 0) {
      // 往上方滚动 放大
      const realX = this.getRealXValueByXPixes(x);
      // 鼠标左右分别变成以前的 90%
      const nextLeft = realX - (realX - this.xAxis.interval[0]) * 0.9;
      const nextRight = realX + (this.xAxis.interval[1] - realX) * 0.9;
      // 重新设置
      this.xAxis.interval[0] = nextLeft;
      this.xAxis.interval[1] = nextRight;

      this.xAxis.points = [];
      this.xAxis.words = [];

      this.klineMatrix = null;
      this.klineRectPointData = [];
      this.clearSeriesCaculateData();
      this.refreshAll();
    }
    if (deltaY > 0) {
      // 往下方滚动 缩小
      const realX = this.getRealXValueByXPixes(x);
      // 鼠标左右分别变成以前的 1.1倍
      let nextLeft = realX - (realX - this.xAxis.interval[0]) * 1.1;
      let nextRight = realX + (this.xAxis.interval[1] - realX) * 1.1;
      if (nextLeft < this.xAxis.initialInterval[0]) {
        // eslint-disable-next-line prefer-destructuring
        nextLeft = this.xAxis.initialInterval[0];
      }
      if (nextRight > this.xAxis.initialInterval[1]) {
        // eslint-disable-next-line prefer-destructuring
        nextRight = this.xAxis.initialInterval[1];
      }
      // 重新设置
      this.xAxis.interval[0] = nextLeft;
      this.xAxis.interval[1] = nextRight;

      this.xAxis.points = [];
      this.xAxis.words = [];

      this.klineMatrix = null;
      this.klineRectPointData = [];
      this.clearSeriesCaculateData();
      this.refreshAll();
    }
  }

  onmousemove(x, y) {
    const { container } = this.context;
    if (this.isMouseDown) {
      const endPoint = {
        x, y,
      };

      let startX = this.mouseDownPosition.x;
      let startY = this.mouseDownPosition.y;
      let endX = endPoint.x;
      let endY = endPoint.y;

      if (this.mouseDownPosition.x < (this.yAxis.padding + this.left)
        || this.mouseDownPosition.x > (container.clientWidth - this.yAxis.defaltPadding - this.right)
        || this.mouseDownPosition.y < (this.xAxis.padding + this.bottom)
        || this.mouseDownPosition.y > (container.clientHeight - this.xAxis.defaltPadding - this.top)) {
        return;
      }
      // 最大不超出边界
      if (endX < this.yAxis.padding + this.left) {
        endX = this.yAxis.padding + this.left;
      }
      if (endX > container.clientWidth - this.yAxis.defaltPadding - this.right) {
        endX = container.clientWidth - this.yAxis.defaltPadding - this.right;
      }
      if (endY < this.xAxis.padding + this.bottom) {
        endY = this.xAxis.padding + this.bottom;
      }
      if (endY > container.clientHeight - this.xAxis.defaltPadding - this.top) {
        endY = container.clientHeight - this.xAxis.defaltPadding - this.top;
      }
      if (startX < this.yAxis.padding + this.left) {
        startX = this.yAxis.padding + this.left;
      }
      if (startX > container.clientWidth - this.yAxis.defaltPadding - this.right) {
        startX = container.clientWidth - this.yAxis.defaltPadding - this.right;
      }
      if (startY < this.xAxis.padding + this.bottom) {
        startY = this.xAxis.padding + this.bottom;
      }
      if (startY > container.clientHeight - this.xAxis.defaltPadding - this.top) {
        startY = container.clientHeight - this.xAxis.defaltPadding - this.top;
      }
      //
      const points = [];
      points.push(startX - this.left);
      points.push(startY - this.bottom);
      points.push(endX - this.left);
      points.push(startY - this.bottom);

      points.push(endX - this.left);
      points.push(startY - this.bottom);
      points.push(endX - this.left);
      points.push(endY - this.bottom);

      points.push(endX - this.left);
      points.push(endY - this.bottom);
      points.push(startX - this.left);
      points.push(endY - this.bottom);

      points.push(startX - this.left);
      points.push(endY - this.bottom);
      points.push(startX - this.left);
      points.push(startY - this.bottom);

      this.mouseStrapPoints = points;

      this.klineRectPointData = [];
      this.clearSeriesCaculateData();
      this.refreshAll();
    }
  }

  onmousedown(x, y) {
    this.isMouseDown = true;
    this.mouseDownPosition = {
      x,
      y,
    };
  }

  onmouseup(x, y) {
    const { container } = this.context;
    if (this.isMouseDown) {
      if (this.mouseDownPosition) {
        if (Math.abs(this.mouseDownPosition.x - x) < 10 && Math.abs(this.mouseDownPosition.y - y) < 10) {
          // doOnclick
        } else {
          // 判断是朝左拉动还是朝右拉动
          let startX = this.mouseDownPosition.x;
          if (startX < this.yAxis.padding + this.left) {
            startX = this.yAxis.padding + this.left;
          }
          if (startX > container.clientWidth - this.yAxis.defaltPadding - this.right) {
            startX = container.clientWidth - this.yAxis.defaltPadding - this.right;
          }
          if (startX < x) {
            // 向右拉动
            let endX = x;
            if (startX < this.yAxis.padding + this.left) {
              startX = this.yAxis.padding;
            }
            if (startX > container.clientWidth - this.yAxis.defaltPadding - this.right) {
              startX = container.clientWidth - this.yAxis.defaltPadding - this.right;
            }
            if (endX < this.yAxis.padding + this.left) {
              endX = this.yAxis.padding;
            }
            if (endX > container.clientWidth - this.yAxis.defaltPadding - this.right) {
              endX = container.clientWidth - this.yAxis.defaltPadding - this.right;
            }

            // 计算开始点和结束点的对应x值
            let realStartX = this.getRealXValueByXPixes(startX);
            let realEndX = this.getRealXValueByXPixes(endX);

            if (this.xAxis.minXInterval) {
              // 判断改变过后的x最大值和最小值的间隔是否小于最小x间隔
              if (realEndX - realStartX < this.xAxis.minXInterval) {
                realEndX = realStartX + this.xAxis.minXInterval;
                if (realEndX > this.xAxis.initialInterval[1]) {
                  // eslint-disable-next-line prefer-destructuring
                  realEndX = this.xAxis.initialInterval[1];
                  realStartX = realEndX - this.xAxis.minXInterval;
                }
              }
            }
            // 设置 x轴左右间隔 刷新
            this.xAxis.interval[0] = realStartX;
            this.xAxis.interval[1] = realEndX;

            this.xAxis.points = [];
            this.xAxis.words = [];

            this.klineMatrix = null;
            this.klineRectPointData = [];
            this.clearSeriesCaculateData();
            this.refreshAll();
          } else {
            // 向左拉动
            // 恢复 x轴左右间隔 刷新
            this.xAxis.interval = [this.xAxis.initialInterval[0], this.xAxis.initialInterval[1]];

            this.xAxis.points = [];
            this.xAxis.words = [];

            this.klineMatrix = null;
            this.klineRectPointData = [];
            this.clearSeriesCaculateData();
            this.refreshAll();
          }
        }
      }
    }
    this.isMouseDown = false;
    this.mouseDownPosition = null;
    this.mouseStrapPoints = [];
    this.klineRectPointData = [];
    this.clearSeriesCaculateData();
    this.refreshAll();
  }

  onmouseleave() {
    this.isMouseDown = false;
    this.mouseDownPosition = null;
    this.mouseStrapPoints = [];
  }

  /**
   * 根据y坐标的位置计算出该位置的y轴value
   * @param {*} y
   */
  getRealYValueByYPixes(y) {
    const { container } = this.context;
    const percent = (y - this.bottom - this.xAxis.padding)
    / (container.clientHeight - this.top - this.bottom - this.xAxis.padding - this.xAxis.defaltPadding);
    const value = this.yAxis.interval[0] + percent * (this.yAxis.interval[1] - this.yAxis.interval[0]);
    return value;
  }

  /**
   * 根据x坐标的位置计算出该位置的x轴value
   * @param {*} y
   */
  getRealXValueByXPixes(x) {
    const { container } = this.context;
    const percent = (x - this.left - this.yAxis.padding)
      / (container.clientWidth - this.left - this.right - this.yAxis.padding - this.yAxis.defaltPadding);
    const value = this.xAxis.interval[0] + percent * (this.xAxis.interval[1] - this.xAxis.interval[0]);
    return value;
  }

  refresh() {
    this.clear();
    this.drawSeriesAxis();
    this.seriesList.forEach((series) => {
      series.refresh();
    });
    this.drawMouseStrap();
  }

  drawMouseStrap() {
    const { gl, container } = this.context;
    // 设置使用的着色器和viewport
    gl.useProgram(this.shaders.lineShaderProgram);
    gl.viewport(
      this.left,
      this.bottom,
      container.clientWidth - this.left - this.right,
      container.clientHeight - this.top - this.bottom,
    );
    if (this.mouseStrapPoints && this.mouseStrapPoints.length > 0) {
      drawLineGroup(
        gl,
        this.shaders,
        this.mouseStrapPoints,
        this.axisMatrix,
        { r: 0, g: 0, b: 0 },
      );
    }
  }

  drawSeriesAxis() {
    const { gl, textCtx, container } = this.context;
    if (!this.axisMatrix) {
      // 计算矩阵
      // 根据分辨率直接生成矩阵
      let projectionMatrix = m3.projection(
        container.clientWidth - this.left - this.right,
        container.clientHeight - this.top - this.bottom,
      );
      // 因为上面的方法生成的矩阵原点在左上方 需要原点在左下方,所以先沿y轴平移canvas高度(向上),在沿y轴翻转 (这样原点的坐标就在左下了)
      const translationMatrix = m3.translation(
        0,
        container.clientHeight - this.top - this.bottom,
      );
      projectionMatrix = m3.multiply(projectionMatrix, translationMatrix);
      // scaling 绕原点翻转(-1 ~ 1)
      projectionMatrix = m3.multiply(projectionMatrix, m3.scaling(1, -1));
      this.axisMatrix = projectionMatrix;
    }
    // 设置使用的着色器和viewport
    gl.useProgram(this.shaders.lineShaderProgram);
    gl.viewport(
      this.left,
      this.bottom,
      container.clientWidth - this.left - this.right,
      container.clientHeight - this.top - this.bottom,
    );

    const realPaddingX = this.xAxis.padding;
    const realPaddingY = this.yAxis.padding;

    // 先计算xaxis yaxis各自的点的坐标
    if (this.yAxis.points.length === 0) {
      // 因为要计算文字长度 所以先设置文字字体和大小
      textCtx.font = `${this.yAxis.fontSize}px sans-serif`;
      // 先清空文字缓存
      this.yAxis.words = [];
      // 一条直线
      this.yAxis.points = this.yAxis.points.concat(
        [
          realPaddingY,
          realPaddingX,
          realPaddingY,
          container.clientHeight - this.top - this.bottom - this.xAxis.defaltPadding,
        ],
      );

      const yMarkInterval = (container.clientHeight
         - this.xAxis.padding - this.xAxis.defaltPadding - this.top - this.bottom)
       / this.yAxis.markNum;
      const tmpYMarkStartY = realPaddingX;
      const startYvalue = this.yAxis.interval[0];
      const yValueMarkInterval = (this.yAxis.interval[1] - this.yAxis.interval[0])
      / this.yAxis.markNum;
      for (let j = 0; j <= this.yAxis.markNum; j += 1) {
        const tmpY = tmpYMarkStartY + j * yMarkInterval;
        const tmpYvalue = (startYvalue + j * yValueMarkInterval).toFixed(2);

        this.yAxis.points = this.yAxis.points.concat([realPaddingY, tmpY, realPaddingY - 5, tmpY]);
        let ystr = '';
        if (this.yAxis.yAxisMarkFormatter) {
          ystr = this.yAxis.yAxisMarkFormatter(tmpYvalue);
        } else {
          ystr = tmpYvalue.toString();
        }
        this.yAxis.words.push({
          str: ystr,
          x: realPaddingY - textCtx.measureText(ystr).width - 8 + this.left,
          y: container.height - tmpY + this.yAxis.fontSize / 2 - this.bottom,
        });
      }
    }
    if (this.xAxis.points.length === 0) {
      // 因为要计算文字长度 所以先设置文字字体和大小
      textCtx.font = `${this.xAxis.fontSize}px sans-serif`;
      // 先清空文字缓存
      this.xAxis.words = [];
      this.xAxis.points = this.xAxis.points.concat(
        [realPaddingY,
          realPaddingX,
          gl.canvas.clientWidth - this.yAxis.defaltPadding - this.right - this.left,
          realPaddingX],
      );
      // 直线上的多个节点
      const xMarkInterval = (container.clientWidth - this.yAxis.padding
         - this.yAxis.defaltPadding - this.left - this.right)
      / this.xAxis.markNum;
      const tmpXMarkStartX = realPaddingY;
      const startXvalue = this.xAxis.interval[0];
      const xValueMarkInterval = (this.xAxis.interval[1] - this.xAxis.interval[0]) / this.xAxis.markNum;
      // if (this.xAxis.type === 'category')
      for (let i = 0; i <= this.xAxis.markNum; i += 1) {
        const tmpX = tmpXMarkStartX + i * xMarkInterval;
        const tmpXvalue = (startXvalue + i * xValueMarkInterval).toFixed(2);
        this.xAxis.points = this.xAxis.points.concat([tmpX, realPaddingX, tmpX, realPaddingX - 5]);
        let xstr = '';
        if (i === 0) {
          const tmp = this.xAxis.data[Math.ceil(tmpXvalue)];
          xstr = tmp;
        } else if (i === this.xAxis.markNum) {
          const tmp = this.xAxis.data[Math.floor(tmpXvalue) - 1];
          xstr = tmp;
        } else {
          const tmp = this.xAxis.data[Math.floor(tmpXvalue)];
          xstr = tmp;
        }
        this.xAxis.words.push({
          str: xstr,
          x: tmpX - textCtx.measureText(xstr).width / 2 + this.left,
          // 减去了字体高度和 小标签的高度
          y: container.height - (realPaddingX - this.xAxis.fontSize - 5) - this.bottom,
        });
      }
    }
    // 绘制x轴
    drawLineGroup(
      this.context.gl,
      this.shaders,
      this.xAxis.points,
      this.axisMatrix,
      this.xAxis.color,
    );
    textCtx.fillStyle = `rgb(${this.xAxis.color.r * 255},${this.xAxis.color.g * 255},${this.xAxis.color.b * 255})`;
    textCtx.font = `${this.xAxis.fontSize}px sans-serif`;
    this.xAxis.words.forEach((word) => {
      textCtx.fillText(word.str, word.x, word.y);
    });

    // 绘制y轴
    drawLineGroup(
      this.context.gl,
      this.shaders,
      this.yAxis.points,
      this.axisMatrix,
      this.yAxis.color,
    );
    textCtx.fillStyle = `rgb(${this.yAxis.color.r * 255},${this.yAxis.color.g * 255},${this.yAxis.color.b * 255})`;
    textCtx.font = `${this.yAxis.fontSize}px sans-serif`;
    this.yAxis.words.forEach((word) => {
      textCtx.fillText(word.str, word.x, word.y);
    });
  }

  clear() {
    this.context.gl.viewport(
      0,
      0,
      this.context.container.clientWidth,
      this.context.container.clientHeight,
    );
    if (!this.Matrix) {
      // 计算矩阵
      // 根据分辨率直接生成矩阵
      let projectionMatrix = m3.projection(
        this.context.gl.canvas.clientWidth,
        this.context.gl.canvas.clientHeight,
      );
      // 因为上面的方法生成的矩阵原点在左上方 需要原点在左下方,所以先沿y轴平移canvas高度(向上),在沿y轴翻转 (这样原点的坐标就在左下了)
      const translationMatrix = m3.translation(
        0,
        this.context.gl.canvas.clientHeight,
      );
      projectionMatrix = m3.multiply(projectionMatrix, translationMatrix);
      // scaling 绕原点翻转(-1 ~ 1)
      projectionMatrix = m3.multiply(projectionMatrix, m3.scaling(1, -1));
      this.Matrix = projectionMatrix;
    }
    drawTrangles(
      this.context.gl,
      this.shaders,
      [
        this.left,
        this.context.gl.canvas.clientHeight - this.top,
        this.context.gl.canvas.clientWidth - this.right,
        this.context.gl.canvas.clientHeight - this.top,
        this.context.gl.canvas.clientWidth - this.right,
        this.bottom,

        this.left,
        this.context.gl.canvas.clientHeight - this.top,
        this.context.gl.canvas.clientWidth - this.right,
        this.bottom,
        this.left,
        this.bottom,
      ],
      this.Matrix,
      this.backgroundColor,
    );
  }
}

export default Grid;
