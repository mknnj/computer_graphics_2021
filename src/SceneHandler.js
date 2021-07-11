import { Camera } from "./Camera.js";
import { Drawable } from "./Drawable.js";
import { ObjParser } from "./ObjParser.js";
import { utils } from "./utils.js";

export class SceneHandler{
 
    constructor(gl, textureHandler, shaderHandler){
        this.gl = gl;
        this.camera = new Camera(gl);
        this.textureHandler = textureHandler;
        this.shaderHandler = shaderHandler;
        this.objects = [];
        this.selected = null;
        this.selectable = [];
        this.currentSelectedIndex = 0;
    }

    async load(url){
        var sceneInfo;
        await utils.loadFiles([url], (sceneInfoData) => {
            sceneInfo = JSON.parse(sceneInfoData);
        });
        sceneInfo.objects.forEach((x) => {
            let toAdd = new Drawable(
                this.shaderHandler.getProgram(x.program),
                this.shaderHandler.getJson(x.program),
                this.gl,
                this.meshDict[x.mesh],
                x.position,
                x.rotation,
                x.scale,
                this.getTexture(x.texture)
            );
            this.objects.push(toAdd);
            toAdd.meshName = x.mesh;
            toAdd.textureName = x.texture;
            });
    }

    sceneToJSON(){
        var dump = {objects : []};
        this.objects.forEach((x)=>{
            dump.objects.push({
                "program" : x.jsonObj.name,
                "mesh" : x.meshName,
                "position" : x.position,
                "rotation" : x.rotation,
                "scale" : x.scale,
                "texture" : x.textureName
            });
        });
        return dump
    }

    save(filename){
        var data = JSON.stringify(this.sceneToJSON());
        var file = new Blob([data], {type: "json"});
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            var a = document.createElement("a"),
                    url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);  
            }, 0); 
        }
    }

    draw(){
        this.objects.forEach((x)=>x.draw(this.camera, this.lights));
        if (this.selected != null)
            this.selected.draw(this.camera, this.lights);
    }

    toggleSelected(){
        if (this.selected == null)
            this.instantiateSelected();
        else this.selected = null;
    }

    nextSelected(){
        this.currentSelectedIndex = this.currentSelectedIndex + 1 < this.selectable.length ? this.currentSelectedIndex + 1 : 0;
        this.instantiateSelected();
    }

    prevSelected(){
        this.currentSelectedIndex = this.currentSelectedIndex > 0 ? this.currentSelectedIndex - 1 : this.selectable.length - 1;
        this.instantiateSelected();
    }

    instantiateSelected(){
        delete this.selected;
        this.selected =  new Drawable(
            this.shaderHandler.getProgram(this.selectable[this.currentSelectedIndex].program), 
            this.shaderHandler.getJson(this.selectable[this.currentSelectedIndex].program), 
            this.gl, 
            this.meshDict[this.selectable[this.currentSelectedIndex].mesh], 
            this.camera.getDestination(3), 
            this.selectable[this.currentSelectedIndex].rotation, 
            this.selectable[this.currentSelectedIndex].scale, 
            this.texturesDict[this.selectable[this.currentSelectedIndex].texture]
        );
    }

    update(){
        if (this.selected != null){
            this.selected.position = this.camera.getDestination(3);
            this.selected.updateWorld();
            this.selected.updateAlpha((Math.cos(this.time/500)+1.1)/2);
        }
    }

    placeSelected(){
        if (this.selected != null){
            this.selected.updateAlpha(1);
            this.objects.push(this.selected);
            this.instantiateSelected();
            //this.selected = null;
        }
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

    async loadSelectableObjectsInfo(url){
        this.selectable = (await this.readJson(url)).selectable;
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

    getTexture(name){
        if(name===null) return null;
        return this.texturesDict[name];
    }

}