import {utils} from "./utils.js"

export class Skybox {
    constructor(program, jsonObj, gl){
        this.program = program;
        this.jsonObj = jsonObj;
        this.gl = gl;
        this.positionLocation;
        this.skyboxLocation;
        this.viewDirectionProjectionInverseLocation;

        this.setLocation();
    }

    setLocation(){
        this.positionLocation = this.gl.getAttribLocation(this.program, this.jsonObj.attribNames[0]);

        this.skyboxLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[0]);
        this.viewDirectionProjectionInverseLocation = this.gl.getUniformLocation(this.program, this.jsonObj.uniformNames[1]);
    }

    loadSkybox(){
         // Create a texture.
        var texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_CUBE_MAP, texture);

        const faceInfos = [
        {
            target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
            url: 'assets/skybox/right.jpg',
        },
        {
            target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
            url: 'assets/skybox/left.jpg',
        },
        {
            target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
            url: 'assets/skybox/up.jpg',
        },
        {
            target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
            url: 'assets/skybox/down.jpg',
        },
        {
            target: this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
            url: 'assets/skybox/front.jpg',
        },
        {
            target: this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
            url: 'assets/skybox/back.jpg',
        },
        ];
        faceInfos.forEach((faceInfo) => {
            const {target, url} = faceInfo;

            // Upload the canvas to the cubemap face.
            const level = 0;
            const internalFormat = this.gl.RGBA;
            const width = 512;
            const height = 512;
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
}