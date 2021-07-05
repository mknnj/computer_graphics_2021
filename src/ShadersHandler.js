import {utils} from "./utils.js"

export class ShadersHandler{
    constructor(){
        this.programsDict = {};
        this.programsInfo;
    }

    async readJson(programsInfoFile){
        let programsInfo = {d:""};
        await utils.loadFile(programsInfoFile, programsInfo, function(programsInfoData, data){
            data.d = JSON.parse(programsInfoData);
        });
        return programsInfo.d;
    }

    async loadProgramsDict(programsInfoPath, gl){
        this.programsInfo = await this.readJson(programsInfoPath);
        for(let i of this.programsInfo.shaders){
            let vertexShaderSource = {d:""};
            await  utils.loadFile("shaders/"+i.vertexShader, vertexShaderSource, function(shaderSource, data){
                data.d = shaderSource;
            });
            let fragmentShaderSource={d:""};
            await  utils.loadFile("shaders/"+i.fragmentShader, fragmentShaderSource, function(shaderSource, data){
                data.d = shaderSource;
            });
            let vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource.d);
            let fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource.d);
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