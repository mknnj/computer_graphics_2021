#version 300 es
precision highp float;

in vec2 v_uv;

out vec4 outColor;

uniform sampler2D u_texture; 
uniform float u_isTexturePresent; //1 if using texture
uniform vec4 u_color;

void main () {
    vec4 textureColor = texture(u_texture, v_uv);
    outColor = u_color * (1.0 - u_isTexturePresent) + textureColor * u_isTexturePresent;
}