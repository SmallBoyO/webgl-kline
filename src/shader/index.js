// 绘制线的顶点着色器代码
const lineVertexShaderSource = `
    attribute vec2 a_position;
    uniform mat3 matrix;
    void main() {
        gl_Position = vec4((matrix  * vec3(a_position, 1)).xy, 0, 1);
    }
`;
// 绘制线的片原着色器代码
const lineFragmentShaderSource = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }
`;
// 绘制线的顶点着色器代码(每个点的颜色单独传入 费内存)
const lineVertexShaderSourceUseVaringColor = `
    attribute vec2 a_position;
    attribute vec4 a_color;
    uniform mat3 matrix;
    varying vec4 v_color;
    void main() {
        gl_PointSize=100.0;
        gl_Position = vec4((matrix  * vec3(a_position, 1)).xy, 0, 1);
        v_color = a_color;
    }
`;
// 绘制线的片原着色器代码()
const lineFragmentShaderSourceUseVaringColor = `
      precision mediump float;
      varying vec4 v_color;
      void main() {
        gl_FragColor = v_color;
      }
`;
// 绘制图像的顶点着色器代码
const imgVertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;

    uniform mat3 u_matrix;
    
    varying vec2 v_texCoord;
    
    void main() {
      gl_Position = vec4(u_matrix * vec3(a_position,1), 1);
    
      // pass the texCoord to the fragment shader
      // The GPU will interpolate this value between points.
      v_texCoord = a_texCoord;
    }
  `;
const imgFragmentShaderSource = `
    precision mediump float;

    // our texture
    uniform sampler2D u_image;

    // the texCoords passed in from the vertex shader.
    varying vec2 v_texCoord;
    
    void texcoords(vec2 fragCoord, vec2 resolution,out vec2 v_rgbNW, out vec2 v_rgbNE,out vec2 v_rgbSW, out vec2 v_rgbSE,out vec2 v_rgbM) {
      vec2 inverseVP = 1.0 / resolution.xy;
      v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;
      v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;
      v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;
      v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;
      v_rgbM = vec2(fragCoord * inverseVP);
    }
    vec4 fxaa(sampler2D tex, vec2 fragCoord, vec2 resolution,vec2 v_rgbNW, vec2 v_rgbNE,vec2 v_rgbSW, vec2 v_rgbSE,vec2 v_rgbM) {
      vec4 color;
      mediump vec2 inverseVP = vec2(1.0 / resolution.x, 1.0 / resolution.y);
      vec3 rgbNW = texture2D(tex, v_rgbNW).xyz;
      vec3 rgbNE = texture2D(tex, v_rgbNE).xyz;
      vec3 rgbSW = texture2D(tex, v_rgbSW).xyz;
      vec3 rgbSE = texture2D(tex, v_rgbSE).xyz;
      vec4 texColor = texture2D(tex, v_rgbM);
      vec3 rgbM  = texColor.xyz;
      vec3 luma = vec3(0.299, 0.587, 0.114);
      float lumaNW = dot(rgbNW, luma);
      float lumaNE = dot(rgbNE, luma);
      float lumaSW = dot(rgbSW, luma);
      float lumaSE = dot(rgbSE, luma);
      float lumaM  = dot(rgbM,  luma);
      float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));
      float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));
      mediump vec2 dir;
      dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));
      dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));

      float FXAA_REDUCE_MIN = 1.0/128.0;
      float FXAA_REDUCE_MUL = 1.0 / 8.0;
      float FXAA_SPAN_MAX = 8.0;

      float dirReduce = max((lumaNW + lumaNE + lumaSW + lumaSE) *
      (0.25 * FXAA_REDUCE_MUL),  FXAA_REDUCE_MIN);
      float rcpDirMin = 1.0 / (min(abs(dir.x), abs(dir.y)) + dirReduce);
      dir = min(vec2(FXAA_SPAN_MAX, FXAA_SPAN_MAX),
                max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),
                dir * rcpDirMin)) * inverseVP;
      vec3 rgbA = 0.5 * (
                  texture2D(tex, fragCoord * inverseVP + dir * (1.0 / 3.0 - 0.5)).xyz +
                  texture2D(tex, fragCoord * inverseVP + dir * (2.0 / 3.0 - 0.5)).xyz);
      vec3 rgbB = rgbA * 0.5 + 0.25 * (
                  texture2D(tex, fragCoord * inverseVP + dir * -0.5).xyz +
                  texture2D(tex, fragCoord * inverseVP + dir * 0.5).xyz);
          
              float lumaB = dot(rgbB, luma);
              if ((lumaB < lumaMin) || (lumaB > lumaMax))
                  color = vec4(rgbA, texColor.a);
              else
                  color = vec4(rgbB, texColor.a);
              return color;
    }

    vec4 apply(sampler2D tex, vec2 fragCoord, vec2 resolution) {
      mediump vec2 v_rgbNW;
      mediump vec2 v_rgbNE;
      mediump vec2 v_rgbSW;
      mediump vec2 v_rgbSE;
      mediump vec2 v_rgbM;
      //compute the texture coords
      texcoords(fragCoord, resolution, v_rgbNW, v_rgbNE, v_rgbSW, v_rgbSE, v_rgbM);
      
      // //compute FXAA
      return fxaa(tex,fragCoord,resolution,v_rgbNW,v_rgbNE,v_rgbSW,v_rgbSE,v_rgbM);
    }

    void main() {
      vec2 iResolution = vec2(1200.0,500.0);
      vec2 uv = vec2(gl_FragCoord.xy / iResolution.xy);
      uv.y = 1.0 - uv.y;
    
      //can also use gl_FragCoord.xy
      vec2 fragCoord = uv * iResolution; 
      gl_FragColor = texture2D(u_image, v_texCoord);
      // gl_FragColor = apply(u_image, fragCoord, iResolution);
    }
  `;
export default {
  lineVertexShaderSource,
  lineFragmentShaderSource,
  lineVertexShaderSourceUseVaringColor,
  lineFragmentShaderSourceUseVaringColor,
  imgVertexShaderSource,
  imgFragmentShaderSource,
};
