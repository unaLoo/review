#version 300 es

// in vec3 positionInfo_from;
// in vec3 positionInfo_to;
in vec4 a_positionInfo;// x1,y1, x2,y2
in float a_velocity;// v

uniform mat4 u_matrix;

out float velocity;

const float PI = 3.14159265359f;

vec2 lnglat2Mercator(float lng, float lat) {
    float x = (180.0f + lng) / 360.0f;
    float y = (180.0f - (180.0f / PI) * log(tan(PI / 4.0f + (lat * PI) / 360.0f))) / 360.0f;
    return vec2(x, y);
}

void main() {
    // vertex:2         instance:particleNum

    // vec3 positionInfo = positionInfo_from;
    //velocity = positionInfo.z;
    // gl_Position = u_matrix * vec4(positionInfo.xy, 0.0, 1.0);

    // vec2 pos = vec2(gl_VertexID % 2 == 0 ? vec2(0.8f, 0.4f) : vec2(0.8f, 0.5f));
    // // velocity = 0.5f;
    // gl_Position = u_matrix * vec4(pos, 0.0f, 1.0f);

    // vec2 pos = positionInfo_from.xy;

    // vec2 pos = vec2(gl_VertexID % 2 == 0 ? positionInfo_from.xy : positionInfo_to.xy);
    // velocity = positionInfo_to.z;

    vec2 pos = vec2(gl_VertexID % 2 == 0 ? a_positionInfo.xy : a_positionInfo.zw);
    velocity = a_velocity;

    gl_Position = u_matrix * vec4(lnglat2Mercator(pos.x, pos.y), 0.0f, 1.0f);
    gl_PointSize = 20.0f;
}