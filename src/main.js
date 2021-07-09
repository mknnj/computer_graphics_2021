import {utils} from "./utils.js";
import {Camera} from "./Camera.js";
import { ShadersHandler } from "./ShadersHandler.js";
import { Skybox } from "./Skybox.js";
import { ObjParser } from "./ObjParser.js";
import { Cube } from "./Cube.js";
import { Drawable } from "./Drawable.js";
import { TextureHandler } from "./TextureHandler.js";
import { SceneHandler } from "./SceneHandler.js";

var camera;
var scene;
var canvas;
var skybox;
var bricks;
var plane;
var gl;
var sh; //TEMP
var lights;
var selected;

async function main() {
    
    canvas = document.querySelector("#my-canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {
      return;
    }

    setViewportAndCanvas();

    var th = new TextureHandler();
    sh = new ShadersHandler();
    await sh.loadProgramsDict("/config/shaders.json", gl);
    var skyboxProgram = sh.getProgram("skybox");

    skybox = new Skybox(skyboxProgram, sh.getJson("skybox"), gl);
    skybox.loadSkybox("/config/textures.json");


    scene = new SceneHandler(gl, th, sh);
    await scene.loadMeshes("/config/mesh.json");
    await scene.loadMaterials("/config/materials.json");
    await scene.loadLights("/config/lights.json");
    await scene.loadTextures("/config/textures.json");
    camera = scene.camera;

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

    //plane = new Drawable(mainProgram, sh.getJson("main"), gl, planeMesh, [0, -1, 0], [0, 0, 0], 1);
    bricks.push( new Drawable(mainProgram, sh.getJson("main"), gl, scene.meshDict.brick, [0, 1.2, 0], [0, 0, 0], 0.01));
    bricks.push( new Drawable(mainProgram, sh.getJson("main"), gl, scene.meshDict.brick, [0, 0, -6], [0, 0, 0], 0.01));
    bricks.push( new Drawable(mainProgram, sh.getJson("main"), gl, scene.meshDict.brick, [0, 0, -7], [0, 0, 0], 0.01));
    bricks.push( new Drawable(mainProgram, sh.getJson("main"), gl, scene.meshDict.ghost, [0, 0, -8], [0, 0, 0], 0.3));
    bricks.push( new Drawable(mainProgram, sh.getJson("main"), gl, scene.meshDict.ghost, [0, 1, -9], [0, 0, 0], 0.3));
    bricks.push( new Drawable(mainProgram, sh.getJson("main"), gl, scene.meshDict.rock, [0, 1, -10], [0, 0, 0], 0.035, scene.texturesDict.rock));
    bricks.push( new Drawable(mainProgram, sh.getJson("main"), gl, scene.meshDict.tree, [0, 1, -11], [0, 0, 0], 0.05, scene.texturesDict.tree));
    bricks.push( new Drawable(mainProgram, sh.getJson("main"), gl, scene.meshDict.tree, [0, 1, -12], [0, 0, 0], 0.05, scene.texturesDict.tree));
    bricks.push( new Drawable(mainProgram, sh.getJson("main"), gl, scene.meshDict.tree, [0, 1, -13], [0, 0, 0], 0.05, scene.texturesDict.tree));
    bricks.push( new Drawable(mainProgram, sh.getJson("main"), gl, scene.meshDict.cloud, [0, 1, -14], [0, 0, 0], 0.05, scene.texturesDict.cloud));
    bricks.push( new Drawable(mainProgram, sh.getJson("main"), gl, scene.meshDict.cylinder, [0, 1, -15], [0, 0, 0], 0.03, scene.texturesDict.cylinder));
    bricks.push( new Drawable(mainProgram, sh.getJson("main"), gl, scene.meshDict.hedge, [0, 1, -16], [0, 0, 0], 0.05, scene.texturesDict.hedge));
    bricks.push( new Drawable(mainProgram, sh.getJson("main"), gl, scene.meshDict.mountain, [0, 1, -17], [0, 0, 0], 0.1, scene.texturesDict.mountain));
    bricks.push( new Drawable(mainProgram, sh.getJson("main"), gl, scene.meshDict.square, [0, 1, -18], [0, 0, 0], 0.03, scene.texturesDict.square));
    
    drawScene();
}

function drawScene(){
    clearBits();

    camera.updateMatrices();
    camera.updatePos();
    
    skybox.draw(camera);
    
    bricks.forEach((a)=>a.draw(camera, scene.lights));
    if (selected != null)
        {
            selected.draw(camera, scene.lights);
            console.log("Draw");
        }

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

function updateSelectedItem(){
    if (selected != null){
        var direction = camera.getViewDirection();
        var destination = utils.addVectors(camera.pos, utils.multiplyScalarVector(direction, 3));
    
        selected.position = destination;
        selected.updateWorld();
    }
}

function toggleSelectedItem(e){
    if (e.key.toLowerCase() == "f" && camera != null)
        if (selected == null){
            selected =  new Drawable(sh.getProgram("main"), sh.getJson("main"), gl, scene.meshDict.rock, [100,100,100], [0, 0, 0], 0.035, scene.texturesDict.rock);
            updateSelectedItem();
        } else {
            selected = null;
        }
}

function placeSelectedItem(e){
    if (selected != null){
        bricks.push(selected);
        selected = null;
    }
}

addEventListener("mousemove", updateCameraAngle, false);
addEventListener("mousemove", updateSelectedItem, false);
addEventListener("mousedown", lockChange, false);
addEventListener("mouseup", placeSelectedItem, false);
addEventListener("keydown", activateCameraMovement, false);
addEventListener("keyup", toggleSelectedItem, false);
addEventListener("keyup", deactivateCameraMovement, false);
addEventListener("resize", updateCameraProjection, false);
addEventListener("load", () => {
	  main().catch(console.error);
});

