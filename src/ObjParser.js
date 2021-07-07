import {utils} from "./utils.js"
import "./webgl-obj-loader.min.js"

export class ObjParser {
    constructor(){
        
    }

    async parseObjFile(objPath){
        const response = await fetch("assets/"+objPath);
        const objText = await response.text();
        var mesh = new OBJ.Mesh(objText);
        return await mesh;
    }

}