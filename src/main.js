import {utils} from "./utils.js";
import {Camera} from "./Camera.js";
import { ShadersHandler } from "./ShadersHandler.js";
import { Skybox } from "./Skybox.js";

var camera;
var canvas;
var skybox;

async function main() {
  canvas = document.querySelector("#my-canvas");
  var gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }

  var sh = new ShadersHandler();
  await sh.loadProgramsDict("/config/shaders.json", gl);
  var skyboxProgram = sh.getProgram("skybox");

  skybox = new Skybox(skyboxProgram, sh.getJson("skybox"), gl);

  // Create a buffer for positions
  var positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  skybox.loadSkybox();
  // Put the positions in the buffer
  setGeometry(gl);


  camera = new Camera();

  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene() {
    utils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(skyboxProgram);

    // Turn on the position attribute
    gl.enableVertexAttribArray(skybox.positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        skybox.positionLocation, size, type, normalize, stride, offset);

    // Compute the projection matrix
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix =
      utils.MakePerspective(30, aspect, 1, 2000);

    var viewMatrix = camera.getViewMatrix();

    // We only care about direciton so remove the translation
    /*viewMatrix[12] = 0;
    viewMatrix[13] = 0;
    viewMatrix[14] = 0;*/

    var viewDirectionProjectionMatrix =
      utils.multiplyMatrices(projectionMatrix, viewMatrix);
    var viewDirectionProjectionInverseMatrix =
      utils.invertMatrix(viewDirectionProjectionMatrix);

    // Set the uniforms
    gl.uniformMatrix4fv(
        skybox.viewDirectionProjectionInverseLocation, false,
        utils.transposeMatrix(viewDirectionProjectionInverseMatrix));

    // Tell the shader to use texture unit 0 for u_skybox
    gl.uniform1i(skybox.skyboxLocation, 0);

    // let our quad pass the depth test at 1.0
    gl.depthFunc(gl.LEQUAL);

    // Draw the geometry.
    gl.drawArrays(gl.TRIANGLES, 0, 1 * 6);

    requestAnimationFrame(drawScene);
  }
}

// Fill the buffer with the values that define a quad.
function setGeometry(gl) {
  var positions = new Float32Array(
    [
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
}

function updateCameraAngle(e){
  if (document.pointerLockElement == canvas) camera.mouseMove(e);
}

function updateCameraPosition(e){
  if (document.pointerLockElement == canvas) camera.updatePos(e);
}

function lockChange(){
  if (document.pointerLockElement != canvas) canvas.requestPointerLock();
}

addEventListener("mousemove", updateCameraAngle, false);
addEventListener("mousedown", lockChange, false);
addEventListener("keydown", updateCameraPosition, false);
addEventListener("load", () => {
	main().catch(console.error);
});

