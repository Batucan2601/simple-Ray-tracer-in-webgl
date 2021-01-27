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
var objectList; // list of the objects in the field 
//ray tracer 
var imageSize = 128 // pixel size 
var image = new Uint8ClampedArray(imageSize * imageSize * 3);

window.onload = function init(){
    
    var canvas = document.getElementById( "gl-canvas" );
     gl = WebGLUtils.setupWebGL( canvas );    
     if ( !gl ) { alert( "WebGL isn't available" ); 
}
gl.viewport( 0, 0, canvas.width, canvas.height );
gl.clearColor( 0.0, 0.0, 0.0, 0.0 );


//    
console.log( "selamin aleykum ")
canvas.addEventListener("mousedown", function(event){
    var x = 2*event.clientX/canvas.width-1;
    var y = 2*(canvas.height-event.clientY)/canvas.height-1;
    startMotion(x, y);
  });

canvas.addEventListener("mouseup", function(event){
    var x = 2*event.clientX/canvas.width-1;
    var y = 2*(canvas.height-event.clientY)/canvas.height-1;
    stopMotion(x, y);
  });

canvas.addEventListener("mousemove", function(event){

    var x = 2*event.clientX/canvas.width-1;
    var y = 2*(canvas.height-event.clientY)/canvas.height-1;
    mouseMotion(x, y);
  } );

  canvas.addEventListener("wheel", function(event){
        event.preventDefault();
           cameraRadious += event.deltaY * -0.01;
            // Restrict scale
            cameraRadious = Math.min(Math.max(0.125, cameraRadious), 10);

            

            console.log(cameraRadious);
        
  } );
  
//  Load shaders and initialize attribute buffers
objectProgram = initShaders( gl, "vertex-shader", "fragment-shader" );
lightSourceProgram = initShaders( gl , "vertex-shader-lightsource" , "fragment-shader-lightsource")


// Load the data into the GPU  
//create the cube 
//trace()
var o = new vec4(-10  , -10, 10 , 1 )
var d = new vec4( -9 ,-9 , 9 , 1)
var rayy = new Ray(o , d)
//console.log( "reflectino vector  " , calculateReflectionVector( rayy , [0,0,0] , [ -1 , 0 , 0 ]))
// sphere test 
var sphere = new Sphere; 
var intersect  = rayy.isSphereIntersect(sphere)
var vector = calculateReflectionVectorForSphere( rayy , intersect , sphere)


render();

};
var originVec = new vec4( 0 , 0, 10 , 1 )
var destVec = new vec4( 0 ,0 , 9  , 1)
var ray = new Ray(originVec , destVec)


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT ); 
    //created cube 
    cube = new Cube()
    gl.useProgram( objectProgram );
    cube.projection = perspective( 90 , 1 ,0 , 15 )
    gl.uniformMatrix4fv(gl.getUniformLocation( objectProgram, "projection"), false, flatten(cube.projection) );
    cube.modelview = mult( cube.modelview , translate( 1 , 0, 5 ))
    rotateEye(cube); // automate this
    gl.uniformMatrix4fv(gl.getUniformLocation( objectProgram, "modelView"), false, flatten(cube.modelview) );
    initBkgnd()
    gl.drawArrays( gl.TRIANGLES, 0,72);

    console.log( "point in triaaaaangleeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", isPointInTriangle( [3, 3, 0, 1], [ 0 , 0, 0, 1],
        [5 , 5 , 0, 1],
        [ 10 , 0 , 0 ,1] )  )
   // created cone 
    cone = new Cone()
    cone.projection = perspective( 90 , 1 ,0 , 15 )
    gl.uniformMatrix4fv(gl.getUniformLocation( objectProgram, "projection"), false, flatten(cone.projection) );
    cone.modelview = mult( cone.modelview , translate( 0 , 0.1, 6 ) )
    console.log( "  cone mv " , cone.modelview)
    console.log(  "cone intersection" ,  ray.isIntersect(cone) ) 
    rotateEye(cone)
    gl.uniformMatrix4fv( gl.getUniformLocation( objectProgram , "modelView") , false , flatten( cone.modelview ))
    gl.drawArrays( gl.TRIANGLES  , 0 , 300 )
    //cube.modelview = mult(  cube.modelview , rotate( 20  , 0 , 1 , 1 ))
    
    temp = calculatePlane ( [1 , 2 ,-2] , [3 , -2 , 1]  , [5 ,1 , -4 ] )
    
   //if( creationFinished ==  1 ){
    gl.useProgram( lightSourceProgram );
    lighting = new LightSource()
    lighting.projection = perspective( 90 , 1 ,0 , 15 )
    gl.uniformMatrix4fv(gl.getUniformLocation( lightSourceProgram, "projection"), false, flatten(lighting.projection) );
    lighting.modelview = mult( lighting.modelview , translate( 0 , 0, 0 ))
    rotateEye(lighting)
    gl.uniformMatrix4fv(gl.getUniformLocation( lightSourceProgram, "modelView"), false, flatten(lighting.modelview) );
    gl.drawArrays( gl.TRIANGLES, 0,3000);
    requestAnimationFrame(render)
    //console.log( "cube coord "  , cube.modelview)
    /*for ( var i = 0 ; i < 512 ; i++ ){
        for ( var j = 0 ; j < 512 ; j++ ){
        }
    }*/
    // can't do tracing in all of the loop 
  // }
   
  
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
        this.type = "cube"
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
        this.vBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(this.points), gl.STATIC_DRAW );
        this.bindBuffers();
    }
    bindBuffers(){
    
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
        var vertexSize = 2 * 4 * 4; 
        var vPosition = gl.getAttribLocation( objectProgram, "vPosition" );
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, vertexSize, 0 );
        gl.enableVertexAttribArray( vPosition );

        var vNormal = gl.getAttribLocation(objectProgram , "vNormal");
        gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, vertexSize, 16  );
        gl.enableVertexAttribArray( vNormal );
    
        
       
    }
    
    
}

class LightSource // modified Sphere 
{  
    vertices = [];

    constructor(){
        this.type = "Sphere"
        this.count = 4;
        var va = vec4(0.0, 0.0, -1.0, 1);
        var vb = vec4(0.0, 0.942809, 0.333333, 1);
        var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
        var vd = vec4(0.816497, -0.471405, 0.333333, 1);
        this.modelview = mat4(); 
        this.projection = mat4(); 
        this.tetrahedron(va, vb, vc, vd, this.count);
        this.createBuffers();
        console.log(this.vertices);
    }
    
    bindBuffers()
    {this.bindBuffers();
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

        var vPosition = gl.getAttribLocation( lightSourceProgram, "vPosition" );
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );
    
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
    }
    
    createBuffers()
    {
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

        var vPosition = gl.getAttribLocation( lightSourceProgram, "vPosition" );
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );
    
    }
    
    triangle(a, b, c) {
        this.vertices.push(a); 
        this.vertices.push(b); 
        this.vertices.push(c);     
   }
    

    divideTriangle(a, b, c, count) {
        if ( count > 0 ) {
                    
            var ab = normalize(mix( a, b, 0.5), true);
            var ac = normalize(mix( a, c, 0.5), true);
            var bc = normalize(mix( b, c, 0.5), true);
                                    
            this.divideTriangle( a, ab, ac, count - 1 );
            this.divideTriangle( ab, b, bc, count - 1 );
            this.divideTriangle( bc, c, ac, count - 1 );
            this.divideTriangle( ab, bc, ac, count - 1 );
        }
        else { // draw tetrahedron at end of recursion
            this.triangle( a, b, c );
        }
    }

    tetrahedron(a, b, c, d, n) {
        this.divideTriangle(a, b, c, n);
        this.divideTriangle(d, c, b, n);
        this.divideTriangle(a, d, b, n);
        this.divideTriangle(a, c, d, n);
    }
}

/*class Sphere
{  
    vertices = [];

    constructor(){
        this.type = "Sphere"
        this.count = 4;
        var va = vec4(0.0, 0.0, -1.0, 1);
        var vb = vec4(0.0, 0.942809, 0.333333, 1);
        var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
        var vd = vec4(0.816497, -0.471405, 0.333333, 1);
        this.tetrahedron(va, vb, vc, vd, this.count);
        this.createBuffers();
         this.modelview = mat4(); 
        this.projection = mat4(); 
        console.log(this.vertices);
    }
    
    bindBuffers()
    {
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

        var vPosition = gl.getAttribLocation( objectProgram, "vPosition" );
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );
    
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
    }
    
    createBuffers()
    {
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vertexBuffer );
        gl.bufferData(gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW);

        var vPosition = gl.getAttribLocation( objectProgram, "vPosition" );
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );
    
    }
    
    triangle(a, b, c) {
        this.vertices.push(a); 
        this.vertices.push(b); 
        this.vertices.push(c);     
   }
    

    divideTriangle(a, b, c, count) {
        if ( count > 0 ) {
                    
            var ab = normalize(mix( a, b, 0.5), true);
            var ac = normalize(mix( a, c, 0.5), true);
            var bc = normalize(mix( b, c, 0.5), true);
                                    
            this.divideTriangle( a, ab, ac, count - 1 );
            this.divideTriangle( ab, b, bc, count - 1 );
            this.divideTriangle( bc, c, ac, count - 1 );
            this.divideTriangle( ab, bc, ac, count - 1 );
        }
        else { // draw tetrahedron at end of recursion
            this.triangle( a, b, c );
        }
    }

    tetrahedron(a, b, c, d, n) {
        this.divideTriangle(a, b, c, n);
        this.divideTriangle(d, c, b, n);
        this.divideTriangle(a, d, b, n);
        this.divideTriangle(a, c, d, n);
    }
}*/
class Sphere{
    constructor(){
        this.radius = 1; 
        this.center = new vec4( 0.0 , 0.0 , 1.0 , 1.0 )
        this.color = [ 1.0 , 1.0 , 0.0 , 1.0 ]
        this.modelview  =mat4()
        this.perspective = mat4()
        this.type = "sphere"
    }
}
class Cone{
    constructor(){
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
            gl.bindBuffer( gl.ARRAY_BUFFER, this.vBuffer );
            gl.bufferData( gl.ARRAY_BUFFER, flatten(this.vertices), gl.STATIC_DRAW );
            this.bindBuffers();
    }
    bindBuffers(){
        var vPosition = gl.getAttribLocation( objectProgram, "vPosition" );
        gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( vPosition );
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



//tracer functions 
function trace(){
    for( var i = 0; i < imageSize; i ++ ){
        for( var j = 0; j < imageSize ; j++ ){
            var point = new vec4( -10 + i/(6.4), -10 + j/(6.4) , 9 , 1)
            var origin = new vec4( 0, 0, 10 ,1) // origin point 
            var ray1 = new Ray( origin , point )
            console.log( point[0], "  " , point[1])
        }
    }
}