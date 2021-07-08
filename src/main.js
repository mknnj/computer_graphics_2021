import {utils} from "./utils.js";
import {Camera} from "./Camera.js";
import { ShadersHandler } from "./ShadersHandler.js";
import { Skybox } from "./Skybox.js";
import { ObjParser } from "./ObjParser.js";
import { Cube } from "./Cube.js";
import { Drawable } from "./Drawable.js";

var camera;
var canvas;
var skybox;
var bricks;
var plane;
var gl;
var lights;

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
    var ghostMesh = await objParser.parseObjFile("ghost.obj");
    var mainProgram = sh.getProgram("main");
    
    bricks = [];

    var planeMesh = {
        vertices : [500.0, 0.0, 500.0,
                    500.0, 0.0, -500.0,
                    -500.0, 0.0, -500.0,
                    -500.0, 0.0, 500.0],
        vertexNormals : [0.0, 1.0, 0.0,
                    0.0, 1.0, 0.0,
                    0.0, 1.0, 0.0,
                    0.0, 1.0, 0.0],
        indices : [0,1,2,3,0,2]
    }

    var ghostMaterial = {
        diffuse: [0.6, 0, 0, 1],
        ambient: [0.2, 0, 0, 1],
        specular: [0.2, 0.2, 0.2, 1],
        diffuseTh: 0.5,
        specularTh: 0.5
    }

    var brickMaterial = {
        diffuse: [0.6, 0.6, 0, 1],
        ambient: [0.2, 0.2, 0, 1],
        specular: [0.2, 0.2, 0.2, 1],
        diffuseTh: 0.5,
        specularTh: 0.5
    }

    var planeMaterial = {
        diffuse: [0.2, 0.2, 0.2, 1],
        ambient: [0.1, 0.1, 0.1, 1],
        specular: [0, 0, 0, 0],
        diffuseTh: 0.5,
        specularTh: 0.5
    }

    lights = {
        ambient : {
            color: [1, 1, 1, 1]
        },
        directionalLight : {
            color : [1, 1, 1, 1],
            direction : [1, 1, 0]
        },
        pointLight : {
            color : [1, 1, 1, 1],
            position : [0, 0.3, 0, 1],
            decay: 0.5,
            target: 0.5
        }
    }
    
    planeMesh.material = planeMaterial;
    brickMesh.material = brickMaterial;
    ghostMesh.material = ghostMaterial;

    plane = new Drawable(mainProgram, sh.getJson("main"), gl, planeMesh, [0, -1, 0], [0, 0, 0], 1);
    bricks.push( new Drawable(mainProgram, sh.getJson("main"), gl, brickMesh, [0, 1.2, 0], [0, 0, 0], 0.01));
    bricks.push( new Drawable(mainProgram, sh.getJson("main"), gl, brickMesh, [0, 0, -6], [0, 0, 0], 0.01));
    bricks.push( new Drawable(mainProgram, sh.getJson("main"), gl, brickMesh, [0, 0, -7], [0, 0, 0], 0.01));
    bricks.push( new Drawable(mainProgram, sh.getJson("main"), gl, ghostMesh, [0, 0, -8], [0, 0, 0], 1));
    bricks.push( new Drawable(mainProgram, sh.getJson("main"), gl, ghostMesh, [0, 1, -9], [0, 0, 0], 1));
    
    drawScene();
}

function drawScene(){
    clearBits();

    camera.updateMatrices();
    camera.updatePos();
    
    skybox.draw(camera);
    
    bricks.forEach((a)=>a.draw(camera, lights));
    //plane.draw(camera, lights);

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

