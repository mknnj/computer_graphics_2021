import {utils} from "./utils.js";
import { ShadersHandler } from "./ShadersHandler.js";
import { Skybox } from "./Skybox.js";
import { TextureHandler } from "./TextureHandler.js";
import { SceneHandler } from "./SceneHandler.js";

var scene;
var canvas;
var skybox;
var gl;

async function main() {
    canvas = document.querySelector("#my-canvas");
    gl = canvas.getContext("webgl2");
    if (!gl) {
      return;
    }

    setViewportAndCanvas();

    var th = new TextureHandler();
    var sh = new ShadersHandler();
    await sh.loadProgramsDict("/config/shaders.json", gl);
    
    var skyboxProgram = sh.getProgram("skybox");
    skybox = new Skybox(skyboxProgram, sh.getJson("skybox"), gl);
    await skybox.loadSkyboxInfo("/config/textures.json");
    skybox.loadSkybox();

    scene = new SceneHandler(gl, th, sh);
    await scene.loadMeshes("/config/mesh.json");
    await scene.loadMaterials("/config/materials.json");
    await scene.loadLights("/config/lights.json");
    await scene.loadTextures("/config/textures.json");
    await scene.load("/assets/scenes/scene1.json");
    await scene.loadSelectableObjectsInfo("/config/selectable.json");
    

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
    drawScene();
}

function drawScene(time){
    scene.time = time;
    scene.camera.updateMatrices();
    scene.update();
    scene.camera.updatePos();
		
    clearBits();
    skybox.draw(scene.camera);
    scene.draw();
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
    if (document.pointerLockElement == canvas) scene.camera.mouseMove(e);
}

function activateCameraMovement(e){
    if (document.pointerLockElement == canvas) scene.camera.activateMovement(e);
}

function deactivateCameraMovement(e){
    if (document.pointerLockElement == canvas) scene.camera.deactivateMovement(e);
}

function lockChange(){
    if (document.pointerLockElement != canvas) canvas.requestPointerLock();
}

function updateCameraProjection(){
    if(scene.camera != null) scene.camera.updateProjection();
}

function handleKeyPressed(e){
    if (e.key.toLowerCase() == "m" && scene != null)
        scene.save("scene2.json");
    if (e.key.toLowerCase() == "f" && scene.camera != null)
        scene.toggleSelected();
    if (e.key.toLowerCase() == "e" && scene.camera != null)
        scene.nextSelected();
    if (e.key.toLowerCase() == "q" && scene.camera != null)
        scene.prevSelected();
    if (e.key.toLowerCase() == "p" && skybox != null)
        skybox.nextSkybox();
    if (e.key.toLowerCase() == "l" && skybox != null)
        skybox.prevSkybox();
}

function placeSelectedItem(e){
    scene.placeSelected();
}

addEventListener("mousemove", updateCameraAngle, false);
addEventListener("mousedown", lockChange, false);
addEventListener("mouseup", placeSelectedItem, false);
addEventListener("keydown", activateCameraMovement, false);
addEventListener("keyup", handleKeyPressed, false);
addEventListener("keyup", deactivateCameraMovement, false);
addEventListener("resize", updateCameraProjection, false);
addEventListener("load", () => {
	  main().catch(console.error);
});

