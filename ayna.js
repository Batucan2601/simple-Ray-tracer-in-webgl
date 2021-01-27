var gl
var objectProgram
var lightSourceProgram
var canvas
// trackball 
var cameraRadious = 10;
var  angle = 0.0;
var  axis = [0, 0, 1];
var 	trackingMouse = false;
var   trackballMove = false;
var lastPos = [0, 0, 0];
var curx, cury;
var startX, startY;
var eye = vec3(0.0, 0.0, -1.0);
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

//end of trackball 
// object variables 
var cube;
var lighting;
var cone; 
var objectList = []; // list of the objects in the field 
var lightlist = [];
//ray tracer 
var imageSize = 128 // pixel size 
var image = new Uint8ClampedArray(imageSize * imageSize * 3);

// window.onload = function init(){
    
//     var canvas = document.getElementById( "gl-canvas" );
//      gl = WebGLUtils.setupWebGL( canvas );    
//      if ( !gl ) { alert( "WebGL isn't available" ); 
// }
// gl.viewport( 0, 0, canvas.width, canvas.height );
// gl.clearColor( 0.0, 0.0, 0.0, 0.0 );


// //    
// console.log( "selamin aleykum ")
// canvas.addEventListener("mousedown", function(event){
//     var x = 2*event.clientX/canvas.width-1;
//     var y = 2*(canvas.height-event.clientY)/canvas.height-1;
//     startMotion(x, y);
//   });

// canvas.addEventListener("mouseup", function(event){
//     var x = 2*event.clientX/canvas.width-1;
//     var y = 2*(canvas.height-event.clientY)/canvas.height-1;
//     stopMotion(x, y);
//   });

// canvas.addEventListener("mousemove", function(event){

//     var x = 2*event.clientX/canvas.width-1;
//     var y = 2*(canvas.height-event.clientY)/canvas.height-1;
//     mouseMotion(x, y);
//   } );

//   canvas.addEventListener("wheel", function(event){
//         event.preventDefault();
//            cameraRadious += event.deltaY * -0.01;
//             // Restrict scale
//             cameraRadious = Math.min(Math.max(0.125, cameraRadious), 10);

            

//             console.log(cameraRadious);
        
//   } );
  
// //  Load shaders and initialize attribute buffers
// objectProgram = initShaders( gl, "vertex-shader", "fragment-shader" );
// lightSourceProgram = initShaders( gl , "vertex-shader-lightsource" , "fragment-shader-lightsource")


// // Load the data into the GPU  
// //create the cube trace()
// var o = new vec4(-10  , -10, 10 , 1 )
// var d = new vec4( -9 ,-9 , 9 , 1)
// var rayy = new Ray(o , d)
// //console.log( "reflectino vector  " , calculateReflectionVector( rayy , [0,0,0] , [ -1 , 0 , 0 ]))
// // sphere test 
// var sphere = new Sphere; 
// //var intersect  = rayy.isSphereIntersect(sphere)


// //render();

// var originVec = new vec4( 0 , 0, 10 , 1 )
// var destVec = new vec4( 0 ,0 , 9  , 1)
// var ray = new Ray(originVec , destVec)

// cube = new Cube()
// cube.modelview = mult( cube.modelview , translate( -5 , 0, 5 ))

// cone = new Cone()
// cone.modelview = mult( cone.modelview , translate( 5 , 2, 6 ) )

// objectList.push( cube )
// objectList.push( cone) 
// objectList.push(  sphere)

// //console.log( ray.isIntersect(cube) ) 
// trace(objectList);
// //ray.findClosestIntersection( objectList , null )


// };

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var pointsArray = [];
    var texCoordsArray = [];

    // Use a quad to render texture 
    pointsArray.push(vec2(-1, -1));
    pointsArray.push(vec2(-1, 1));
    pointsArray.push(vec2(1, 1));
    pointsArray.push(vec2(1, -1));

    texCoordsArray.push(vec2(0, 0));
    texCoordsArray.push(vec2(0, 1));
    texCoordsArray.push(vec2(1, 1));
    texCoordsArray.push(vec2(1, 0));

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation( program, "vTexCoord");
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( vPosition);

    texture = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    // Set up texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    
    cube = new Cube()
    cube.modelview = mult( cube.modelview ,  translate(  0 , 0 , 0))
    
    cube.modelview = mult(cube.modelview , scale4(  0.5 ,0.5 , 0.5 ) )
    cube.modelview = mult( cube.modelview , rotate( 75 , 1 , 0 ,0))
    cube.type = "cube"

    var sphere = new Sphere; 
    var light = new Light;
    //objectList.push( sphere )
    //objectList.push( light) 
    //objectList.push( cube )

    objectList.push(sphere)
    objectList.push(cube)
    lightlist.push( light );
    



    render();
}


function render() {
    trace(objectList);
    gl.clear( gl.COLOR_BUFFER_BIT );

    gl.bindTexture( gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D,    // target
        0,                // level
        gl.RGB,           // image format 
        imageSize,        // width
        imageSize,        // height
        0,                // Border
        gl.RGB,           // Format
        gl.UNSIGNED_BYTE, // type
        image             // Data source
    );

    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );
    
     var program2 = initShaders( gl, "vertex-shader1", "fragment-shader1" );
    gl.useProgram( program2 );

     var cubeVertices =[]
        for( var i = 0; i < 8 ; i++ ){
            cubeVertices.push( vecMatMult( cube.vertices[i]  , cube.modelview  )  ) 
            console.log("muzafffffeeerrrr atac", cubeVertices );
        }
     
        for( var i = 0; i < cubeVertices.length ; i++ ){
            var tmp = -cubeVertices[i][0]
            cubeVertices[i][0] = cubeVertices[i][1]
            cubeVertices[i][1] = tmp
        }
      

    //requestAnimationFrame(render);
        var bufferId = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(cubeVertices), gl.STATIC_DRAW ); 
        
    // Associate out shader variables with our data buffer
          
          var vPosition = gl.getAttribLocation( program, "vPosition" );
          gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
          gl.enableVertexAttribArray( vPosition );    

          gl.drawArrays( gl.POINTS, 0, 8 );
}





class Light{ 
    constructor(){
        this.radius = 3; 
        this.center = new vec4( 0.0 ,  5.0 ,  10.0 , 1.0 )
        this.ambient = [ 1.0 , 0.0, 0.0 , 1.0  ]
        this.specular = [ 1.0 , 1.0 , 1.0 , 1 ]
        this.modelview  =mat4()
        this.perspective = mat4()
        this.type = "light"

    }
    

}
// the following are the classes for the objects and lightsoruces and some helper functions in the code , 
class Cube{ 
    quad(a, b, c, d , normal) 
    {
         this.vertices = [
            vec4( -0.5, -0.5,  0.5, 1.0 ),
            vec4( -0.5,  0.5,  0.5, 1.0 ),
            vec4(  0.5,  0.5,  0.5, 1.0 ),
            vec4(  0.5, -0.5,  0.5, 1.0 ),
            vec4( -0.5, -0.5, -0.5, 1.0 ),
            vec4( -0.5,  0.5, -0.5, 1.0 ),
            vec4(  0.5,  0.5, -0.5, 1.0 ),
            vec4(  0.5, -0.5, -0.5, 1.0 )
        ];

         this.vertexColors = [
            [ 0.4, 0.4, 0.4, 1.0 ]   // white
        ];
        // We need to parition the quad into two triangles in order for
        // WebGL to be able to render it.  In this case, we create two
        // triangles from the quad indices
        
        //vertex color assigned by the index of the vertex
        
        this.indices = [ a, b, c, a, c, d ];

        for ( var i = 0; i < this.indices.length; ++i ) {
            this.points.push( this.vertices[this.indices[i]] );
            this.points.push( normal );
            //colors.push( vertexColors[indices[i]] );
            // for solid colored faces use             
        }
        
        
    }
    colorQuad(){
        this.quad( 1, 0, 3, 2 , this.normals[0] );
        this.quad( 2, 3, 7, 6  , this.normals[1] );
        this.quad( 3, 0, 4, 7 , this.normals[2] );
        this.quad( 6, 5, 1, 2  , this.normals[3] );
        this.quad( 4, 5, 6, 7  , this.normals[4] );
        this.quad( 5, 4, 0, 1  , this.normals[5] );
    }

    constructor(){
        this.ambient = [ 1.0 , 1.0 , 1.0 , 1.0  ]
        this.specular = [ 0.0 , 0.0 , 0.0 , 1.0 ]
        this.type = "cube"
        this.kS = 0.5;
        this.vertices = []
        this.vertexColors = []
        this.indices = []
        this.points = []
        this.normals = [
            vec4( 0.0 , 0.0 , 1.0, 0.0  ),
            vec4( 1.0 , 0.0 , 0.0 , 0.0 ),
            vec4( 0.0 , -1.0 , 0.0, 0.0  ),
            vec4( 0.0 , 1.0 , 0.0 , 0.0 ),
            vec4( 0.0 , 0.0 , -1.0, 0.0  ),
            vec4( -1.0 , 0.0 , 0.0 , 0.0 ),
            
        ];
        this.colors = []
        this.vBuffer = 0;
        this.cBuffer = 0;
        this.vColor = 0;
         this.modelview = mat4(); 
        this.projection = mat4(); 
        this.colorQuad();

        this.shininess = 1;
        this.mirror = 1;
    }
    
    
}



class Sphere{
    constructor(){
        this.radius = 0.25; 
        this.center = new vec4( 0.0 ,  0.75 , 1.0 , 1.0 )
        this.ambient = [ 1.0 , 1.0 , 1.0 , 1.0  ]
        this.specular = [ 1.0 ,1.0 ,1.0 , 1.0 ]     
        this.shininess = 3
        this.modelview  =mat4()
        this.perspective = mat4()
        this.type = "sphere"
        this.kS = 0.5;
        this.mirror = 0;
    }
}
class Cone{
    constructor(){
        this.ambient = [ 1.0 ,0.0 , 0.0 , 0.0  ]
        this.specular = [ 1.0 , 0.0 , 0.0 , 1.0 ]        
        this.type = "cone"
        this.points = [vec4( 1.5, 0, 0,1), 
            vec4(-1.5, 1, 0,1), 
            vec4(-1.5, 0.809017,	0.587785,1), 
            vec4(-1.5, 0.309017,	0.951057, 1), 
            vec4(-1.5, -0.309017, 0.951057, 1), 
            vec4(-1.5, -0.809017, 0.587785,1), 
            vec4(-1.5, -1, 0,1),  
            vec4(-1.5, -0.809017, -0.587785,1), 
            vec4(-1.5, -0.309017, -0.951057,1),  
            vec4(-1.5, 0.309017,	-0.951057,1),  
            vec4(-1.5, 0.809017,	-0.587785 , 1) ];
        
        this.vertices = [
            1.5, 0, 0, 1,
            -1.5, 1, 0, 1,
            -1.5, 0.809017,	0.587785,1,

            1.5, 0, 0, 1,
            -1.5, 0.809017,	0.587785,1,
            -1.5, 0.309017,	0.951057,1,
            
            1.5, 0, 0, 1,
            -1.5, 0.309017,	0.951057, 1,
            -1.5, -0.309017, 0.951057,1,

            1.5, 0, 0, 1,
            -1.5, -0.309017, 0.951057, 1,
            -1.5, -0.809017, 0.587785,1,

            1.5, 0, 0,1,
            -1.5, -0.809017, 0.587785,1,
            -1.5, -1, 0, 1,

            1.5, 0, 0,1,
            -1.5, -1, 0, 1,
            -1.5, -0.809017, -0.587785,1,

            1.5, 0, 0,1,
            -1.5, -0.809017, -0.587785,1,
            -1.5, -0.309017, -0.951057,1,

            1.5, 0, 0,1,
            -1.5, -0.309017, -0.951057, 1,
             -1.5, 0.309017,	-0.951057, 1,

             1.5, 0, 0,1,
             -1.5, 0.309017,	-0.951057, 1,
            -1.5, 0.809017,	-0.587785,1,

            1.5, 0, 0,1,
            -1.5, 0.809017,	-0.587785,1,
            -1.5, 1, 0,1]

            this.modelview = mat4()
            this.projection = mat4()
            this.vBuffer = gl.createBuffer();
            this.kS = 0.5;
            this.shininess = 1
            this.mirror = 0;
    }

}
//scale for 4 d 
function scale4(a, b, c) {
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
    return result;
 }



 //trackball functions 

 function startMotion( x,  y)
{
    trackingMouse = true;
    startX = x;
    startY = y;
    curx = x;
    cury = y;

    lastPos = trackballView(x, y);
	  trackballMove=true;
}

function stopMotion( x,  y)
{
    trackingMouse = false;
    angle = 0.0;
    trackballMove = false;
    
}
function trackballView( x,  y ) {
    var d, a;
    var v = [];

    v[0] = x;
    v[1] = y;

    d = v[0]*v[0] + v[1]*v[1];
    if (d < 1.0)
      v[2] = Math.sqrt(1.0 - d);
    else {
      v[2] = 0.0;
      a = 1.0 /  Math.sqrt(d);
      v[0] *= a;
      v[1] *= a;
    }
    return v;
}


 function mouseMotion( x,  y)
{
    var dx, dy, dz;

    var curPos = trackballView(x, y);
    if(trackingMouse) {
      dx = curPos[0] - lastPos[0];
      dy = curPos[1] - lastPos[1];
      dz = curPos[2] - lastPos[2];

      if (dx || dy || dz) {
	       angle = -1 * Math.sqrt(dx*dx + dy*dy + dz*dz);


	       axis[0] = lastPos[1]*curPos[2] - lastPos[2]*curPos[1];
	       axis[1] = lastPos[2]*curPos[0] - lastPos[0]*curPos[2];
	       axis[2] = lastPos[0]*curPos[1] - lastPos[1]*curPos[0];

           lastPos[0] = curPos[0];
	       lastPos[1] = curPos[1];
	       lastPos[2] = curPos[2];
      }
    }
}
function rotateEye(obje)
{
    eye = scale(cameraRadious , normalize(eye));
    var eyeMat = mat4();
    eyeMat[0] = vec4(eye);

    axis = normalize(axis);
    var rotatedMat = mult(eyeMat, rotate(angle * 100, axis));
    eye = vec3(rotatedMat[0]);
    obje.modelview= mult(obje.modelview, lookAt(eye, at, up));
}
//end of trackball 


//background 
function initBkgnd() {
    backTex = gl.createTexture();
    backTex.Img = new Image();
    backTex.Img.crossOrigin = "anonymous"
    
    backTex.Img.onload = function() {
        
        handleBkTex(backTex);
        console.log("muzzy")
    }
    backTex.Img.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBv8w8LfighVUen1vLuQbwHTi5TnapDKnD6w&usqp=CAU";
}
function handleBkTex(tex) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tex.Img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
    console.log("image loaded ")
    
}
//end of background 

function traceaytek()
{
    for (var y = 0; y < imageSize; ++y)
    {
        for (var x = 0; x < imageSize; ++x)
        {
            // Get a random color
            var color = vec3(Math.random(), Math.random(), Math.random());

            // Trace Here

            // Set color values
            image[(y * imageSize + x) * 3 + 0] = 255 * color[0];
            image[(y * imageSize + x) * 3 + 1] = 255 * color[1];
            image[(y * imageSize + x) * 3 + 2] = 255 * color[2];
        }
    }
}

var colors = [
    [1.0, 0.0, 0.0 , 1.0],
    [0.0, 1.0, 0.0 , 1.0],
    [0.0, 0.0, 1.0 , 1.0],
    [1.0, 1.0, 0.0 , 1.0],
    [1.0, 0.0, 1.0 , 1.0],
    [0.0, 1.0, 1.0 , 1.0],
    [0,0,0,1]
]
//tracer functions 
function trace(objectList){
    for( var i = 0; i < imageSize; i ++ ){
        for( var j = 0; j < imageSize ; j++ ){
            var point = new vec4( -1.0 + i/(64), -1.0 + j/(64) , 0 , 1)
            var origin = new vec4(0 , 0 , 10 , 1)
            var ray1 = new Ray( origin , point , lightlist )
            //console.log( point[0], "  " , point[1])
            var color = ray1.findClosestIntersection( objectList , null )
            //var color = ray1.findClosestIntersection(objectList, null);
            //console.log( "color list "   ,  color   ,  i   , j )
            image[(i * imageSize + j) * 3 + 0] = 255 * color[0];
            image[(i * imageSize + j) * 3 + 1] = 255 * color[1];
            image[(i * imageSize + j) * 3 + 2] = 255 * color[2];
        }
    }
}
