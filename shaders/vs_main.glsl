#version 300 es

in vec3 a_position;
in vec3 a_normal;
in vec2 a_uv;

uniform mat4 viewWorldMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

out vec3 v_position;
out vec3 v_normal;
out vec2 v_uv;

void main() {

    v_normal = mat3(normalMatrix) * a_normal;
	v_position = (viewWorldMatrix * vec4(a_position, 1.0)).xyz;
	
	v_uv = vec2(a_uv.x, 1.0 - a_uv.y);
	
	gl_Position = projectionMatrix * vec4(a_position, 1.0);
}