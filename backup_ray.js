var maximumD // maximum distance that we halt the ray 
var minimumD // minimum distance 
// start sending rays to pixels, where the grid is 1 pixel away from the camera 
function calculatePlane( A , B , C ){
    // calculate normal 
    var v1 = new vec3(   B[0] - A[0] , B[1] - A[1], B[2] - A[2])
    var v2 = new vec3( C[0] - A[0] , C[1] - A[1], C[2] - A[2])
    var normal = []
    normal = cross( v1 , v2 )
    //normal = normalize(normal)
    var d =  ( (normal[0] * A[0]) + (normal[1] * A[1]) + (normal[2] * A[2]) )

    var components = new vec4( normal[0] , normal[1] , normal[2] , d )
    return components 
}
function scale4( a , b, c ){
    var result = mat4();
    result[0][0] = a;
    result[1][1] = b;
    result[2][2] = c;
}
function linePlaneIntersection( plane , origin , parametric  ){
    var x = plane[0] *  origin[0]
    var xpar =  plane[0] * parametric[0]
    var y  = plane[1] *  origin[1]
    var ypar =  plane[1] *  parametric[1]
    var z  = plane[2] *  origin[2]
    var zpar =  plane[2] *  parametric[2]
    var solutionT = (plane[3] - (x + y + z) ) / (xpar + ypar + zpar)
    var solutionVec = [ (origin[0]  + (parametric[0] * solutionT)), (origin[1]  + (parametric[1] * solutionT)) , (origin[2]  + (parametric[2] * solutionT) )]
    return solutionVec
}
function vecMatMult( v  , m ){
    var v2 = new vec4(0 , 0, 0 , 1)
    v2[0] =  v[0] * m[0][0] +  v[1] * m[0][1] + v[2] * m[0][2] + 1 * m[0][3]//first 
    v2[1] =  v[0] * m[1][0] +  v[1] * m[1][1] + v[2] * m[1][2] + 1 * m[1][3]//second
    v2[2] =   v[0] * m[2][0] +  v[1] * m[2][1] + v[2] * m[2][2] + 1 * m[2][3]//third
    return v2
}
function calculateReflectionVector( ray ,  plane  ){ // for cone and cube 
    var d  = ray.parametric // d
    var n =  [ plane[0] , plane[1] , plane[2] ]
    n  = normalize( n )
    var dotP = -2 * dot( d , n )
    n = [ n[0] * dotP , n[1] * dotP , n[2] * dotP ]
    var r = [  d[0] + n[0] , d[1] + n[1] , d[2] + n[2]    ]
    return r
}
function calculateReflectionVectorForSphere( ray , intersection , object  ){
    var normal = [  intersection[0] -  object.center[0] ,     intersection[1] -  object.center[1]  ,  intersection[2] -  object.center[2] ]
    console.log( ray  , intersection , object)
    normal = normalize(normal)
    var r = calculateReflectionVector( ray , [ normal[0] , normal[1] , normal[2]])
    return r 
}
function calculateReflection( d,  plane  ){ // for vector and ( plane and normal) 
    var n =  [ plane[0] , plane[1] , plane[2] ]
    n  = normalize( n )
    var dotP = -2 * dot( d , n )
    n = [ n[0] * dotP , n[1] * dotP , n[2] * dotP ]
    var r = [  d[0] + n[0] , d[1] + n[1] , d[2] + n[2]    ]
    return r
}
function isPointInTriangle( p , p1 ,p2 , p3 ){
    var mainTriangle = calculateTriangleArea( p1 , p2 ,p3 )
    var first = calculateTriangleArea ( p , p1 , p2 )
    var second = calculateTriangleArea( p , p1 , p3 )
    var third = calculateTriangleArea( p , p2 , p3  )
    var total = first + second + third 
    if( Math.abs( total - mainTriangle ) < 0.001 ){
        return true 
    }
    return false 
}
function calculateTriangleArea(p1 , p2 , p3 ){
    var AB =  Math.sqrt (  Math.pow( p2[0] - p1[0] , 2)  +  Math.pow(  p2[1] - p1[1] , 2)  + Math.pow( p2[2] - p1[2], 2  )  ) 
    var BC =  Math.sqrt(  Math.pow (p3[0] - p2[0] , 2 ) + Math.pow (  p3[1] - p2[1] , 2 )  +  Math.pow(  p3[2] - p2[2] ,  2)  )
    var AC = Math.sqrt(  Math.pow (p3[0] - p1[0] , 2 ) + Math.pow (  p3[1] - p1[1] , 2 )  +  Math.pow(  p3[2] - p1[2] ,  2)  )
    var s = (AB + BC + AC)  /2 
    var area = Math.sqrt ( s * Math.abs( s - AB ) * Math.abs(s - BC) *  Math.abs( s - AC))
    return area
}



class Ray{
    constructor( origin , direction , lightList ){ // I am looking from  ( 0 , 0,  +10 , 1 )
        this.origin = origin
        this.direction = direction
        this.parametric = [ this.direction[0] - this.origin[0] , this.direction[1] - this.origin[1] , this.direction[2] - this.origin[2] ]
        this.lightList = lightList;
    }
    findClosestIntersection( objectList , intersectedObject ){ // that will return a color pixel in the end 
        //console.log(" ray origin is " , this.origin , " direction is " , this.parametric)
        var newRay 
        var distancemin = 100000
        var object = null 
        var intersect = 3
        console.log( objectList)
        for( var i = 0; i < objectList.length; i++ ){
            var temp_intersect = this.isIntersect( objectList[i])
            
            if( temp_intersect[0] == 10000 || objectList[i] == intersectedObject){
                continue
            }
            console.log( " temp intersect " , temp_intersect)
            var distance = Math.sqrt( Math.pow(temp_intersect[0][0] - this.origin[0] ,2)  +  Math.pow( temp_intersect[0][1] - this.origin[1] ,2) + Math.pow(temp_intersect[0][2] - this.origin[2] ,2))
            console.log("distance" , distance)
            if( distancemin > distance ){
                distancemin  = distance 
                object = objectList[i]
                intersect = temp_intersect
            }
    
        }
        
        if( object == null || intersect[0] == 10000 ){
            // here return thebackground color 
            //console.log("nothing intersected ");
            return [0,0,0,1];
        }
        console.log( "object " , object )
        // here setup the next ray to be sent 
        var intersectionPoint
        if( object.type == "cube" || object.type == "cone"){        
            intersectionPoint = intersect
            
            
            // we should add color stuff here 
        }
        else if( object.type == "sphere"){
            intersectionPoint = intersect
            //newRay = new Ray( intersectionPoint , r )
            // add color stuff here 
        }


        // we need to create the ray a little bit outside the objecct 
        var normalVec = vec4(intersect[1])
        normalVec = normalize(normalVec)
        console.log("normal ", normalVec)
        var totalColor = this.shadowFeeler(intersectionPoint , objectList , normalVec , object  )
        //console.log( r )
        //newRay = new Ray( intersectionPoint[0] , r ) 
        //console.log("closest intersection is on object == " , object.type , " and on point " , intersectionPoint)
        //console.log( "  new ray " ,   newRay.origin , newRay.direction);
       // newRay.findClosestIntersection( objectList , object  )
        
        // var totalColor = [ 1.0 , 0.5 , 0.5 ];
        return totalColor
    }
    isIntersect( object  ){
            var intersect 
            if( object.type == "cube"){
                intersect = this.isCubeIntersect(object)
            }
            else if( object.type == "sphere"){
                intersect =  this.isSphereIntersect(object)
            }
            else if(object.type == "cone"){
                intersect = this.isConeInterSect( object )
            }
            else if( object.type = "lightSource "){
                // return this.isLightsourceIntersection
            }
            if( intersect == false ){
                return  [10000 , 100000 , 10000 ]
            }
            return intersect
    }
    isCubeIntersect( object ){ // returns false or intersection  and the respective plane
        var cubeVertices =[]
        for( var i = 0; i < 8 ; i++ ){
            cubeVertices.push( vecMatMult( object.vertices[i]  , object.modelview  )  ) 
            console.log( cubeVertices );
        }
        console.log(object.modelview)

      
        // after calculating newPoints now we can look for intersections , and it will be hard 
        // we will create 6 planes and check each of them for intersection 
        
        // this.quad( 1, 0, 3, 2 , this.normals[0] );
        // this.quad( 2, 3, 7, 6  , this.normals[1] );
        // this.quad( 3, 0, 4, 7 , this.normals[2] );
        // this.quad( 6, 5, 1, 2  , this.normals[3] );
        // this.quad( 4, 5, 6, 7  , this.normals[4] );
        // this.quad( 5, 4, 0, 1  , this.normals[5] );
        
        // find the t when the  center has same x with parametric line 
        // plane 1 
        var planes = []
        var intersections = []
        planes[0] = calculatePlane( cubeVertices[1] , cubeVertices[0] , cubeVertices[3] )
        //console.log("cube vertices "  , cubeVertices[1] , cubeVertices[0] , cubeVertices[3])
        //console.log("plane"  , planes[0])
        intersections[0] =     linePlaneIntersection( planes[0] , this.origin , this.parametric )
        planes[1] = calculatePlane( cubeVertices[2] , cubeVertices[3] , cubeVertices[7] )
        intersections[1] =     linePlaneIntersection( planes[1] , this.origin , this.parametric )
        planes[2] = calculatePlane( cubeVertices[3] , cubeVertices[0] , cubeVertices[4] )
        intersections[2] =     linePlaneIntersection( planes[2] , this.origin , this.parametric )
        planes[3] = calculatePlane( cubeVertices[6] , cubeVertices[5] , cubeVertices[1] )
        intersections[3] =     linePlaneIntersection( planes[3] , this.origin , this.parametric )
        //console.log("calling normal ")
        planes[4] = calculatePlane( cubeVertices[4] , cubeVertices[5] , cubeVertices[6] )
        intersections[4] =     linePlaneIntersection( planes[4] , this.origin , this.parametric )
        planes[5] = calculatePlane( cubeVertices[5] , cubeVertices[4] , cubeVertices[0] )
        intersections[5] =     linePlaneIntersection( planes[5] , this.origin , this.parametric )
        //console.log( "plane 5 ", planes[4])
        for( var i = 0;  i < 6; i++ ){
           // console.log("intersection ," ,i , " " , intersections[i])
        }
        //console.log( "cubevertex 4 5 6" , cubeVertices[4] , cubeVertices[5] , cubeVertices[6], cubeVertices[7])
        var validIntersections = [] // store the valid intersections 
        // now check of points are inside cube boundaries 
        // plane1 
        var minXPlane1 = Math.min( cubeVertices[1 ][0] , cubeVertices[0][0] , cubeVertices[3][0] , cubeVertices[2][0])
        var maxXPlane1 = Math.max( cubeVertices[1 ][0] , cubeVertices[0][0] , cubeVertices[3][0] , cubeVertices[2][0])
        var minYPlane1 = Math.min( cubeVertices[1 ][1] , cubeVertices[0][1] , cubeVertices[3][1] , cubeVertices[2][1])
        var maxYPlane1 = Math.max( cubeVertices[1 ][1] , cubeVertices[0][1] , cubeVertices[3][1]  ,cubeVertices[2][1])
        var minZPlane1 = Math.min( cubeVertices[1 ][2] , cubeVertices[0][2] , cubeVertices[3][2] , cubeVertices[2][2])
        var maxZPlane1 = Math.max( cubeVertices[1 ][2] , cubeVertices[0][2] , cubeVertices[3][2] , cubeVertices[2][2])
        //console.log( " muzooooooooooooooooooooooooo1 "  , intersections[0])
        //console.log( minXPlane1  , maxXPlane1 , minYPlane1 , maxYPlane1  , minZPlane1 , maxZPlane1 , "  muzooooooooooooooooooooooooooooooooooooooooooooooooooooooooo")
        if( intersections[0][0] >= minXPlane1 && intersections[0][0] <= maxXPlane1 && intersections[0][1] >= minYPlane1 && intersections[0][1] <= maxYPlane1 && intersections[0][2] >= minZPlane1 && intersections[0][2] <= maxZPlane1 ){
            if( isPointInTriangle( intersections[0] , cubeVertices[0] , cubeVertices[1] , cubeVertices[3]) ||  isPointInTriangle( intersections[0] , cubeVertices[1] , cubeVertices[2] , cubeVertices[3]) )
                validIntersections.push( intersections[0] )
        }
        console.log ( "plane1" , isPointInTriangle( intersections[0] , cubeVertices[0] , cubeVertices[1] , cubeVertices[3]) &&  isPointInTriangle( intersections[0] , cubeVertices[1] , cubeVertices[2] , cubeVertices[3]) )
        //plane2 
        var minXPlane2 = Math.min( cubeVertices[2 ][0] , cubeVertices[3][0] , cubeVertices[7][0] , cubeVertices[6][0] )
        var maxXPlane2 = Math.max( cubeVertices[2 ][0] , cubeVertices[3][0] , cubeVertices[7][0] , cubeVertices[6][0])
        var minYPlane2 = Math.min( cubeVertices[2 ][1] , cubeVertices[3][1] , cubeVertices[7][1] , cubeVertices[6][1])
        var maxYPlane2 = Math.max( cubeVertices[2 ][1] , cubeVertices[3][1] , cubeVertices[7][1] , cubeVertices[6][1])
        var minZPlane2 = Math.min( cubeVertices[2 ][2] , cubeVertices[3][2] , cubeVertices[7][2]  , cubeVertices[6][2])
        var maxZPlane2 = Math.max( cubeVertices[2 ][2] , cubeVertices[3][2] , cubeVertices[7][2] , cubeVertices[6][2])
        if( intersections[1][0] >= minXPlane2 && intersections[1][0] <= maxXPlane2 && intersections[1][1] >= minYPlane2 && intersections[1][1] <= maxYPlane2 && intersections[1][2] >= minZPlane2 && intersections[1][2] <= maxZPlane2 ){
            if( isPointInTriangle( intersections[1] , cubeVertices[2] , cubeVertices[3] , cubeVertices[7]) || isPointInTriangle( intersections[1] , cubeVertices[2] , cubeVertices[7] , cubeVertices[6]) )
                validIntersections.push( intersections[1] )
        }
            

        //plane3 
        var minXPlane3 = Math.min( cubeVertices[3 ][0] , cubeVertices[0][0] , cubeVertices[4][0] , cubeVertices[7][0] )
        var maxXPlane3 = Math.max( cubeVertices[3 ][0] , cubeVertices[0][0] , cubeVertices[4][0] , cubeVertices[7][0])
        var minYPlane3 = Math.min( cubeVertices[3 ][1] , cubeVertices[0][1] , cubeVertices[4][1]  ,cubeVertices[7][1])
        var maxYPlane3 = Math.max( cubeVertices[3 ][1] , cubeVertices[0][1] , cubeVertices[4][1] , cubeVertices[7][1])
        var minZPlane3 = Math.min( cubeVertices[3 ][2] , cubeVertices[0][2] , cubeVertices[4][2] , cubeVertices[7][2])
        var maxZPlane3 = Math.max( cubeVertices[3 ][2] , cubeVertices[0][2] , cubeVertices[4][2]  , cubeVertices[7][2])
        if( intersections[2][0] >= minXPlane3 && intersections[2][0] <= maxXPlane3 && intersections[2][1] >= minYPlane3 && intersections[2][1] <= maxYPlane3 && intersections[2][2] >= minZPlane3 && intersections[2][2] <= maxZPlane3 ){
            if( isPointInTriangle( intersections[2] , cubeVertices[3] , cubeVertices[0] , cubeVertices[4]) ||  isPointInTriangle( intersections[2] , cubeVertices[4] , cubeVertices[7] , cubeVertices[3]) )
                validIntersections.push( intersections[2] )
        }

        //plane4 
        var minXPlane4 = Math.min( cubeVertices[6 ][0] , cubeVertices[5][0] , cubeVertices[1][0] , cubeVertices[2 ][0] )
        var maxXPlane4 = Math.max( cubeVertices[6 ][0] , cubeVertices[5][0] , cubeVertices[1][0] , cubeVertices[2 ][0])
        var minYPlane4 = Math.min( cubeVertices[6 ][1] , cubeVertices[5][1] , cubeVertices[1][1] , cubeVertices[2 ][1])
        var maxYPlane4 = Math.max( cubeVertices[6 ][1] , cubeVertices[5][1] , cubeVertices[1][1] , cubeVertices[2 ][1])
        var minZPlane4 = Math.min( cubeVertices[6 ][2] , cubeVertices[5][2] , cubeVertices[1][2]  , cubeVertices[2 ][2])
        var maxZPlane4 = Math.max( cubeVertices[6 ][2] , cubeVertices[5][2] , cubeVertices[1][2]  , cubeVertices[2 ][2])
        if( intersections[3][0] >= minXPlane4 && intersections[3][0] <= maxXPlane4 && intersections[3][1] >= minYPlane4 && intersections[3][1] <= maxYPlane4 && intersections[3][2] >= minZPlane4 && intersections[3][2] <= maxZPlane4 ){
            if( isPointInTriangle( intersections[3] , cubeVertices[1] , cubeVertices[2] , cubeVertices[5]) ||  isPointInTriangle( intersections[3] , cubeVertices[2] , cubeVertices[5] , cubeVertices[6]) )
                validIntersections.push( intersections[3] )
        }

        //plane5 
        var minXPlane5 = Math.min( cubeVertices[4 ][0] , cubeVertices[5][0] , cubeVertices[6][0] , cubeVertices[7][0] )
        var maxXPlane5 = Math.max( cubeVertices[4 ][0] , cubeVertices[5][0] , cubeVertices[6][0] , cubeVertices[7][0])
        var minYPlane5 = Math.min( cubeVertices[4 ][1] , cubeVertices[5][1] , cubeVertices[6][1] , cubeVertices[7][1] )
        var maxYPlane5 = Math.max( cubeVertices[4 ][1] , cubeVertices[5][1] , cubeVertices[6][1] , cubeVertices[7][1])
        var minZPlane5 = Math.min( cubeVertices[4 ][2] , cubeVertices[5][2] , cubeVertices[6][2] , cubeVertices[7][2])
        var maxZPlane5 = Math.max( cubeVertices[4 ][2] , cubeVertices[5][2] , cubeVertices[6][2] , cubeVertices[7][2])
        if( intersections[4][0] >= minXPlane5 && intersections[4][0] <= maxXPlane5 && intersections[4][1] >= minYPlane5 && intersections[4][1] <= maxYPlane5 && intersections[4][2] >= minZPlane5 && intersections[4][2] <= maxZPlane5 ){
            if( isPointInTriangle( intersections[4] , cubeVertices[4] , cubeVertices[5] , cubeVertices[6]) ||  isPointInTriangle( intersections[4] , cubeVertices[4] , cubeVertices[6] , cubeVertices[7]) )
                validIntersections.push( intersections[4] )
        }
        //console.log("arkadan vur" , intersections[4])    

        //plane 6
        var minXPlane6 = Math.min( cubeVertices[5 ][0] , cubeVertices[4][0] , cubeVertices[0][0] , cubeVertices[1][0] )
        var maxXPlane6 = Math.max( cubeVertices[5 ][0] , cubeVertices[4][0] , cubeVertices[0][0] , cubeVertices[1][0])
        var minYPlane6 = Math.min( cubeVertices[5 ][1] , cubeVertices[4][1] , cubeVertices[0][1] , cubeVertices[1][1])
        var maxYPlane6 = Math.max( cubeVertices[5 ][1] , cubeVertices[4][1] , cubeVertices[0][1] , cubeVertices[1][1])
        var minZPlane6 = Math.min( cubeVertices[5 ][2] , cubeVertices[4][2] , cubeVertices[0][2], cubeVertices[1][2] )
        var maxZPlane6 = Math.max( cubeVertices[5 ][2] , cubeVertices[4][2] , cubeVertices[0][2], cubeVertices[1][2] )
        if( intersections[5][0] >= minXPlane6 && intersections[5][0] <= maxXPlane6 && intersections[5][1] >= minYPlane6 && intersections[5][1] <= maxYPlane6 && intersections[5][2] >= minZPlane6 && intersections[5][2] <= maxZPlane6 ){
            if( isPointInTriangle( intersections[5] , cubeVertices[5] , cubeVertices[4] , cubeVertices[1]) ||  isPointInTriangle( intersections[5] , cubeVertices[1] , cubeVertices[4] , cubeVertices[0]) )
                validIntersections.push( intersections[5] )
           
        }
        
            console.log("validintersecitons" , validIntersections)
            if( validIntersections.length == 0 ){
            return false 
        }
        
        // else you need to compute the closest intersection to the origin point 
        var distances
        var min = 1000000 
        var returnIndex 
        for( var i = 0; i < validIntersections.length; i++ ){
            distances = Math.sqrt( Math.pow( this.origin[0] - validIntersections[i][0] , 2) + Math.pow( this.origin[1] - validIntersections[i][1], 2)  + Math.pow(this.origin[2] - validIntersections[i][2] , 2))
            if( distances < min ){
                min = distances
                returnIndex = i  
            }
        }
        //console.log( " valid intersection " , validIntersections[returnIndex])
        // return a tuple with first element true and secon element the intersection 
        // before returning we need to calculate the bouncing ray
        // calculate the angle between plane and ray 
        // calculate normal of the plane 
        //get the plane 
        var plane 
        for( var i = 0; i < 6; i++ ){
            if( validIntersections[returnIndex] == intersections[i]){
                plane = planes[i]
            }
        }
        //console.log(  validIntersections[returnIndex])
         var returnTuple =[]
         returnTuple.push( validIntersections[returnIndex] )
         returnTuple.push(plane)
         return returnTuple
    }
    isSphereIntersect( object){ // returns false or return the intersection point 
        var A = this.origin
        var B = this.parametric
        var C = object.center
        var a = dot( B , B )
        var CA = [ A[0] - C[0] , A[1] - C[1] , A[2] - C[2] ]
        var b = 2 * dot( B , CA  )
        var c = dot( CA , CA) - (object.radius * object.radius )
        var discriminant = b*b - 4 * a * c 
        if (discriminant <= 0 )
            return false
        // find a point further from origin 
        var tempPoint = [ this.origin[0] + this.parametric[0] * 0.1  , this.origin[1] + this.parametric[1] * 0.1 , this.origin[2] + this.parametric[2] * 0.1 ]
        var originToSphere = Math.sqrt( Math.pow( this.origin[0] - object.center[0] , 2 ) + Math.pow(this.origin[1] - object.center[1] , 2 ) + Math.pow(this.origin[2] - object.center[2] , 2))
        var tempPointToSphere = Math.sqrt(  Math.pow( tempPoint[0] - object.center[0] , 2 ) + Math.pow( tempPoint[1] - object.center[1] , 2 ) + Math.pow(tempPoint[2] - object.center[2] , 2) )
        //console.log( "temppoint"  , tempPoint)
        if( tempPointToSphere > originToSphere ){
            return false   // ray is in other direction 
        }
        var t1 = ( - b  - Math.sqrt(discriminant) ) / ( 2 * a )
        var t2 = ( -b + Math.sqrt(discriminant) ) / ( 2 * a )

        var t1point = [ this.origin[0] + this.parametric[0] * t1  , this.origin[1] + this.parametric[1] * t1 , this.origin[2] + this.parametric[2] * t1 ]
        var t2point = [this.origin[0] + this.parametric[0] * t2  , this.origin[1] + this.parametric[1] * t2 , this.origin[2] + this.parametric[2] * t2 ]

        var t1Origin = Math.sqrt( Math.pow( this.origin[0] - t1point , 2 ) + Math.pow(this.origin[1] - t1point , 2 ) + Math.pow(this.origin[2] - t1point , 2))
        var t2Origin = Math.sqrt(  Math.pow( this.origin[0] - t2point , 2 ) + Math.pow(this.origin[1] - t2point , 2 ) + Math.pow(this.origin[2] - t2point , 2) )
        
        var returnList = []
        if (t1Origin > t2Origin ){
            var normalVec = [ t2point[0] - object.center[0] , t2point[1] - object.center[1] , t2point[2] - object.center[2]]
            returnList.push(t2point)
            returnList.push(normalize(normalVec))
            return returnList

        }
        var normalVec = [ t1point[0] - object.center[0] , t1point[1] - object.center[1] , t1point[2] - object.center[2]]
        returnList.push(t1point)
        //normalVec = [ -1 * normalVec[0] , -1 * normalVec[1] , normalVec[2] * -1]
        returnList.push(normalize(normalVec))
        return returnList
        
        
    }
    isConeInterSect( object ){
         var newVertices = []
         // now we will calculate 10 planes for the intersection of rays 
         var planes = []
         var intersections = []
        for( var  i = 0; i < 11 ; i++ ){
            newVertices[i] = vecMatMult( object.points[i] , object.modelview)
        }
        for( var  i = 0; i < 11 ; i++ ){
            //console.log( "newvertices   "   , i ,  " " ,  newVertices[i])
        }
       // console.log( " modelveiw matrix of cone " , object.modelview)
       var validPlanes = []
        for( var i = 0; i < 9; i++ ){ 
            planes[i] = calculatePlane( newVertices[0] , newVertices[i+1]  , newVertices[i+2] )
            console.log( "plane == " ,  planes[i] , " line == " ,  this.origin , this.direction   , newVertices[0] , newVertices[i+1] , newVertices[2])
            intersections[i] =     linePlaneIntersection( planes[i] , this.origin , this.parametric )
            console.log( "calculated intersection === " , intersections[i])
         }
         console.log( "all intersections " , intersections)
         planes[9] = calculatePlane ( newVertices[0] , newVertices[10] , newVertices[1] )
         intersections[9] = linePlaneIntersection( planes[9] , this.origin , this.parametric )
         //console.log( "intersections in cone " , intersections)
         var validIntersections = []
         for (var i = 0 ; i < 9; i++ ){
            if( isPointInTriangle( intersections[i]  , newVertices[0] , newVertices[i+1] , newVertices[i + 2] )){
                validIntersections.push( intersections[i] )
                validPlanes.push(planes[i]);
            }
         }
         if( isPointInTriangle( intersections[9], newVertices[0] , newVertices[10] , newVertices[1])){
             validIntersections.push( intersections[9])
             validPlanes.push(planes[9]);
         }
         if( validIntersections.length == 0 ){
             console.log (" nothing has been pushed" )
            return false 
         }
         
         // find the closest one 
         var distance = 1000000 
         var index = 0
         for( var i = 0; i < validIntersections.length; i++ ){
            if( distance > Math.sqrt( Math.pow(this.origin[0] - validIntersections[0]  , 2) + Math.pow( this.origin[1]  - validIntersections[1] , 2) + Math.pow( this.origin[2]  - validIntersections[2] , 2)  ) ){
                distance = Math.sqrt( Math.pow(this.origin[0] - validIntersections[0]  , 2) + Math.pow( this.origin[1]  - validIntersections[1] , 2) + Math.pow( this.origin[2]  - validIntersections[2] , 2)  )
                index = i
            }
         }
         var returnTuple = []
         var plane = validPlanes[index]
         returnTuple.push(validIntersections[index])
         returnTuple.push(plane)
         console.log( "valid intersection " , validIntersections)
         console.log( "index of cone's plane " , i )
         return returnTuple
    }
    shadowFeeler(intersectionpoint ,  objectList , normal , object  ){
        var lights = []
        for( var i = 0; i < this.lightList.length; i++ ){
            // we need to calculate if light can be seen from that surface 
            var lightVec = [ this.lightList[i].center[0] - intersectionpoint[0][0] , this.lightList[i].center[1] - intersectionpoint[0][1]  ,this.lightList[i].center[2] - intersectionpoint[0][2] , 0  ]
            console.log("this ligthilist " , this.lightList[i].center)
            
            lightVec = normalize( lightVec )
            var lvec = new Ray( intersectionpoint ,  lightVec)
            var lightDistance = Math.sqrt(  Math.pow ( lightVec[0] , 2) + Math.pow(lightVec[1] , 2 )  + Math.pow( lightVec[2] , 2 ) )
            for( var j =0; j <  objectList; j++  ){
                var objectIntersection = lvec.isIntersect( objectList[i] )
                /*if ( objectIntersection[0] == 10000  || object == objectList[i]  ){
                    continue
                }*/
                /*var objectDistance = Math.sqrt(  Math.pow ( objectIntersection[0][0] - intersectionpoint[0] , 2) + Math.pow(objectIntersection[0][1] - intersectionpoint[1] , 2 )  + Math.pow( objectIntersection[0][2] - intersectionpoint[2] , 2 ) )
                if( lightDistance > objectDistance){
                    return [ 0.0 , 0.0 , 0.0 ]
                }*/
            }

            var specularProduct = mult( object.specular , lightlist[i].specular);
            var ambientProduct = mult( object.ambient  ,  lightlist[i].ambient)
            lightVec = normalize(lightVec );
            var eye = [ 0 - intersectionpoint[0][0] , 0 - intersectionpoint[0][1] , 10 - intersectionpoint[0][2] ]  //
            eye = normalize(eye)
            var halfway = normalize(  [ lightVec[0] + eye[0] , lightVec[1] + eye[1] , lightVec[2] + eye[2]  , 0] )
            normal = normalize( [ intersectionpoint[1][0] , intersectionpoint[1][1] , intersectionpoint[1][2] ,  0]);

            var specular =  Math.pow( Math.max(  dot( normal , halfway), 0 ) , object.shininess )
            specular = [  specularProduct[0] * specular ,  specularProduct[1] * specular , specularProduct[2] * specular]
            if( dot( normal , lightVec ) < 0 ){
                specular = [ 0 , 0, 0 ]
            }
            var total = [  specular[0] + ambientProduct[0] , specular[1] + ambientProduct[1] , specular[2] + ambientProduct[2]]
            console.log( "specular" , specular );
            console.log( "eye" , eye );
            console.log( "halfway" , halfway );
            console.log( "nor" , normal );
            console.log( "ambient" , ambientProduct );
            

            lights.push(total)
        }
        var totalColor = vec4(0 , 0, 0, 1 );
        for( var i =0; i < lights.length; i++){
            totalColor[0] = totalColor[0] + lights[i][0]
            totalColor[1] = totalColor[1] + lights[i][1]
            totalColor[2] = totalColor[2] + lights[i][2]
            totalColor[3] = totalColor[3] + lights[i][3]
        }
       totalColor[0] = Math.min( 1.0 , totalColor[0])
       totalColor[1] = Math.min( 1.0 , totalColor[1])
       totalColor[2] = Math.min( 1.0 , totalColor[2])
       totalColor[3] = Math.min( 1.0 , totalColor[3])
        console.log( " totalcolor " , totalColor);
        if( totalColor[0] > 0.5 ){
            console.log( "muzaffer atac" , intersectionpoint , normal , lightVec , dot( normal , lightVec))
        }
        return totalColor

    }
}