import {utils} from "./utils.js"

export class ShadersHandler{
    constructor(){
        this.programsDict = {};
    }

    async readJson(programsInfoFile){
        let programsInfo = {d:""};
        await utils.loadFile(programsInfoFile, programsInfo, function(programsInfoData, data){
            data.d = JSON.parse(programsInfoData);
        });
        return programsInfo.d;
    }

    async loadProgramsDict(programsInfo, gl){
        programsInfo = await this.readJson(programsInfo);
        for(let i of programsInfo.shaders){
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
}