import { Camera } from "./Camera.js";
import { ColliderRenderer } from "./ColliderRenderer.js";
import { Drawable } from "./Drawable.js";
import { ObjParser } from "./ObjParser.js";
import { utils } from "./utils.js";

const RSPE = .08;


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
        this.selectedToDelete = -1;
        this.guiElements = [];
        this.isPlacing = false;
        this.isSpawnPresent = false;
        this.isGoalPresent = false;
        this.showColliders = true;
    }

    async load(url){
        var sceneInfo;
        await utils.loadFiles([url], (sceneInfoData) => {
            sceneInfo = JSON.parse(sceneInfoData);
        });
        try {
            sceneInfo.objects.forEach((x) => {
                let toAdd = new Drawable(
                    this.shaderHandler.getProgram(x.program),
                    this.shaderHandler.getJson(x.program),
                    this.gl,
                    this.meshDict[x.mesh],
                    this.materialDict[x.name],
                    x.name,
                    x.position,
                    x.rotation,
                    x.scale,
                    this.getTexture(x.texture)
                );
                toAdd.collider.renderer = new ColliderRenderer(
                    this.shaderHandler.getProgram("lit"), 
                    this.shaderHandler.getJson("lit"), 
                    this.gl,
                    toAdd.collider
                );
                this.objects.push(toAdd);
                toAdd.meshName = x.mesh;
                toAdd.textureName = x.texture;
                if (x.name === "spawnBrick") {
                    if (this.isSpawnPresent) throw new Error("CORRUPTED SCENE \nLOADING EMPTY SCENE");
                    else this.isSpawnPresent = true;
                }
                else if (x.name === "goalBrick") {
                    if (this.isGoalPresent) throw new Error("CORRUPTED SCENE \nLOADING EMPTY SCENE");
                    else this.isGoalPresent = true;
                }
                });
        } catch(error){
            alert(error);
            this.objects = [];
            this.isSpawnPresent = false;
            this.isGoalPresent = false;
        }
    }

    sceneToJSON(){
        var dump = {objects : []};
        this.objects.forEach((x)=>{
            dump.objects.push({
                "program" : x.jsonObj.name,
                "name" : x.name,
                "mesh" : x.meshName,
                "position" : x.position,
                "rotation" : x.rotation,
                "scale" : x.scale,
                "texture" : x.textureName
            });
        });
        return dump;
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
        if(this.showColliders)
            this.objects.forEach((x)=>x.collider.draw(this.camera));
        if (this.selected != null)
            this.selected.draw(this.camera, this.lights);
        else this.guiElements.forEach((x)=>x.draw());
    }

    resizeGui(){
        this.guiElements.forEach((x)=>x.resize());
    }

    toggleSelected(){
        if (this.selectedToDelete != -1){
            this.objects[this.selectedToDelete].updateAlpha(1);
            this.selectedToDelete = -1;
        }
        if (this.selected == null)
            this.instantiateSelected();
        else this.selected = null;
    }

    nextSelected(){
        this.currentSelectedIndex = this.currentSelectedIndex + 1 < this.selectable.length ? this.currentSelectedIndex + 1 : 0;
        if (this.selectedToDelete != -1){
            this.objects[this.selectedToDelete].updateAlpha(1);
            this.selectedToDelete = -1;
        }
        this.instantiateSelected();
    }

    prevSelected(){
        this.currentSelectedIndex = this.currentSelectedIndex > 0 ? this.currentSelectedIndex - 1 : this.selectable.length - 1;
        if (this.selectedToDelete != -1){
            this.objects[this.selectedToDelete].updateAlpha(1);
            this.selectedToDelete = -1;
        }
        this.instantiateSelected();
    }

    instantiateSelected(){
        delete this.selected;
        this.selected =  new Drawable(
            this.shaderHandler.getProgram(this.selectable[this.currentSelectedIndex].program), 
            this.shaderHandler.getJson(this.selectable[this.currentSelectedIndex].program), 
            this.gl, 
            this.meshDict[this.selectable[this.currentSelectedIndex].mesh], 
            this.materialDict[this.selectable[this.currentSelectedIndex].name],
            this.selectable[this.currentSelectedIndex].name,
            this.camera.getDestination(3), 
            this.selectable[this.currentSelectedIndex].rotation, 
            this.selectable[this.currentSelectedIndex].scale, 
            this.texturesDict[this.selectable[this.currentSelectedIndex].texture]
        );
        this.selected.meshName = this.selectable[this.currentSelectedIndex].mesh;
        this.selected.textureName = this.selectable[this.currentSelectedIndex].texture;
    }

    update(){
        this.camera.updatePos();
        this.camera.updateMatrices();
        this.updateSceneFocus();
        if (this.selected != null){
            this.selected.position = this.camera.getDestination(3);
            this.selected.updateWorld();
            this.selected.updateAlpha((Math.cos(this.time/500)+1.1)/2);
        }
        else{
            if(this.selectedToDelete!=-1)
                this.objects[this.selectedToDelete].updateAlpha((Math.cos(this.time/200)+1.1)/2);
        }
        this.placeSelected();
        
    }

    updateSceneFocus(){
        if(this.selected == null && this.camera!=null){
            var lastSelected = this.selectedToDelete;
            this.selectedToDelete = -1;
            var minT = 200000;
            for(let i = 0; i<this.objects.length;i++){
                let distanceFromObj = this.objects[i].collider.isCollidingWithRay(this.camera.getViewDirection(), this.camera.pos);
                if(this.objects[i].meshName !== "plane" && distanceFromObj != null &&  distanceFromObj<minT){
                    minT = distanceFromObj;
                    this.selectedToDelete = i;
                }
            }
            if(this.selectedToDelete != lastSelected && lastSelected!=-1)
                this.objects[lastSelected].updateAlpha(1);
        }
    }

    beforeChangeScene(){
        if(this.selectedToDelete != -1)
                this.objects[this.selectedToDelete].updateAlpha(1);
    }

    validScene(){
        return this.isSpawnPresent && this.isGoalPresent;
    }

    placeSelected(){
        if (this.selected != null){
            if (this.selected.name === "spawnBrick" && this.isSpawnPresent) return;
            if (this.selected.name === "goalBrick" && this.isGoalPresent) return;
            if (this.isPlacing && this.selected.collider.isCollidingWith(this.objects) == null){
                this.selected.updateAlpha(1);
                this.selected.collider.renderer = new ColliderRenderer(
                    this.shaderHandler.getProgram("lit"), 
                    this.shaderHandler.getJson("lit"), 
                    this.gl,
                    this.selected.collider
                );
                this.objects.push(this.selected);
                if (this.selected.name === "spawnBrick") this.isSpawnPresent = true;
                else if (this.selected.name === "goalBrick") this.isGoalPresent = true;
                this.instantiateSelected();
            }
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
            this.meshDict[key].boundaries = this.computeBoundaries(this.meshDict[key]);
        }

    }

    computeBoundaries(mesh){
        let maxX = Math.max(...mesh.vertices.filter((e,i) => i%3 == 0));
        let minX = Math.min(...mesh.vertices.filter((e,i) => i%3 == 0));
        let maxY = Math.max(...mesh.vertices.filter((e,i) => i%3 == 1));
        let minY = Math.min(...mesh.vertices.filter((e,i) => i%3 == 1));
        let maxZ = Math.max(...mesh.vertices.filter((e,i) => i%3 == 2));
        let minZ = Math.min(...mesh.vertices.filter((e,i) => i%3 == 2));

        return [maxX, maxY, maxZ, minX, minY, minZ];
    }

    deleteFocusedItem(){
        if (this.selected == null && this.selectedToDelete!=-1){
            if (this.objects[this.selectedToDelete].name === "spawnBrick") this.isSpawnPresent = false;
            else if (this.objects[this.selectedToDelete].name === "goalBrick") this.isGoalPresent = false;
            this.objects.splice(this.selectedToDelete, 1);
            this.selectedToDelete = -1;
        }
    }

    async loadSelectableObjectsInfo(url){
        this.selectable = (await this.readJson(url)).selectable;
    }

    async loadMaterials(url){
        this.materialDict = (await this.readJson(url));
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

    handleKeyPressed(key){
        if (key == "m")
            this.save("scene2.json");
        if (key == "f" && this.camera != null)
            this.toggleSelected();
        if (key == "e" && this.camera != null)
            this.nextSelected();
        if (key == "q" && this.camera != null)
            this.prevSelected();
        if (key == "c")
            this.showColliders = !this.showColliders;
    }

    mouseMove(e){
        this.camera.ang += RSPE * e.movementX;
        this.camera.elev -= RSPE * e.movementY;
    }

    activateMovement(e){
        this.setDir(e, true)
    }

    deactivateMovement(e){
        this.setDir(e, false);
    }

    setDir(e, bool){
        if (e.key.toLowerCase() == "w") this.camera.front = bool;
        if (e.key.toLowerCase() == "s") this.camera.back = bool;
        if (e.key.toLowerCase() == "a") this.camera.left = bool;
        if (e.key.toLowerCase() == "d") this.camera.right = bool;
        if (e.key == " ") this.camera.high = bool;
        if (e.key == "Shift") this.camera.down = bool;
    }

}