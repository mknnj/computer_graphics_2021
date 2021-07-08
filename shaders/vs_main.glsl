#version 300 es

in vec3 a_position;
in vec3 a_normal;
in vec2 a_uv;

uniform mat4 u_viewWorldMatrix;
uniform mat4 u_projectionMatrix;
uniform mat4 u_normalMatrix;

out vec3 v_position;
out vec3 v_normal;
out vec2 v_uv;

void main() {

    v_normal = mat3(u_normalMatrix) * a_normal;
	v_position = (u_viewWorldMatrix * vec4(a_position, 1.0)).xyz;
	
	v_uv = vec2(a_uv.x, 1.0 - a_uv.y);
	
	gl_Position = u_projectionMatrix * vec4(a_position, 1.0);
}