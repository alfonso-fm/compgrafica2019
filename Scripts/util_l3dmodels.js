


function Matrices() {
    var normal;
    var vm;
    var pvm;
    var stack;
}

Matrices.init = function () {
  Matrices.normal = mat3.create();
  Matrices.vm = mat4.create();
  Matrices.pvm = mat4.create();
  Matrices.stack = new Array();
}

Matrices.compDerived = function () {
  mat4.multiply(Matrices.view, Matrices.model, Matrices.vm);
  mat4.multiply(Matrices.proj, Matrices.vm, Matrices.pvm);
  mat4.toInverseMat3(Matrices.vm, Matrices.normal);
  mat3.transpose(Matrices.normal);
}

Matrices.getN = function () {
  return Matrices.normal;
}

Matrices.getVM = function () {
  return Matrices.vm;
}

Matrices.getPVM = function () {
  return Matrices.pvm;
}

// Matrix stack functions
Matrices.push = function (mat) {
  Matrices.stack.push(mat4.create(mat));
}

Matrices.pop = function () {
  return Matrices.stack.pop();
}

// The three pipeline matrices
Matrices.proj = mat4.create();
Matrices.view = mat4.create();
Matrices.model = mat4.create();

// --------------------------------------------------------------------------------------
//  Materials
// --------------------------------------------------------------------------------------
function Material() {
  this.diffuse = new Float32Array([0.8, 0.8, 0.8, 1.0]);
  this.specular = new Float32Array([0.8, 0.8, 0.8, 1.0]);
  this.shininess = 128;
  this.ambient = new Float32Array([0.2, 0.2, 0.2, 1.0]);
  this.texID = null;
  this.Texture;
  Material.textureLoader = function (tex, i, type, flip) {
    if (type == undefined)
      type = gl.RGBA;
    if (flip == undefined || flip == true)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, type, type, gl.UNSIGNED_BYTE, i);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
  Material.textureImageLoader = function(tex, i){
    type = gl.RGBA;
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, type, type, gl.UNSIGNED_BYTE, i);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, tex);
  }
  this.setTexture = function (src, type, flip) {
    if (Material.textures[src] == undefined)
      Material.loadTexture(src, type, flip);
    this.texID = Material.textures[src];
  }
  this.setImageTexture = function (src) {
    this.Texture = Material.loadImageTexture(src);
    this.texID = Material.textures[src];
  }
}
Material.loadTexture = function (src) {
  var i = new Image();
  var tex = gl.createTexture();
  Material.textures[src] = tex;
  i.onload = function () {
    Material.textureLoader(tex, i, type, flip);
  }
  i.src = src;
}
Material.loadImageTexture = function (src) {
  //var i = new Image();
  //var tex = gl.createTexture();
  //gl.bindTexture(gl.TEXTURE_2D, tex);
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  //Material.textures[src] = tex;
  //i.onload = function () {
  //  Material.textureImageLoader(tex, i);
  //}
  //i.src = src;



  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  var level = 0;
  var internalFormat = gl.RGBA;
  var width = 1;
  var height = 1;
  var border = 0;
  var srcFormat = gl.RGBA;
  var srcType = gl.UNSIGNED_BYTE;
  var pixel = new Uint8Array([255, 255, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

  var image = new Image();
  image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

    // WebGL1 has different requirements for power of 2 images
    // vs non power of 2 images so check if the image is a
    // power of 2 in both dimensions.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
      // Yes, it's a power of 2. Generate mips.
      gl.generateMipmap(gl.TEXTURE_2D);
    }
    else {
      // No, it's not a power of 2. Turn of mips and set
      // wrapping to clamp to edge
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = src;
  return texture;
}
Material.textures = new Array();
function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}
// --------------------------------------------------------------------------------------
//  Models - basically an array of Model
// --------------------------------------------------------------------------------------
function Models() {
  this.set = new Array();
  this.localTrans = mat4.create();
  mat4.identity(this.localTrans);
  this.add = add;
  function add(model) {
    if (Object.prototype.toString.call(model) === '[object Array]')
      this.set = this.set.concat(model)
    else
      this.set.push(model);
  }

  this.render = render;
  function render() {
    Matrices.push(Matrices.model);
    mat4.multiply(Matrices.model, this.localTrans);
    for (var i = 0; i < this.set.length; ++i) {
      this.set[i].render();
    }
    Matrices.model = Matrices.pop();
  }

  this.create = create;
  function create(type, buffers, ind) {
    var m = model.create(type, buffers, ind);
    this.set.push(m);
  }

  this.setMaterialColor = setMaterialColor;
  function setMaterialColor(id) {
    for (var i = 0; i < this.set.length; ++i) {
      this.set[i].setMaterialColor(id);
    }
  }

  this.setMeshMaterialColor = setMeshMaterialColor;
  function setMeshMaterialColor(mesh, id) {

    this.set[mesh].setMaterialColor(id);
  }

  this.setMaterial = setMaterial;
  function setMaterial(id, mat) {
    this.set[id].setMaterial(mat);
  }

  Models.handleLoadedModel = function (objectData, models) {
    for (var i = 0; i < objectData.model.length; i++) {
      var m = new Model();
      var aux = new Array();
      aux.push(new Float32Array(objectData.model[i].position));

      if (objectData.model[i].normal != undefined)
        aux.push(new Float32Array(objectData.model[i].normal));
      else
        aux.push([]);

      if (objectData.model[i].texCoord != undefined)
        aux.push(new Float32Array(objectData.model[i].texCoord));
      else
        aux.push([]);

      m.create(gl.TRIANGLES, aux, new Uint16Array(objectData.model[i].indices));

      if (objectData.model[i].material != undefined) {

        var mat = new Material();
        if (objectData.model[i].material.diffuse != undefined)
          mat.diffuse = objectData.model[i].material.diffuse;
        if (objectData.model[i].material.specular != undefined)
          mat.specular = objectData.model[i].material.specular;
        if (objectData.model[i].material.shininess != undefined)
          mat.shininess = objectData.model[i].material.shininess;
        if (objectData.model[i].material.ambient != undefined)
          mat.ambient = objectData.model[i].material.ambient;
        if (objectData.model[i].material.texture != undefined)
          mat.setTexture(objectData.model[i].material.texture);
        m.setMaterial(mat);
      }

      var matrix = mat4.create();
      mat4.identity(matrix);
      var tmpX = 1 / Math.abs(objectData.boundingBox[3] - objectData.boundingBox[0]);
      var tmpY = 1 / Math.abs(objectData.boundingBox[4] - objectData.boundingBox[1]);
      var tmpZ = 1 / Math.abs(objectData.boundingBox[5] - objectData.boundingBox[2]);
      var tmp = tmpX < tmpY ? tmpY : tmpX;
      tmp = tmp < tmpZ ? tmpZ * 2 : tmp * 2;
      mat4.scale(matrix, vec3.create([tmp, tmp, tmp]));
      mat4.translate(matrix, vec3.create([-(objectData.boundingBox[3] + objectData.boundingBox[0]) * 0.5,
          -(objectData.boundingBox[4] + objectData.boundingBox[1]) * 0.5,
          -(objectData.boundingBox[5] + objectData.boundingBox[2]) * 0.5]));

      m.setLocalTrans(matrix);
      models.add(m);
    }
  }
}

Models.loadModel = function (file) {
  var m = new Models();
  Models.handleLoadedModel(modelJson, m);
  return m;
}

// --------------------------------------------------------------------------------------
//  Model - represents a mesh with local transformation and material
// --------------------------------------------------------------------------------------
function Model() {
  this.vbo = [-1, -1, -1];
  this.ind = -1;
  this.vertexCount = 0;
  this.mat = new Material();
  this.localTrans = mat4.create();
  mat4.identity(this.localTrans);
  this.ready = 0;
  this.create = create;
  this.positions = [[0, 7, 0], [7, 0, 0], [0, 0, 7]];
  this.movements = [];
  function create(type, buffers, ind) {
    if (ind != undefined) {
      this.ind = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ind);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ind, gl.STATIC_DRAW);
      this.vertexCount = ind.length;
    }
    else {
      this.ind = 0;
      this.vertexCount = buffers[0].length / 4;
    }
    this.type = type;

    for (var i = 0; i < buffers.length; ++i) {
      if (buffers[i].length != 0) {
        this.vbo[i] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[i]);
        gl.bufferData(gl.ARRAY_BUFFER, buffers[i], gl.STATIC_DRAW);
      }
      else
        this.vbo[i] = -1;
    }
    this.ready = 1;

  }

  this.render = function () {
    if (!this.ready)
      return;
    var program = gl.getParameter(gl.CURRENT_PROGRAM);
    if (program.uniforms["uVec4Diffuse"] != undefined)
      gl.uniform4fv(program.uniforms["uVec4Diffuse"], this.mat.diffuse);
    if (program.uniforms["uVec4Specular"] != undefined)
      gl.uniform4fv(program.uniforms["uVec4Specular"], this.mat.specular);
    if (program.uniforms["uFloatShininess"] != undefined)
      gl.uniform1f(program.uniforms["uFloatShininess"], this.mat.shininess);
    if (program.uniforms["uVec4Ambient"] != undefined)
      gl.uniform4fv(program.uniforms["uVec4Ambient"], this.mat.ambient);
    if (program.uniforms["uSamp2DTexID"] != undefined)
      gl.uniform1i(program.uniforms["uSamp2DTexID"], 0);

    //gl.bindTexture(gl.TEXTURE_2D, this.mat.texID);
    gl.bindTexture(gl.TEXTURE_2D, this.mat.Texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    //        if (this.localTrans != 0) {
    Matrices.push(Matrices.model);
    mat4.multiply(Matrices.model, this.localTrans);
    Matrices.compDerived();
    //       }
    if (program.uniforms["uMat4Model"] != undefined)
      gl.uniformMatrix4fv(program.uniforms["uMat4Model"], false, Matrices.model);
    if (program.uniforms["uMat4View"] != undefined)
      gl.uniformMatrix4fv(program.uniforms["uMat4View"], false, Matrices.model);
    if (program.uniforms["uMat4Proj"] != undefined)
      gl.uniformMatrix4fv(program.uniforms["uMat4Proj"], false, Matrices.model);
    if (program.uniforms["uMat4ViewModel"] != undefined)
      gl.uniformMatrix4fv(program.uniforms["uMat4ViewModel"], false, Matrices.getVM());
    if (program.uniforms["uMat4PVM"] != undefined)
      gl.uniformMatrix4fv(program.uniforms["uMat4PVM"], false, Matrices.getPVM());
    if (program.uniforms["uMat3Normal"] != undefined)
      gl.uniformMatrix3fv(program.uniforms["uMat3Normal"], false, Matrices.getN());

    //        if (this.localTrans != 0) {
    Matrices.model = Matrices.pop();
    //            Matrices.compDerived();
    //       }

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[0]);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    if (this.vbo[1] != -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[1]);
      gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(1);
    }
    else
      gl.disableVertexAttribArray(1);

    if (this.vbo[2] != -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo[2]);
      gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(2);
    }
    else
      gl.disableVertexAttribArray(2);


    if (this.ind != 0) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ind);
      gl.drawElements(this.type, this.vertexCount, gl.UNSIGNED_SHORT, 0);
    }
    else
      gl.drawArrays(this.type, 0, this.vertexCount);

  }

  this.setMaterialColor = function (id) {
    this.mat.ambient[0] = colors[id][0]; this.mat.ambient[1] = colors[id][1]; this.mat.ambient[2] = colors[id][2];
    this.mat.diffuse[0] = colors[id][3]; this.mat.diffuse[1] = colors[id][4]; this.mat.diffuse[2] = colors[id][5];
    this.mat.specular[0] = colors[id][6]; this.mat.specular[1] = colors[id][7]; this.mat.specular[2] = colors[id][8];
    this.mat.shininess = colors[id][9];
    var y = 9;
  }

  this.setMaterial = function (mat) {
    this.mat = mat;
  }
  this.setLocalTrans = function (mat) {
    this.localTrans = mat4.create(mat);
  }  
  this.scale = function (vector) {
    mat4.scale(this.localTrans, vec3.create(vector));
  }
  this.translate = function (vector) {
    mat4.translate(this.localTrans, vec3.create(vector));
  }
  this.ApplyTranslate = function (i) {
    this.translate(this.movements[i]);
  }
  this.AddMovements = function (index, vector) {
    this.movements[index] = vector;
  }
}

// --------------------------------------------------------------------------------------
//  Geometry constructors
// --------------------------------------------------------------------------------------
function createAxis(size) {
  var red = new Material();
  red.diffuse[1] = 0.0; red.diffuse[2] = 0.0;
  red.ambient[1] = 0.0; red.ambient[2] = 0.0;
  var green = new Material();
  green.diffuse[0] = 0; green.diffuse[2] = 0;
  green.ambient[0] = 0; green.ambient[2] = 0;
  var blue = new Material();
  blue.diffuse[0] = 0; blue.diffuse[1] = 0;
  blue.ambient[0] = 0; blue.ambient[1] = 0;
  if (size == undefined)
    size = 1;
  var m = createVector([0, -size, 0], [0, size, 0], 0.03, green);
  var m1 = createVector([-size, 0, 0], [size, 0, 0], 0.03, red);
  var m2 = createVector([0, 0, -size], [0, 0, size], 0.03, blue);
  m.add(m1);
  m.add(m2);
  return (m);
}
function createAxisXZ(size) {
  var grey = new Material();
  grey.diffuse[0] = 0.7; grey.diffuse[1] = 0.7; grey.diffuse[2] = 0.7;
  grey.ambient[0] = 0.35; grey.ambient[1] = 0.35; grey.ambient[2] = 0.35;
  if (size == undefined)
    size = 1;
  var m = createVector([-size, 0, 0], [size, 0, 0], 0.03, grey);
  var m1 = createVector([0, 0, -size], [0, 0, size], 0.03, grey);
  m.add(m1);
  return (m);
}
function createAxisXY(size) {
  var grey = new Material();
  grey.diffuse[0] = 0.7; grey.diffuse[1] = 0.7; grey.diffuse[2] = 0.7;
  grey.ambient[0] = 0.35; grey.ambient[1] = 0.35; grey.ambient[2] = 0.35;
  if (size == undefined)
    size = 1;
  var m = createVector([-size, 0, 0], [size, 0, 0], 0.03, grey);
  var m1 = createVector([0, -size, 0], [0, size, 0], 0.03, grey);
  m.add(m1);
  return (m);
}
function createAxisYZ(size) {
  var grey = new Material();
  grey.diffuse[0] = 0.7; grey.diffuse[1] = 0.7; grey.diffuse[2] = 0.7;
  grey.ambient[0] = 0.35; grey.ambient[1] = 0.35; grey.ambient[2] = 0.35;
  if (size == undefined)
    size = 1;
  var m = createVector([0, -size, 0], [0, size, 0], 0.03, grey);
  var m1 = createVector([0, 0, -size], [0, 0, size], 0.03, grey);
  m.add(m1);
  return (m);
}
function createVector(from, to, radius, material) {
  var r = 0.03;
  if (radius != undefined)
    r = radius;
  var x = vec3.create(); x.set([1, 0, 0]);
  var y = vec3.create(); y.set([to[0] - from[0], to[1] - from[1], to[2] - from[2]]);
  var z = vec3.create(); z.set([0, 0, 1]);

  var l = vec3.length(y) - 6 * r; // 0.45 is the tip's size

  var d1 = vec3.dot(y, z);
  var d2 = vec3.dot(y, x);

  if (Math.abs(d1) < Math.abs(d2)) {
    vec3.cross(y, z, x);
    vec3.cross(x, y, z);
  }
  else {
    vec3.cross(x, y, z);
    vec3.cross(y, z, x);
  }

  vec3.normalize(y);
  vec3.normalize(x);
  vec3.normalize(z);

  var maux = [x[0], x[1], x[2], 0.0, y[0], y[1], y[2], 0, z[0], z[1], z[2], 0, 0, 0, 0, 1];
  var m = mat4.create();
  m.set(maux);

  var m1 = mat4.create();
  mat4.identity(m1);
  var fromV = vec3.create(); fromV.set(from);
  mat4.translate(m1, fromV);
  mat4.multiply(m1, m);
  var scaleV = vec3.create(); scaleV.set([r * 0.5, l, r * 0.5]);
  mat4.scale(m1, scaleV);

  var cy = createCylinder(8);
  cy.setLocalTrans(m1);

  mat4.identity(m1);
  var toV = vec3.create(); toV.set(to);
  mat4.translate(m1, toV);
  mat4.multiply(m1, m);
  scaleV.set([r, 3 * r, r]);
  mat4.scale(m1, scaleV);
  var t = vec3.create(); t.set([0, -2, 0]);
  mat4.translate(m1, t);

  var co = createCone(8);
  co.setLocalTrans(m1);

  if (material != undefined) {
    co.setMaterial(material);
    cy.setMaterial(material);
  }
  var vec = new Models();
  vec.add(co); vec.add(cy);
  return vec;
}
function createDashedLine(from, to, material) {
  var p = new Array();
  var dashSize = 0.05;
  var res = [to[0] - from[0], to[1] - from[1], to[2] - from[2]];
  var len = Math.sqrt(res[0] * res[0] + res[1] * res[1] + res[2] * res[2]);

  if (dashSize * 3 > len)
    dashSize = len / 3;

  var divisions = Math.floor((len - dashSize) / dashSize);
  if (divisions % 2 == 0)
    divisions += 1;

  dashSize = len / divisions;

  res[0] = res[0] / len * dashSize;
  res[1] = res[1] / len * dashSize;
  res[2] = res[2] / len * dashSize;

  var f = [from[0], from[1], from[2]];

  for (var i = 0; i < divisions; i += 2) {

    p.push(f[0], f[1], f[2], 1.0);
    p.push(f[0] + res[0], f[1] + res[1], f[2] + res[2], 1);
    f[0] = f[0] + 2 * res[0]; f[1] = f[1] + 2 * res[1]; f[2] = f[2] + 2 * res[2];
  }
  p.push(to[0] - res[0], to[1] - res[1], to[2] - res[2], 1);
  p.push(to[0], to[1], to[2], 1);

  var pp = new Float32Array(p);
  var myDashLine = new Model();
  myDashLine.create(gl.LINES, [pp]);
  if (material != undefined)
    myDashLine.setMaterial(material);

  return myDashLine;
}
function createLine(from, to, material) {

    var p = new Array();

    p.push(from[0], from[1], from[2], 1.0);
    p.push(to[0], to[1], to[2], 1.0);

    var pp = new Float32Array(p);
    var myLine = new Model();
    myLine.create(gl.LINES, [pp]);
    if (material != undefined)
        myLine.setMaterial(material);

    return myLine;
}
function createDashedArc(radius, angle, material) {

    var dashSize = 0.05;

    var p = new Array();
    var angRad = 2 * Math.PI * angle / 360.0;
    var len = radius * angRad;
    var divisions = Math.floor((len - dashSize) / dashSize);
    if (divisions % 2 == 0)
        divisions += 1;

    dashSize = len / divisions;

    angStep = angRad / divisions;

    for (var i = 0; i < divisions; i += 2) {

        p.push(radius * Math.sin(angStep * i), 0, radius * Math.cos(angStep * i), 1);
        p.push(radius * Math.sin(angStep * (i + 1)), 0, radius * Math.cos(angStep * (i + 1)), 1);
    }
    p.push(radius * Math.sin(angStep * (i - 1)), 0, radius * Math.cos(angStep * (i - 1)), 1.0);
    p.push(radius * Math.sin(angRad), 0, radius * Math.cos(angRad), 1.0);

    var pp = new Float32Array(p);
    var myDashArc = new Model();
    myDashArc.create(gl.LINES, [pp]);
    if (material != undefined)
        myDashArc.setMaterial(material);

    return myDashArc;
}
function createArc(radius, angle, material) {

    var num = Math.floor(32 * radius * angle/360);

    var p = new Array();
    var angRad = 2 * Math.PI * angle / 360.0;

    var angStep = angRad / num;

    for (var i = 0; i < num+1; ++i) {

        p.push(radius * Math.sin(angStep * i), 0, radius * Math.cos(angStep * i), 1);
    }

    var pp = new Float32Array(p);
    var myArc = new Model();
    myArc.create(gl.LINE_STRIP, [pp]);
    if (material != undefined)
        myArc.setMaterial(material);

    return myArc;
}
function createCube(material) {
    var myCube = new Model();
    var p = new Array();
    var n = new Array();
    var t = new Array();

    // front side
    p.push(-1, -1, 1, 1); p.push(1, 1, 1, 1); p.push(-1, 1, 1, 1);
    n.push(0, 0, 1); n.push(0, 0, 1); n.push(0, 0, 1);
    t.push(0, 0); t.push(1, 1); t.push(0, 1);

    p.push(-1, -1, 1, 1); p.push(1, -1, 1, 1); p.push(1, 1, 1, 1);
    n.push(0, 0, 1); n.push(0, 0, 1); n.push(0, 0, 1);
    t.push(0, 0); t.push(1, 0); t.push(1, 1);

    // back side
    p.push(-1, -1, -1, 1); p.push(-1, 1, -1, 1); p.push(1, 1, -1, 1);
    n.push(0, 0, -1); n.push(0, 0, -1); n.push(0, 0, -1);
    t.push(1, 0) ; t.push(1, 1); t.push(0, 1); 

    p.push(-1, -1, -1, 1); p.push(1, 1, -1, 1); p.push(1, -1, -1, 1);
    n.push(0, 0, -1); n.push(0, 0, -1); n.push(0, 0, -1);
    t.push(1, 0); t.push(0, 1); t.push(0, 0);

    // left side
    p.push(-1, -1, 1, 1); p.push(-1, 1, -1, 1); p.push(-1, -1, -1, 1);
    n.push(-1, 0, 0);     n.push(-1, 0, 0);     n.push(-1, 0, 0);
    t.push(1, 0);         t.push(0, 1);         t.push(0, 0)

    p.push(-1, -1, 1, 1); p.push(-1, 1, 1, 1); p.push(-1, 1, -1, 1);
    n.push(-1, 0, 0); n.push(-1, 0, 0); n.push(-1, 0, 0);
    t.push(1, 0); t.push(1, 1); t.push(0, 1);

    // right side
    p.push(1, -1, 1, 1); p.push(1, -1, -1, 1); p.push(1, 1, -1, 1);
    n.push(1, 0, 0);     n.push(1, 0, 0);      n.push(1, 0, 0);
    t.push(0, 0);        t.push(1, 0);         t.push(1, 1);

    p.push(1, -1, 1, 1); p.push(1, 1, -1, 1); p.push(1, 1, 1, 1);
    n.push(1, 0, 0);     n.push(1, 0, 0);     n.push(1, 0, 0);
    t.push(0, 0);        t.push(1, 1);        t.push(0, 1);

    // top side
    p.push(1, 1, 1, 1); p.push(-1, 1, -1, 1); p.push(-1, 1, 1, 1);
    n.push(0, 1, 0);    n.push(0, 1, 0);      n.push(0, 1, 0);
    t.push(1, 0);       t.push(0, 1);         t.push(0, 0);

    p.push(1, 1, 1, 1); p.push(1, 1, -1, 1); p.push(-1, 1, -1, 1);
    n.push(0, 1, 0);    n.push(0, 1, 0);     n.push(0, 1, 0);
    t.push(1, 0);       t.push(1, 1);        t.push(0, 1);

    // bottm side
    p.push(1, -1, 1, 1); p.push(-1, -1, 1, 1); p.push(-1, -1, -1, 1);
    n.push(0, -1, 0);    n.push(0, -1, 0);     n.push(0, -1, 0);
    t.push(1, 1);        t.push(0, 1);         t.push(0, 0);

    p.push(1, -1, 1, 1); p.push(-1, -1, -1, 1); p.push(1, -1, -1, 1);
    n.push(0, -1, 0);    n.push(0, -1, 0);      n.push(0, -1, 0);
    t.push(1, 1);        t.push(0, 0);          t.push(1, 0);

    var pp = new Float32Array(p);
    var nn = new Float32Array(n);
    var tt = new Float32Array(t);
    myCube.create(gl.TRIANGLES, [pp,nn,tt]);
    if (material != undefined)
        myCube.setMaterial(material);

    return myCube;
}
function createFigure(nameFig, material) {
  var myFigure = new Model();
  var p = new Array();
  var n = new Array();
  var t = new Array();

  var fig = figures[nameFig];
  for (var i = 0; i < fig.length; i++) {
    p.push(fig[i][0][0][0], fig[i][0][0][1], fig[i][0][0][2], fig[i][0][0][3]);
    p.push(fig[i][0][1][0], fig[i][0][1][1], fig[i][0][1][2], fig[i][0][1][3]);
    p.push(fig[i][0][2][0], fig[i][0][2][1], fig[i][0][2][2], fig[i][0][2][3]);

    n.push(fig[i][1][0][0], fig[i][1][0][1], fig[i][1][0][2]);
    n.push(fig[i][1][1][0], fig[i][1][1][1], fig[i][1][1][2]);
    n.push(fig[i][1][2][0], fig[i][1][2][1], fig[i][1][2][2]);

    t.push(fig[i][2][0][0], fig[i][2][0][1]);
    t.push(fig[i][2][1][0], fig[i][2][1][1]);
    t.push(fig[i][2][2][0], fig[i][2][2][1]);
  }

  var pp = new Float32Array(p);
  var nn = new Float32Array(n);
  var tt = new Float32Array(t);
  myFigure.create(gl.TRIANGLES, [pp, nn, tt]);
  if (material != undefined)
    myFigure.setMaterial(material);

  return myFigure;
}
function createCone(sides, material) {
    var myCone = new Model();
    var p = new Array();
    var n = new Array();
    var step = 2 * Math.PI / sides;
    var height = 2;
    // center bottom vertex
    p.push(0, 0, 0, 1);
    n.push(0, -1, 0);

    for (var i = 0; i < sides; ++i) {        
        p.push(Math.sin(step * i), 0, Math.cos(step * i), 1);
        n.push(0, -1, 0);
    }
    for (var i = 0; i < sides; ++i) {

        p.push(Math.sin(step * i), 0, Math.cos(step * i), 1);
        var auxX = 2 / Math.sqrt(5); var auxY = 1 / Math.sqrt(5);
        n.push(auxX * Math.sin(step * i), auxY, auxX * Math.cos(step * i));

        p.push(0, height, 0, 1);
        n.push(auxX * Math.sin(step * i + 0.5 * step), auxY, auxX * Math.cos(step * i + 0.5 * step));
    }


    var ind = new Array();
    for (var i = 0; i < sides-1; ++i) {
        ind.push(0); ind.push(i + 2); ind.push(i + 1);
        ind.push(sides + (i * 2) + 3); ind.push(sides + (i * 2) + 2); ind.push(sides + (i * 2) + 1);
    }
    ind.push(0); ind.push(1); ind.push(sides);
    ind.push(3*sides-1); ind.push(sides+1); ind.push(3*sides);

    var pp = new Float32Array(p);
    var nn = new Float32Array(n);
    var ii = new Uint16Array(ind);
    myCone.create(gl.TRIANGLES, [pp,nn], ii);
    if (material != undefined) 
        myCone.setMaterial(material);

    return myCone;
}
function createSphere(sides, material) {
  var p = new Array();
  var n = new Array();
  var t = new Array();
  var ind = new Array();
  var alpha, beta;

  stepi = Math.PI / (sides);
  stepj = Math.PI / sides;

  for (var i = 0; i < sides + 1; ++i) {
    for (var j = 0; j < sides * 2 + 1; ++j) {
      beta = -Math.PI / 2 + stepi * i;
      alpha = stepj * j;
      p.push(Math.sin(alpha) * Math.cos(beta), Math.sin(beta), Math.cos(alpha) * Math.cos(beta), 1);
      n.push(Math.sin(alpha) * Math.cos(beta), Math.sin(beta), Math.cos(alpha) * Math.cos(beta));
      t.push(j / sides * 0.5, i / sides);
    }
  }

  for (var i = 0; i < sides; i++) {
    for (var j = 0; j < sides * 2; ++j) {
      ind.push(i * (sides * 2 + 1) + j + 1, (i + 1) * (sides * 2 + 1) + j, i * (sides * 2 + 1) + j);
      ind.push((i + 1) * (sides * 2 + 1) + j + 1, (i + 1) * (sides * 2 + 1) + j, i * (sides * 2 + 1) + j + 1);
    }
  }

  var pp = new Float32Array(p);
  var nn = new Float32Array(n);
  var tt = new Float32Array(t);
  var ii = new Uint16Array(ind);
  var s = new Model();
  s.create(gl.TRIANGLES, [pp, nn, tt], ii);
  if (material != undefined)
    s.setMaterial(material);
  return s;
}
function createTorus(r, sr, sides, sn, k, material) {
  var p = new Array();
  var n = new Array();
  var t = new Array();
  var ind = new Array();
  var alpha, beta, x, y, z;

  //stepi = Math.PI / sr;
  //stepj = Math.PI / sides;

  for (var i = 0; i < sides + 1; ++i) {
    for (var j = 0; j < sides * 2 + 1; ++j) {
      
      beta = 2 * Math.PI * (i + j / sn + k * 1) / sides;
      alpha = 2 * Math.PI * j / sn;
      
     /*
      beta = -Math.PI / 2 + (Math.PI / sr) * i;
      alpha =  (Math.PI / sides) * j;
      */
      x = (r + sr * Math.cos(alpha)) * Math.cos(beta);
      z = (r + sr * Math.cos(alpha)) * Math.sin(beta);
      y = sr * Math.sin(alpha);
/*
      x = (r + sr * Math.cos(sa)) * Math.cos(a);
      z = (r + sr * Math.cos(sa)) * Math.sin(a);
      y = sr * Math.sin(sa);
*/    
      p.push(x, y, z, 1);
      n.push(x, y, z);
      t.push(j / sides * 0.5, i / sides);
    }
  }

  for (var i = 0; i < sides; i++) {
    for (var j = 0; j < sides * 2; ++j) {
      ind.push(i * (sides * 2 + 1) + j + 1, (i + 1) * (sides * 2 + 1) + j, i * (sides * 2 + 1) + j);
      ind.push((i + 1) * (sides * 2 + 1) + j + 1, (i + 1) * (sides * 2 + 1) + j, i * (sides * 2 + 1) + j + 1);
    }
  }

  var pp = new Float32Array(p);
  var nn = new Float32Array(n);
  var tt = new Float32Array(t);
  var ii = new Uint16Array(ind);
  var s = new Model();
  s.create(gl.TRIANGLES, [pp, nn, tt], ii);
  if (material != undefined)
    s.setMaterial(material);
  return s;
}
function createTorus2(r, sr, n, sn, k, material) {
  var p = new Array();
  var n2 = new Array();
  var t = new Array();
  var ind = new Array();
  var x, y, z;

  for (var i = 0; i < n; i++) {                          // Iterates over all strip rounds
    for (var j = 0; j < sn + 1 * (i == n - 1) ; j++) {   // Iterates along the torus section
      for (var v = 0; v < 2; v++)                        // Creates zigzag pattern (v equals 0 or 1)
      {
        var a = 2 * Math.PI * (i + j / sn + k * v) / n;
        var sa = 2 * Math.PI * j / sn;

        x = (r + sr * Math.cos(sa)) * Math.cos(a);
        z = (r + sr * Math.cos(sa)) * Math.sin(a);
        y = sr * Math.sin(sa);

        p.push(x, y, z, 1);
        n2.push(x, y, z);
        t.push(j / n * 0.5, i / n);
        ind.push(i * (n * 2 + 1) + j + 1, (i + 1) * (n * 2 + 1) + j, i * (n * 2 + 1) + j);
        ind.push((i + 1) * (n * 2 + 1) + j + 1, (i + 1) * (n * 2 + 1) + j, i * (n * 2 + 1) + j + 1);
      }
    }
  }

  var pp = new Float32Array(p);
  var nn = new Float32Array(n2);
  var tt = new Float32Array(t);
  var ii = new Uint16Array(ind);
  var s = new Model();
  s.create(gl.TRIANGLE_STRIP, [pp, nn, tt], ii);
  if (material != undefined)
    s.setMaterial(material);
  return s;
}
function createCylinder(sides, material) {
  var myCylinder = new Model();
  var p = new Array();
  var n = new Array();
  var step = 2 * Math.PI / sides;
  // bottom center vertex
  p.push(0); p.push(0); p.push(0); p.push(1);
  n.push(0.0); n.push(-1.0); n.push(0.0);
  for (var i = 0; i < sides; ++i) {
    p.push(Math.sin(step * i)); p.push(0); p.push(Math.cos(step * i)); p.push(1);
    n.push(0.0); n.push(-1.0); n.push(0.0);
  }

  for (var i = 0; i < sides; ++i) {
    p.push(Math.sin(step * i)); p.push(0); p.push(Math.cos(step * i)); p.push(1);
    n.push(Math.sin(step * i)); n.push(0); n.push(Math.cos(step * i));
  }
  for (var i = 0; i < sides; ++i) {
    p.push(Math.sin(step * i)); p.push(1); p.push(Math.cos(step * i)); p.push(1);
    n.push(Math.sin(step * i)); n.push(0); n.push(Math.cos(step * i));
  }
  for (var i = 0; i < sides; ++i) {
    p.push(Math.sin(step * i)); p.push(1); p.push(Math.cos(step * i)); p.push(1);
    n.push(0.0); n.push(1.0); n.push(0.0);
  }
  // top center vertex
  p.push(0); p.push(1); p.push(0); p.push(1);
  n.push(0.0); n.push(1.0); n.push(0.0);

  var lastIndex = 4 * sides + 1;
  var ind = new Array();
  for (var i = 0; i < sides - 1; ++i) {
    ind.push(0); ind.push(i + 2); ind.push(i + 1);
    ind.push(sides + i + 1); ind.push(sides + i + 2); ind.push(2 * sides + i + 1);
    ind.push(2 * sides + i + 2); ind.push(2 * sides + i + 1); ind.push(sides + i + 2);
    ind.push(3 * sides + i + 1); ind.push(3 * sides + i + 2); ind.push(lastIndex);
  }
  ind.push(0); ind.push(1); ind.push(sides);
  ind.push(2 * sides); ind.push(sides + 1); ind.push(3 * sides);

  ind.push(2 * sides + 1); ind.push(3 * sides); ind.push(sides + 1);
  //ind.push(0); ind.push(0); ind.push(0);
  ind.push(4 * sides); ind.push(3 * sides + 1); ind.push(lastIndex);

  var pp = new Float32Array(p);
  var nn = new Float32Array(n);
  var ii = new Uint16Array(ind);
  myCylinder.create(gl.TRIANGLES, [pp, nn], ii);
  if (material != undefined)
    myCylinder.setMaterial(material);
  return myCylinder;
}
function createGrid(axis, max, divisions, material) {
  var myGrid = new Model();
  var step = max * 2.0 / divisions;
  var p = new Array();
  var pos = -max;
  for (var i = 0; i < divisions + 1; ++i) {
    if (axis == 1) {
      p.push(pos); p.push(0.0); p.push(-max); p.push(1.0);
      p.push(pos); p.push(0.0); p.push(max); p.push(1.0);
    }
    else if (axis == 0) {
      p.push(0.0); p.push(pos); p.push(-max); p.push(1.0);
      p.push(0.0); p.push(pos); p.push(max); p.push(1.0);
    }
    else {
      p.push(pos); p.push(-max); p.push(0.0); p.push(1.0);
      p.push(pos); p.push(max); p.push(0.0); p.push(1.0);
    }
    pos += step;
  }
  pos = -max;
  for (var i = 0; i < divisions + 1; ++i) {

    if (axis == 1) {
      p.push(-max); p.push(0.0); p.push(pos); p.push(1.0);
      p.push(max); p.push(0.0); p.push(pos); p.push(1.0);
    }
    else if (axis == 0) {
      p.push(0.0); p.push(-max); p.push(pos); p.push(1.0);
      p.push(0.0); p.push(max); p.push(pos); p.push(1.0);
    }
    else {
      p.push(-max); p.push(pos); p.push(0.0); p.push(1.0);
      p.push(max); p.push(pos); p.push(0.0); p.push(1.0);
    }
    pos += step;
  }
  var pp = new Float32Array(p);
  myGrid.create(gl.LINES, [pp]);
  if (material != undefined)
    myGrid.setMaterial(material);
  return myGrid;
}