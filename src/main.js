import {utils} from "./utils.js";
import {Camera} from "./Camera.js";
import { ShadersHandler } from "./ShadersHandler.js";
import { Skybox } from "./Skybox.js";
import { ObjParser } from "./ObjParser.js";
import { Cube } from "./Cube.js";

var camera;
var canvas;
var skybox;
var bricks;
var plane;
var gl;
var light;

async function main() {
    canvas = document.querySelector("#my-canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {
      return;
    }

    setViewportAndCanvas();

    var sh = new ShadersHandler();
    var objParser = new ObjParser();
    await sh.loadProgramsDict("/config/shaders.json", gl);
    var skyboxProgram = sh.getProgram("skybox");

    skybox = new Skybox(skyboxProgram, sh.getJson("skybox"), gl);
    skybox.loadSkybox("/config/textures.json");

    camera = new Camera(gl);

    var brickMesh = await objParser.parseObjFile("brick.obj");
    var litProgram = sh.getProgram("lit");
    bricks = [];

    var planeMesh = {
        vertices : [10.0, 0.0, 10.0,
                    10.0, 0.0, -10.0,
                    -10.0, 0.0, -10.0,
                    -10.0, 0.0, 10.0],
        vertexNormals : [0.0, 1.0, 0.0,
                    0.0, 1.0, 0.0,
                    0.0, 1.0, 0.0,
                    0.0, 1.0, 0.0],
        indices : [0,1,2,1,2,2,0,2,3,4,5,2]
    }
    console.log(planeMesh)

    light = {
        diffuse : [1, 0.5, 0, 1],
        direction : [1, -5, 1]
    }
    
    plane = new Cube(litProgram, sh.getJson("lit"), gl, planeMesh, [0, -1, 0]);
    bricks.push( new Cube(litProgram, sh.getJson("lit"), gl, brickMesh, [1, 0, -5]));
    bricks.push( new Cube(litProgram, sh.getJson("lit"), gl, brickMesh, [0, 0, -6]));
    bricks.push( new Cube(litProgram, sh.getJson("lit"), gl, brickMesh, [0, 0, -7]));
    bricks.push( new Cube(litProgram, sh.getJson("lit"), gl, brickMesh, [0, 0, -8]));
    bricks.push( new Cube(litProgram, sh.getJson("lit"), gl, brickMesh, [0, 1, -9]));
    
    drawScene();
}

function drawScene(){
    clearBits();

    camera.updateMatrices();
    camera.updatePos();
    
    skybox.draw(camera);
    
    bricks.forEach((a)=>a.draw(camera, light));
    plane.draw(camera,light);

    requestAnimationFrame(drawScene);
}

function setViewportAndCanvas(){
    utils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    //gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    clearBits();
}

function clearBits(){
    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function updateCameraAngle(e){
    if (document.pointerLockElement == canvas) camera.mouseMove(e);
}

function activateCameraMovement(e){
    if (document.pointerLockElement == canvas) camera.activateMovement(e);
}

function deactivateCameraMovement(e){
    if (document.pointerLockElement == canvas) camera.deactivateMovement(e);
}

function lockChange(){
    if (document.pointerLockElement != canvas) canvas.requestPointerLock();
}

function updateCameraProjection(){
    if(camera != null) camera.updateProjection();
}

addEventListener("mousemove", updateCameraAngle, false);
addEventListener("mousedown", lockChange, false);
addEventListener("keydown", activateCameraMovement, false);
addEventListener("keyup", deactivateCameraMovement, false);
addEventListener("resize", updateCameraProjection, false);
addEventListener("load", () => {
	  main().catch(console.error);
});

