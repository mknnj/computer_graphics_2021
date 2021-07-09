import { Camera } from "./Camera.js";
import { ObjParser } from "./ObjParser.js";
import { utils } from "./utils.js";

export class SceneHandler{
 
    constructor(gl, textureHandler, shaderHandler){
        this.gl = gl;
        this.camera = new Camera(gl);
        this.textureHandler = textureHandler;
        this.shaderHandler = shaderHandler;
        
    }

    async readJson(url){
        var jsonInfo;
        await utils.loadFiles([url], (jsonInfoData) => {
            jsonInfo = JSON.parse(jsonInfoData);
        });
        return jsonInfo;
    }
    
    async loadMeshes(url){
        var meshDict = (await this.readJson(url)).mesh;
        this.meshDict = {};

        for (const [key, value] of Object.entries(meshDict)) {
            this.meshDict[key] = await ObjParser.parseObjFile(value);
        }
    }

    async loadMaterials(url){
        var materialDict = (await this.readJson(url));

        for (const [key, value] of Object.entries(materialDict)) {
            this.meshDict[key].material = value;
        }
    }

    async loadLights(url){
        var lightsDict = (await this.readJson(url));
        this.lights = lightsDict.lights;
    }

    async loadTextures(url){
        var texturesDict = (await this.readJson(url)).textures;
        this.texturesDict = {};

        for (const [key, value] of Object.entries(texturesDict)) {
            this.texturesDict[key] = this.textureHandler.loadTexture(this.gl, value);
        }
    }

    drawScene(){

    }

    updateScene(){

    }
}