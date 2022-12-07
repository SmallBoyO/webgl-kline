import {
  drawLineGroup,
} from '../../util/common-util';

class Line {
  constructor(grid, config) {
    this.grid = grid;

    this.pointData = [];
    if (config) {
      this.color = config.color ? config.color : { r: 0, g: 0, b: 0 };
    } else {
      this.color = { r: 0, g: 0, b: 0 };
    }
  }

  setData(data) {
    this.data = data;
    this.clearCaculateData();
  }

  refresh() {
    this.drawLine();
  }

  clearCaculateData() {
    this.pointData = [];
  }

  drawLine() {
    const { gl, container } = this.grid.context;// 设置使用的着色器和viewport
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
    if (!this.pointData || this.pointData.length === 0) {
      const pointData = [];
      let tmp = null;
      this.data.forEach((value, index) => {
        if (typeof value !== 'number') {
          return;
        }
        if (tmp != null) {
          pointData.push(tmp.x);
          pointData.push(tmp.y);
          pointData.push(index);
          pointData.push(value);
        }
        tmp = {
          x: index,
          y: value,
        };
      });
      this.pointData = pointData;
    }
    drawLineGroup(
      gl,
      this.grid.shaders,
      this.pointData,
      this.grid.klineMatrix,
      this.color,
    );
  }
}
export default Line;
