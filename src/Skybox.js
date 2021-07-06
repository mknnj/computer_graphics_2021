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
            image.addEventListener('load', () => {
                // Now that the image has loaded make copy it to the texture.
                this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, texture);
                this.gl.texImage2D(target, level, internalFormat, format, type, image);
                this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
            });
        });
        this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
        this.gl.texParameteri(this.gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
    }

    async readJson(textureInfoFile){
        var textureInfo;
        await utils.loadFiles([textureInfoFile], (textureInfoData) => {
            textureInfo = JSON.parse(textureInfoData);
        });
        return textureInfo;
    }

    draw(camera){
        // Tell it to use our program (pair of shaders)
        this.gl.useProgram(this.program);

        // Turn on the position attribute
        this.gl.enableVertexAttribArray(this.positionLocation);

        // Bind the position buffer.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = this.gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        this.gl.vertexAttribPointer(
            this.positionLocation, size, type, normalize, stride, offset);

        // Set the uniforms
        this.gl.uniformMatrix4fv(
            this.viewDirectionProjectionInverseLocation, false,
            utils.transposeMatrix(camera.viewDirectionProjectionInverseMatrix));

        // Tell the shader to use texture unit 0 for u_skybox
        this.gl.uniform1i(this.skyboxLocation, 0);

        // let our quad pass the depth test at 1.0
        this.gl.depthFunc(this.gl.LEQUAL);

        // Draw the geometry.
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 1 * 6);
    }
}