var camera = function () {
  this.deltaAlpha = 0;
  this.deltaBeta = 0;
  this.prevAlpha;
  this.prevBeta;
  this.prevRadius;

  this.alpha = 2.4;
  this.beta = 0.44;
  this.radius = 35;
  this.X;
  this.Y;
  this.Z;

  this.HandleKeyDown = function (keyCode) {
    switch (String.fromCharCode(keyCode)) {
      case "A": this.alpha -= 0.05; break;
      case "D": this.alpha += 0.05; break;
      case "W": this.beta += 0.05; if (this.beta > 1.5) this.beta = 1.5; break;
      case "S": this.beta -= 0.05; if (this.beta < -1.5) this.beta = -1.5; break;
      case "R": this.radius += 0.05; break;
      case "F": this.radius -= 0.05; if (this.radius < 0.5) this.radius = 0.5; break;
    }
    this.Spherical2Cartesian();
  }
  this.UpdatePosition = function (mouseTracking, deltaX, deltaY) {
    if (mouseTracking == 0) {
      this.alpha = this.prevAlpha + deltaX * 0.01;
      this.beta = this.prevBeta + deltaY * 0.01;
      if (this.beta > 1.5)
        this.beta = 1.5;
      if (this.beta < -1.5)
        this.beta = -1.5;
    }
    else if (mouseTracking == 1) {
      this.radius = this.prevRadius - deltaY * 0.01;
    }
    this.Spherical2Cartesian();
  }
  this.Spherical2Cartesian = function () {
    this.X = this.radius * Math.cos(this.beta) * Math.sin(this.alpha);
    this.Z = this.radius * Math.cos(this.beta) * Math.cos(this.alpha);
    this.Y = this.radius * Math.sin(this.beta)
  }
  this.GetPoint = function () {
    return [this.X, this.Y, this.Z]
  }
}
var scenario = function () {
  this.Cam = new camera();
  this.Canvas;
  this.gl;
  this.phongProgram;
  this.colorProgram;
  this.phongTexProgram;
  this.graphicObjects = new Object;
  this.myModel = new Models();
  this.Delay = 10;

  this.CommonConfigure = function () {
    this.Cam.Spherical2Cartesian();
    // set the viewport to be the whole canvas 
    this.gl.viewport(0, 0, this.Canvas.clientWidth, this.Canvas.clientHeight);

    // projection matrix. 
    var ratio = this.Canvas.clientWidth / this.Canvas.clientHeight;
    mat4.perspective(60, ratio, 0.1, 50, Matrices.proj);

    // Set the background clear color to gray. 
    this.gl.clearColor(0.8, 0.8, 0.8, 1.0);
    // general gl settings 
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.DEPTH_TEST);

    // create the shader programs 
    this.phongProgram = this.createProgram("phong_texture_vs", "phong_texture_fs", ["aVec4Position", "aVec3Normal"], ["uMat4PVM", "uMat3Normal", "uMat4ViewModel", "uVec3LightDir", "uVec4Diffuse", "uVec4Specular", "uFloatShininess", "uVec4Ambient"]);
    this.colorProgram = this.createProgram("color_vs", "color_fs", ["aVec4Position"], ["uMat4PVM", "uVec4Diffuse"]);

    Matrices.init();

    var myGridMat = new Material();
    myGridMat.diffuse = new Float32Array([1.0, 1.0, 1.0, 1.0]);

    myGrid = createGrid(1, 18, 36);
    myGrid.setMaterial(myGridMat);
  }
  this.createProgram = function (docVS, docFS, attributes, uniforms) {
    var vs = this.gl.createShader(this.gl.VERTEX_SHADER);
    var fs = this.gl.createShader(this.gl.FRAGMENT_SHADER);

    vsSource = document.getElementById(docVS);
    fsSource = document.getElementById(docFS);

    this.gl.shaderSource(vs, vsSource.text);
    this.gl.shaderSource(fs, fsSource.text);

    this.gl.compileShader(vs);
    this.gl.compileShader(fs);

    if (!this.gl.getShaderParameter(vs, this.gl.COMPILE_STATUS))
      throw ("Shader Error: " + docVS + ": " + this.gl.getShaderInfoLog(vs));
    if (!this.gl.getShaderParameter(fs, this.gl.COMPILE_STATUS))
      throw ("Shader Error: " + docFS + ": " + this.gl.getShaderInfoLog(fs));

    var program = this.gl.createProgram();
    this.gl.attachShader(program, vs);
    this.gl.attachShader(program, fs);

    for (var i = 0; i < attributes.length; ++i) {
      this.gl.bindAttribLocation(program, i, attributes[i]);
    }

    this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS))
      throw ("Program Error: " + this.gl.getProgramInfoLog(program));

    program.uniforms = {};
    for (var i = 0; i < uniforms.length; ++i) {
      program.uniforms[uniforms[i]] = this.gl.getUniformLocation(program, uniforms[i]);
    }
    return (program);
  }
  this.init = function (opt) {
    this.CommonConfigure();
    this.graphicObjects["Grid"] = myGrid;
    this.graphicObjects["Axis"] = createAxis(10);
    if (opt == 0) {
      this.graphicObjects["Tower01"] = new Tower().CreateTower(11, [4, .5, 4], [3, 1, 0], 8, [1, 10, 1], [12, 1, 0]);
      this.graphicObjects["Tower02"] = new Tower().CreateTower(11, [4, .5, 4], [0, 1, 0], 8, [1, 10, 1], [0, 1, 0]);
      this.graphicObjects["Tower03"] = new Tower().CreateTower(11, [4, .5, 4], [-3, 1, 0], 8, [1, 10, 1], [-12, 1, 0]);
      this.graphicObjects["TorusRed"] = new Torus().CreateModel(3.0, 2, 30, 30, 1, 15, [12, 2, 0], [1, 0.5, 1]);
      this.graphicObjects["TorusGreen"] = new Torus().CreateModel(2.4, 1.6, 30, 30, 1, 14, [12, 4, 0], [1, 0.6, 1]);
      this.graphicObjects["TorusBlue"] = new Torus().CreateModel(1.8, 0.7, 30, 30, 1, 13, [12, 6, 0], [1, 1.4, 1]);
      this.graphicObjects["Poster"] = new Poster().CreatePoster('/images/credencialo.png', [8, 4, .1], [-1, 3, 80]);

      for (var step = 0; step < steps.length; step++) {
        this.graphicObjects["TorusRed"].Model.AddMovements(step, steps[step][0]);
        this.graphicObjects["TorusGreen"].Model.AddMovements(step, steps[step][1]);
        this.graphicObjects["TorusBlue"].Model.AddMovements(step, steps[step][2]);
      }
    }
    else {
      this.graphicObjects["Figure01"] = new Figure().CreateFigure('fig01', '/images/texture.jpg', [1, 0.3, 1], [4, 66, 0]);
      this.graphicObjects["Figure02"] = new Figure().CreateFigure('fig02', '', [1, 0.3, 1], [0, 66, 0]);
      this.graphicObjects["Figure03"] = new Figure().CreateFigure('fig03', '', [1, 0.3, 1], [-4, 66, 0]);
      for (var step = 0; step < falls.length; step++) {
        this.graphicObjects["Figure01"].Model.AddMovements(step, falls[step]);
        this.graphicObjects["Figure02"].Model.AddMovements(step, falls[step]);
        this.graphicObjects["Figure03"].Model.AddMovements(step, falls[step]);
      }
    }
  }

  this.Render = function (opt) {
    if (opt == 0) {
      if (counter2 == this.Delay) {
        counter2 = 0;
        movements++;
        this.graphicObjects["TorusRed"].Model.ApplyTranslate(movements);
        this.graphicObjects["TorusGreen"].Model.ApplyTranslate(movements);
        this.graphicObjects["TorusBlue"].Model.ApplyTranslate(movements);

        if (movements == steps.length - 1) {
          movements = -1;
        }
      }
      this.graphicObjects["Grid"].render();
      this.graphicObjects["Axis"].render();
      this.graphicObjects["Tower01"].Render();
      this.graphicObjects["Tower02"].Render();
      this.graphicObjects["Tower03"].Render();
      this.graphicObjects["TorusRed"].Render();
      this.graphicObjects["TorusGreen"].Render();
      this.graphicObjects["TorusBlue"].Render();
      this.graphicObjects["Poster"].Render();
    }
    else {
      if (counter2 == this.Delay) {
        counter2 = 0;
        movements++;
        this.graphicObjects["Figure01"].Model.ApplyTranslate(movements);
        this.graphicObjects["Figure02"].Model.ApplyTranslate(movements);
        this.graphicObjects["Figure03"].Model.ApplyTranslate(movements);

        if (movements == steps.length - 1) {
          movements = -1;
        }
      }
      this.graphicObjects["Grid"].render();
      this.graphicObjects["Axis"].render();
      this.graphicObjects["Figure01"].Render();
      this.graphicObjects["Figure02"].Render();
      this.graphicObjects["Figure03"].Render();
    }
  }
}
function Poster() {
  this.Model;
  this.CreatePoster = function (urlImage, vBaseScale, vBaseTranslate) {
    var mat = new Material();
    mat.setImageTexture(urlImage);
    this.Model = createCube();
    this.Model.setMaterial(mat);
    this.Model.scale(vBaseScale);
    this.Model.translate(vBaseTranslate);
    return this;
  }
  this.Render = function () {
    this.Model.render();
  }
}
function Figure() {
  this.Model;
  this.CreateFigure = function (name, urlMat, vBaseScale, vBaseTranslate) {
    var mat = new Material();
    mat.setImageTexture(urlMat);
    this.Model = createFigure(name);
    this.Model.setMaterial(mat);
    this.Model.scale(vBaseScale);
    this.Model.translate(vBaseTranslate);
    return this;
  }
  this.Render = function () {
    this.Model.render();
  }
}
function Tower() {
  this.Base;
  this.Column;
  this.CreateTower = function (mat, vBaseScale, vBaseTranslate, baseSides, vColumnScale, vColumnTranslate) {
    var material = new Material();
    material.setImageTexture('');
    this.Base = createCube();
    this.Base.setMaterial(material);
    this.Base.setMaterialColor(mat);
    this.Base.scale(vBaseScale);
    this.Base.translate(vBaseTranslate);
    this.Column = createCylinder(baseSides);
    this.Column.setMaterial(material);
    this.Column.setMaterialColor(mat);
    this.Column.translate(vColumnTranslate);
    this.Column.scale(vColumnScale);
    return this;
  }
  this.Render = function () {
    this.Base.render();
    this.Column.render();
  }
}
function Torus() {
  this.Model;
  this.CreateModel = function (r, sr, n, ns, en, mat, vtraslate, vscale) {
    var material = new Material();
    material.setImageTexture('');
    this.Model = createTorus(r, sr, n, ns, en);
    this.Model.setMaterial(material);
    this.Model.setMaterialColor(mat);
    this.Model.translate(vtraslate);
    this.Model.scale(vscale);
    return this;
  }
  this.Render = function () {
    this.Model.render();
  }
}