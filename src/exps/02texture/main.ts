import * as util from '../../webglFuncs/util'
import axios from 'axios'

/// 简单的图像处理
export const main = async () => {

    const gl = util.initGL('playground')!

    const vertexShaderSource = (await axios.get('/shaders/02texture/tex.vert.glsl')).data
    const fragmentShaderSource = (await axios.get('/shaders/02texture/tex.frag.glsl')).data

    const vertexShader = util.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)!
    const fragmentShader = util.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)!
    const program = util.createProgram(gl, vertexShader, fragmentShader)!


    const aposLocation = gl.getAttribLocation(program, 'a_position')
    const atexLocation = gl.getAttribLocation(program, 'a_texCoord')
    const mTexLocation = gl.getUniformLocation(program, 'myTexture')
    console.log(aposLocation, atexLocation, mTexLocation)

    const vao = gl.createVertexArray()!
    gl.bindVertexArray(vao)
    let positionData = [
        -0.8, -0.8,
        0.8, -0.8,
        -0.8, 0.8,
        -0.8, 0.8,
        0.8, 0.8,
        0.8, -0.8
    ]
    const posBuffer = util.createVBO(gl, positionData)
    gl.enableVertexAttribArray(aposLocation)
    gl.vertexAttribPointer(aposLocation, 2, gl.FLOAT, false, 0, 0)

    let texCoordData = [
        0, 1,
        1, 1,
        0, 0,
        0, 0,
        1, 0,
        1, 1
    ]
    const texCoordBuffer = util.createVBO(gl, texCoordData)
    gl.enableVertexAttribArray(atexLocation)
    gl.vertexAttribPointer(atexLocation, 2, gl.FLOAT, false, 0, 0)

    // create a texture
    // const image = (await axios.get('/images/02texture/leaves.jpg', { responseType: 'arraybuffer' })).data
    const image = await util.loadImageBitmap('/images/02texture/leaves.jpg') as ImageBitmap
    gl.activeTexture(gl.TEXTURE0)
    const myTexture = util.createEmptyTexture(gl)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, image.width, image.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, image)

    const render = () => {
        // resize
        util.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement)
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
        // gl.clearColor(0.1, 0.1, 0.1, 1)
        // gl.clear(gl.COLOR_BUFFER_BIT)

        gl.useProgram(program)
        gl.bindVertexArray(vao)
        gl.uniform1i(mTexLocation, 0)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
        requestAnimationFrame(render)

    }
    render()

}


/// frame buffer
export const main2 = async () => {
    const gl = util.initGL('playground')!

    const vertexShaderSource = (await axios.get('/shaders/02texture/tex2.vert.glsl')).data
    const fragmentShaderSource = (await axios.get('/shaders/02texture/tex2.frag.glsl')).data

    const vShader = util.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource)!
    const fShader = util.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)!
    const program = util.createProgram(gl, vShader, fShader)!


    const aposLocation = gl.getAttribLocation(program, 'a_pos')
    const aUvLocation = gl.getAttribLocation(program, 'a_uv')
    const imgTextureLocation = gl.getUniformLocation(program, 'myTexture')
    const kernelLocation = gl.getUniformLocation(program, "u_kernel[0]");
    const kernelWeightLocation = gl.getUniformLocation(program, "u_kernelWeight");



    const vao = gl.createVertexArray()!
    gl.bindVertexArray(vao)
    let pos = [
        -1.0, -1.0,
        1.0, -1.0,
        -1.0, 1.0,
        -1.0, 1.0,
        1.0, 1.0,
        1.0, -1.0
    ]

    const posBuffer = util.createVBO(gl, pos)
    if (aposLocation == -1) {
        console.warn('a_pos' + 'location not found!!!')
    }
    gl.enableVertexAttribArray(aposLocation)
    gl.vertexAttribPointer(aposLocation, 2, gl.FLOAT, false, 0, 0)

    let uv = [
        0, 1,
        1, 1,
        0, 0,
        0, 0,
        1, 0,
        1, 1
    ]
    const uvBuffer = util.createVBO(gl, uv)
    if (aUvLocation == -1) {
        console.warn('a_uv' + 'location not found!!!')
    }
    gl.enableVertexAttribArray(aUvLocation)
    gl.vertexAttribPointer(aUvLocation, 2, gl.FLOAT, false, 0, 0)

    let image = await util.loadImageBitmap('/images/02texture/leaves.jpg') as ImageBitmap
    // let imgTextureLocation = gl.getUniformLocation(program, 'myTexture')
    // gl.activeTexture(gl.TEXTURE0)
    // const imgTexture = util.createEmptyTexture(gl)
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)


    const originalTexture = util.createEmptyTexture(gl)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)

    /// frame buffers 
    // gl.activeTexture(gl.TEXTURE0) //need?
    const texture1 = util.createEmptyTexture(gl)!
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    const fbo1 = gl.createFramebuffer()!
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo1)
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture1, 0)

    const texture2 = util.createEmptyTexture(gl)!
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
    const fbo2 = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo2)
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture2, 0)




    const render = () => {
        console.log('render!')
        // resize
        util.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement)
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
        // gl.clearColor(0.1, 0.1, 0.1, 0.1)
        // gl.clear(gl.COLOR_BUFFER_BIT)

        gl.useProgram(program)
        gl.bindVertexArray(vao)

        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, originalTexture);

        gl.uniform1i(imgTextureLocation, 0)

        let count = 0
        for (let i = 0; i < tbody.rows.length; i++) {
            var checkbox = tbody.rows[i].firstChild!.firstChild! as HTMLInputElement;
            if (checkbox.checked) {
                if (count % 2 == 0) {
                    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo1)
                    let name = checkbox.value as string
                    gl.uniform1fv(kernelLocation, kernels[name])
                    gl.uniform1f(kernelWeightLocation, computeKernelWeight(kernels[name]))

                    // Draw the rectangle.
                    gl.drawArrays(gl.TRIANGLES, 0, 6)// draw to fbo1 --> to texture1 
                    gl.bindTexture(gl.TEXTURE_2D, texture1)// render textuer2
                }
                else {
                    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo2)
                    let name = checkbox.value as string
                    gl.uniform1fv(kernelLocation, kernels[name])
                    gl.uniform1f(kernelWeightLocation, computeKernelWeight(kernels[name]))

                    // Draw the rectangle.
                    gl.drawArrays(gl.TRIANGLES, 0, 6)// draw to fbo2 --> to texture2 
                    gl.bindTexture(gl.TEXTURE_2D, texture2)// render textuer1
                }

                // increment count so we use the other texture next time.
                ++count;
            }
        }

        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.uniform1fv(kernelLocation, kernels['normal']);
        gl.uniform1f(kernelWeightLocation, computeKernelWeight(kernels['normal']));

        // Draw the rectangle.
        gl.drawArrays(gl.TRIANGLES, 0, 6)
        // requestAnimationFrame(render)

    }
    // render()





    // Setup a ui.
    var ui = document.querySelector("#ui")!;
    var table = document.createElement("table");
    var tbody = document.createElement("tbody");
    for (var ii = 0; ii < effects.length; ++ii) {
        var effect = effects[ii];
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        var chk = document.createElement("input");
        chk.value = effect.name;
        chk.type = "checkbox";
        if (effect.on) {
            chk.checked = true;
        }
        chk.onchange = render;
        td.appendChild(chk);
        td.appendChild(document.createTextNode(effect.name));
        tr.appendChild(td);
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    ui.appendChild(table);
    // $("#ui table").tableDnD({ onDrop: drawEffects });



}

function computeKernelWeight(kernel: Array<number>) {
    var weight = kernel.reduce(function (prev, curr) {
        return prev + curr;
    });
    return weight <= 0 ? 1 : weight;
}

// 定义一些卷积核
var kernels: any = {
    'normal': [
        0, 0, 0,
        0, 1, 0,
        0, 0, 0,
    ],
    'gaussianBlur': [
        0.045, 0.122, 0.045,
        0.122, 0.332, 0.122,
        0.045, 0.122, 0.045,
    ],
    'gaussianBlur2': [
        1, 2, 1,
        2, 4, 2,
        1, 2, 1,
    ],
    'gaussianBlur3': [
        0, 1, 0,
        1, 1, 1,
        0, 1, 0,
    ],
    'unsharpen': [
        -1, -1, -1,
        -1, 9, -1,
        -1, -1, -1,
    ],
    'sharpness': [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0,
    ],
    'sharpen': [
        -1, -1, -1,
        -1, 16, -1,
        -1, -1, -1,
    ],
    'edgeDetect': [
        -0.125, -0.125, -0.125,
        -0.125, 1, -0.125,
        -0.125, -0.125, -0.125,
    ],
    'edgeDetect2': [
        -1, -1, -1,
        -1, 8, -1,
        -1, -1, -1,
    ],
    'edgeDetect3': [
        -5, 0, 0,
        0, 0, 0,
        0, 0, 5,
    ],
    'edgeDetect4': [
        -1, -1, -1,
        0, 0, 0,
        1, 1, 1,
    ],
    'edgeDetect5': [
        -1, -1, -1,
        2, 2, 2,
        -1, -1, -1,
    ],
    'edgeDetect6': [
        -5, -5, -5,
        -5, 39, -5,
        -5, -5, -5,
    ],
    'sobelHorizontal': [
        1, 2, 1,
        0, 0, 0,
        -1, -2, -1,
    ],
    'sobelVertical': [
        1, 0, -1,
        2, 0, -2,
        1, 0, -1,
    ],
    'previtHorizontal': [
        1, 1, 1,
        0, 0, 0,
        -1, -1, -1,
    ],
    'previtVertical': [
        1, 0, -1,
        1, 0, -1,
        1, 0, -1,
    ],
    'boxBlur': [
        0.111, 0.111, 0.111,
        0.111, 0.111, 0.111,
        0.111, 0.111, 0.111,
    ],
    'triangleBlur': [
        0.0625, 0.125, 0.0625,
        0.125, 0.25, 0.125,
        0.0625, 0.125, 0.0625,
    ],
    'emboss': [
        -2, -1, 0,
        -1, 1, 1,
        0, 1, 2,
    ],
};

var effects = [
    { name: "normal", on: true },
    { name: "gaussianBlur", },
    { name: "gaussianBlur2", on: true },
    { name: "gaussianBlur3", on: true },
    { name: "unsharpen", },
    { name: "sharpness", },
    { name: "sharpen", },
    { name: "edgeDetect", },
    { name: "edgeDetect2", },
    { name: "edgeDetect3", },
    { name: "edgeDetect4", },
    { name: "edgeDetect5", },
    { name: "edgeDetect6", },
    { name: "sobelHorizontal", },
    { name: "sobelVertical", },
    { name: "previtHorizontal", },
    { name: "previtVertical", },
    { name: "boxBlur", },
    { name: "triangleBlur", },
    { name: "emboss", },
];
