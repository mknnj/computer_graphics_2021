import {utils} from "./utils.js"

export class ShadersHandler{
    constructor(){
        this.programsDict = {};
        this.programsInfo;
    }

    async readJson(programsInfoFile){
        var programsInfo;
        await utils.loadFiles([programsInfoFile], function(programsInfoData){
            programsInfo = JSON.parse(programsInfoData);
        });
        return programsInfo;
    }

    async loadProgramsDict(programsInfoPath, gl){
        this.programsInfo = await this.readJson(programsInfoPath);
        for(let i of this.programsInfo.shaders){
            var vertexShaderSource;
            await  utils.loadFiles(["shaders/"+i.vertexShader], (shaderSource) => {
                vertexShaderSource = shaderSource;
            });
            var fragmentShaderSource;
            await  utils.loadFiles(["shaders/"+i.fragmentShader], (shaderSource) => {
                fragmentShaderSource = shaderSource;
            });
            let vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
            let fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
            let program = utils.createProgram(gl, vertexShader, fragmentShader);
            this.programsDict[i.name] = program;
        }
    }

    getProgram(name){
        return this.programsDict[name];
    }

    getJson(name){
        return this.programsInfo.shaders.filter(a => a.name === name)[0];
    }
}