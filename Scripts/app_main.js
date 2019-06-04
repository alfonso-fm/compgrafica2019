var escenario;
var counter = 0, counter2 = 0, movements = -1;
var mouseTracking = -1, startX, startY;
var gl;
var idProc;
var option = 0;

function handleKeyDown(event) {
  escenario.Cam.HandleKeyDown(event.keyCode);
}
function handleMouseDown(event) {
  if (event.button == 0) // left button
    mouseTracking = 0;
  else if (event.button == 1)
    mouseTracking = 1;
  startX = event.clientX;
  startY = event.clientY;
  escenario.Cam.prevAlpha = escenario.Cam.alpha;
  escenario.Cam.prevBeta = escenario.Cam.beta;
  escenario.Cam.prevRadius = escenario.Cam.radius;
}
function handleMouseUp(event) {
  mouseTracking = -1;
}
function handleMouseMove(event) {
  if (mouseTracking == -1) { return; }
  escenario.Cam.UpdatePosition(mouseTracking, (-event.clientX + startX), (event.clientY - startY));
}

function render(time) {
  // Clear color and depth buffers 
  escenario.gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Place Camera 
  mat4.identity(Matrices.view);
  mat4.lookAt(vec3.create(escenario.Cam.GetPoint()), vec3.create([0, 0, 0]), vec3.create([0, 1, 0]), Matrices.view);

  // Clear model matrix 
  mat4.identity(Matrices.model);

  // set phong to be the active program 
  escenario.gl.useProgram(escenario.phongProgram);

  // compute all derived matrices (normal, viewModel, PVM) 
  Matrices.compDerived();

  // set matrices 
  escenario.gl.uniformMatrix4fv(escenario.phongProgram.uniforms["uMat4ViewModel"], false, Matrices.getVM());
  escenario.gl.uniformMatrix3fv(escenario.phongProgram.uniforms["uMat3Normal"], false, Matrices.getN());
  escenario.gl.uniformMatrix4fv(escenario.phongProgram.uniforms["uMat4PVM"], false, Matrices.getPVM());

  // set the light direction uniform 
  var uVec3LightDir = [1.0, -0.5, -1.0, 0.0];
  var res2 = vec3.create();
  mat4.multiplyVec4(Matrices.view, uVec3LightDir, res2);
  vec3.normalize(res2);
  gl.uniform3fv(escenario.phongProgram.uniforms["uVec3LightDir"], res2);

  //document.getElementById("lbCounter").innerHTML = counter;
  counter++;
  counter2++;
  escenario.Render(option);

  // Send the commands to WebGL 
  gl.flush();
  // Request another frame 
  window.requestAnimFrame(render, canvas);
}
function startTowers() {
  escenario = new scenario();
  escenario.Delay = 15;
  escenario.Canvas = document.getElementById("canvas");
  escenario.gl = WebGLUtils.setupWebGL(canvas, { depth: true });
  this.alpha = 2.4;
  this.beta = 0.44;
  this.radius = 35;
  gl = escenario.gl;
  if (escenario.gl != null) {
    escenario.init(option);
    document.onkeydown = handleKeyDown;
    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;
    idProc = window.requestAnimFrame(render, canvas);
  }
}
function startFall() {
  escenario = new scenario();
  escenario.Delay = 2;
  escenario.Canvas = document.getElementById("canvas");
  escenario.gl = WebGLUtils.setupWebGL(canvas, { depth: true });
  escenario.Cam.alpha = 2.4;
  escenario.Cam.beta = 0.80;
  escenario.Cam.radius = 40;
  gl = escenario.gl;
  if (escenario.gl != null) {
    escenario.init(option);
    document.onkeydown = handleKeyDown;
    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;
    idProc = window.requestAnimFrame(render, canvas);
  }
}
function Reinit() {
  counter = 0;
  counter2 = 0;
  movements = -1;
  window.cancelAnimationFrame(idProc);
  gl.clear(gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
  start();
}
function start() {
  if (option == 0) {
    startTowers();
  }
  else {
    startFall();
  }
}
function Towers() {
  option = 0;
  Reinit();
}
function Fall() {
  option = 1;
  Reinit();
}