import {utils} from "./utils.js";
import { ShadersHandler } from "./ShadersHandler.js";
import { Skybox } from "./Skybox.js";
import { TextureHandler } from "./TextureHandler.js";
import { SceneHandler } from "./SceneHandler.js";
import { GuiElement } from "./GuiElement.js";
import { GameplayHandler } from "./GameplayHandler.js";

var scene;
var oldScene;
var canvas;
var skybox;
var gl;
var isGameplay = false;
var prevTime = 0;
var lag = 0;
const MS_PER_UPDATE = 16;

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
    
    await scene.loadTextures("/config/textures.json");
    await scene.load("/assets/scenes/scene3.json");
    await scene.loadLights("/config/lights.json");
    await scene.loadSelectableObjectsInfo("/config/selectable.json");

    scene.guiElements.push(new GuiElement(sh.getProgram("gui"),
                                            sh.getJson("gui"),
                                            gl,
                                            [0,0],
                                            0.1, 0.1,
                                            [1, 0, 0, 0],
                                            scene.texturesDict["scope"]));
    drawScene(performance.now());
}

function drawScene(time){
    scene.time = time;
    let elapsed = time - prevTime;
    prevTime = time;
    lag += elapsed;

    while(lag >= MS_PER_UPDATE){
        scene.update();
        lag -= MS_PER_UPDATE;
    }
    
    clearBits();
    skybox.draw(scene.camera);
    scene.draw();
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
    if (document.pointerLockElement == canvas) scene.mouseMove(e);
}

function activateCameraMovement(e){
    if (document.pointerLockElement == canvas) scene.activateMovement(e);
}

function deactivateCameraMovement(e){
    if (document.pointerLockElement == canvas) scene.deactivateMovement(e);
}

function lockChange(){
    if (document.pointerLockElement != canvas) canvas.requestPointerLock();
}

function updateCameraProjection(){
    //setViewportAndCanvas();
    //scene.resizeGui();
    if(scene.camera != null) scene.camera.updateProjection();
}

function deleteFocusedItem(){
    if(scene != null && !isGameplay) scene.deleteFocusedItem();
}

function handleKeyPressed(e){

    if(scene!=null)
        scene.handleKeyPressed(e.key.toLowerCase());
    if(!isGameplay){
        if (e.key.toLowerCase() == "p" && skybox != null)
            skybox.nextSkybox();
        if (e.key.toLowerCase() == "l" && skybox != null)
            skybox.prevSkybox();
        if (e.key.toLowerCase() == "enter" )
                if(scene.validScene()){
                    oldScene = scene;
                    scene = new GameplayHandler(oldScene);
                    isGameplay = true;
                }
                else alert("INVALID SCENE \nInsert a spawn and a goal");
                
    }else{
        if (e.key.toLowerCase() == "enter" ){
            scene.beforeChangeScene();
            scene = oldScene;
            isGameplay = false;
        }
    }
}

function startPlaceItem(){
    scene.isPlacing = true;
}

function stopPlaceItem(){
    scene.isPlacing = false;
}

addEventListener("mousemove", updateCameraAngle, false);
addEventListener("mousedown", lockChange, false);
addEventListener("mousedown", startPlaceItem, false);
addEventListener("mouseup", stopPlaceItem, false);
addEventListener("mouseup", deleteFocusedItem, false);
addEventListener("keydown", activateCameraMovement, false);
addEventListener("keyup", handleKeyPressed, false);
addEventListener("keyup", deactivateCameraMovement, false);
addEventListener("resize", updateCameraProjection, false);
addEventListener("load", () => {
	  main().catch(console.error);
});

