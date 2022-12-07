import {
  drawLineGroupWithVaringColor, drawTranglesWithVaringColor,
} from '../../util/common-util';

class Kline {
  constructor(grid) {
    this.grid = grid;
  }

  setData(data) {
    this.data = data;
  }

  refresh() {
    this.drawKline();
  }

  clearCaculateData() {
    this.klineRectPointData = [];
    this.klineRectPointColors = [];
    this.klineLinePointData = [];
    this.klineLinePointColors = [];
  }

  drawKline() {
    const { gl, container } = this.grid.context;
    // 设置使用的着色器和viewport
    gl.useProgram(this.grid.shaders.lineShaderProgram);
    gl.viewport(
      this.grid.left + this.grid.yAxis.padding,
      this.grid.bottom + this.grid.xAxis.padding,
      container.clientWidth - this.grid.left - this.grid.right - this.grid.yAxis.padding - this.grid.yAxis.defaltPadding,
      container.clientHeight - this.grid.top - this.grid.bottom - this.grid.xAxis.padding - this.grid.xAxis.defaltPadding,
    );
    if (!this.grid.klineMatrix) {
      this.grid.generateSeriesMatrix();
    }
    if (!this.klineRectPointData || this.klineRectPointData.length === 0) {
      this.klineRectPointData = [];
      this.klineRectPointColors = [];
      this.klineLinePointData = [];
      this.klineLinePointColors = [];
      this.data.forEach((kline, index) => {
        const openPrice = kline[1];
        const closePrice = kline[2];
        const lowPrice = kline[3];
        const highPrice = kline[4];
        let colors = [];
        if (openPrice > closePrice) {
          colors = [0, 1, 0, 1];
        } else {
          colors = [1, 0, 0, 1];
        }

        this.klineLinePointData.push(index + 0.5);
        this.klineLinePointData.push(highPrice);
        this.klineLinePointData.push(index + 0.5);
        this.klineLinePointData.push(lowPrice);
        this.klineLinePointColors = this.klineLinePointColors.concat(colors);
        this.klineLinePointColors = this.klineLinePointColors.concat(colors);

        this.klineRectPointData.push(index + 0.05);
        this.klineRectPointData.push(openPrice);
        this.klineRectPointData.push(index + 0.95);
        this.klineRectPointData.push(openPrice);
        this.klineRectPointData.push(index + 0.95);
        this.klineRectPointData.push(closePrice);

        this.klineRectPointData.push(index + 0.05);
        this.klineRectPointData.push(openPrice);
        this.klineRectPointData.push(index + 0.05);
        this.klineRectPointData.push(closePrice);
        this.klineRectPointData.push(index + 0.95);
        this.klineRectPointData.push(closePrice);

        this.klineRectPointColors = this.klineRectPointColors.concat(colors);
        this.klineRectPointColors = this.klineRectPointColors.concat(colors);
        this.klineRectPointColors = this.klineRectPointColors.concat(colors);
        this.klineRectPointColors = this.klineRectPointColors.concat(colors);
        this.klineRectPointColors = this.klineRectPointColors.concat(colors);
        this.klineRectPointColors = this.klineRectPointColors.concat(colors);
      });
    }
    drawLineGroupWithVaringColor(
      this.grid.context.gl,
      this.grid.shaders,
      this.klineLinePointData,
      this.grid.klineMatrix,
      this.klineLinePointColors,
    );
    drawTranglesWithVaringColor(
      this.grid.context.gl,
      this.grid.shaders,
      this.klineRectPointData,
      this.grid.klineMatrix,
      this.klineRectPointColors,
    );
  }
}
export default Kline;
