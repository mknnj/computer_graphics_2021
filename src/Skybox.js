import {utils} from "./utils.js"

export class Skybox {
    constructor(program, jsonObj, gl){
        this.program = program;
        this.jsonObj = jsonObj;
        this.gl = gl;
        this.positionLocation;
        this.skyboxLocation;
        this.viewDirectionProjectionInverseLocation;
        this.positionBuffer = this.gl.createBuffer();
        this.textureInfo;
        this.textureDict = {};

        this.setUp();
        this.setGeometry();
    }

    setUp(){
        this.positionLocation = this.gl.getAttribLocation(this.program, this.jsonObj.attribNames[0]);

        this.skyboxLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[0]);
        this.viewDirectionProjectionInverseLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[1]);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    }

    setGeometry(){
        var positions = new Float32Array(
            [
              -1, -1,
               1, -1,
              -1,  1,
              -1,  1,
               1, -1,
               1,  1,
            ]);
          this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
    }

    async loadSkybox(textureInfoPath){
        this.textureInfo = await this.readJson(textureInfoPath);
        this.textureInfo.skybox.forEach(x => { this.textureDict[x.name] = x.path; });
         // Create a texture.
        var texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, texture);

        const faceInfos = [
        {
            target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            url: this.textureDict["right"],
        },
        {
            target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            url: this.textureDict["left"],
        },
        {
            target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            url: this.textureDict["up"],
        },
        {
            target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            url: this.textureDict["down"],
        },
        {
            target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            url: this.textureDict["front"],
        },
        {
            target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            url: this.textureDict["back"],
        },
        ];
        faceInfos.forEach((faceInfo) => {
            const {target, url} = faceInfo;

            // Upload the canvas to the cubemap face.
            const level = this.textureInfo.parameters.level;
            const internalFormat = this.gl.RGBA;
            const width = this.textureInfo.parameters.width;
            const height = this.textureInfo.parameters.height;
            const format = this.gl.RGBA;
            const type = this.gl.UNSIGNED_BYTE;

            // setup each face so it's immediately renderable
            this.gl.texImage2D(target, level, internalFormat, width, height, 0, format, type, null);

            // Asynchronously load an image
            const image = new Image();
            image.src = url;
            var gltemp = this.gl;
            image.addEventListener('load', function() {
            // Now that the image has loaded make copy it to the texture.
            gltemp.bindTexture(gltemp.TEXTURE_CUBE_MAP, texture);
            gltemp.texImage2D(target, level, internalFormat, format, type, image);
            gltemp.generateMipmap(gltemp.TEXTURE_CUBE_MAP);
            });
        });
        this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
    }

    async readJson(textureInfoFile){
        let textureInfo = {d:""};
        await utils.loadFile(textureInfoFile, textureInfo, function(textureInfoData, data){
            data.d = JSON.parse(textureInfoData);
        });
        return textureInfo.d;
    }
}