let captureEnvironment, captureUser;

let environmentConstraint, userConstraint;

let userAxis,environmentAxis;
let debugAxis = false;

let userViewport,environmentViewport;

var debugDensity = 1;

let userPredictions = [];
let environmentPredictions = [];

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);
	
	environmentConstraint = {
		video: {
			facingMode : "environment",
		}
	};
	userConstraint = {
		video: {
			facingMode : "user",
		}
	};
	
	captureEnvironment=createCapture(environmentConstraint);
	captureUser=createCapture(userConstraint);
	
	captureUser.hide();
	captureEnvironment.hide();
	
	userMesh = ml5.facemesh(captureUser,modelReady(false));
	environmentMesh = ml5.facemesh(captureUser,modelReady(false));
	
	userMesh.on("predict",userResults=>{
    	userPredictions = userResults;
  	});
	
	environmentMesh.on("predict",environmentResults=>{
		environmentPredictions = environmentResults;
	});
	
	userAxis = new CentralAxis(0,0,0);
	environmentAxis = new CentralAxis(15,35,0);
	
	userViewport = new Viewport(0,0,0,-30,45,180,78,9/16);
	environmentViewport = new Viewport(15,35,0,-30,45,180,78,9/16);
}


function draw() {
	background(220);
	orbitControl(4,4);
	
	userAxis.render(100,100,100,-30,45,180,0,0,0,debugAxis);
	environmentAxis.render(100,100,100,-30,45,180,255,155,0,debugAxis);
	
	for(var i = 0;i <= 1;i+=1/debugDensity){
		userViewport.render(i*1000,captureUser,1,0,0,0,userPredictions);
		environmentViewport.render(i*1000,captureEnvironment,1,255,155,0,environmentPredictions);
	}
}
	
class CentralAxis {
	constructor(x,y,z){
		this.x = x;
		this.y = y;
		this.z = z;
		
		this.pos = createVector(this.x,this.y,this.z);
	}
	
	render(maxX,maxY,maxZ,rX,rY,rZ,r,g,b,showLine){
		//ideal rotation: -30, 45, 180
		angleMode(DEGREES);
		push();
		
		rotateX(rX);
		rotateY(rY);
		rotateZ(rZ);
		
		if(!showLine){
			strokeWeight(2)
			
			stroke(255,0,0);
			line(this.pos.x,this.pos.y,this.pos.z,this.pos.x+maxX,this.pos.y,this.pos.z);
			stroke(255,155,155);
			line(this.pos.x,this.pos.y,this.pos.z,this.pos.x-maxX,this.pos.y,this.pos.z);
			stroke(0,255,0);
			line(this.pos.x,this.pos.y,this.pos.z,this.pos.x,this.pos.y+maxY,this.pos.z);
			stroke(155,255,155);
			line(this.pos.x,this.pos.y,this.pos.z,this.pos.x,this.pos.y-maxY,this.pos.z);
			stroke(0,0,255);
			line(this.pos.x,this.pos.y,this.pos.z,this.pos.x,this.pos.y,this.pos.z+maxZ);
			stroke(155,155,255);
			line(this.pos.x,this.pos.y,this.pos.z,this.pos.x,this.pos.y,this.pos.z-maxZ);
		}
		
		strokeWeight(10);
		
		stroke(r,g,b);
		point(this.pos);
		
		pop();
	}
}

class Viewport {
	constructor(x,y,z,rX,rY,rZ,hFov,aspect){
		this.x = x;
		this.y = y;
		this.z = z;
		this.rX = rX;
		this.rY = rY;
		this.rZ = rZ;
		
		this.hFov = hFov;
		
		this.aspect = aspect;
	}
	
	render(d,capture,transparency,r,g,b,predictions){
		angleMode(DEGREES);
		push();
		
		rotateX(this.rX);
		rotateY(this.rY);
		rotateZ(this.rZ);
		
		line(this.x,this.y,this.z,this.x+d,this.y+((this.aspect)*(d*tan(this.hFov/2))),this.z+(d*tan(this.hFov/2)));
		line(this.x,this.y,this.z,this.x+d,this.y-((this.aspect)*(d*tan(this.hFov/2))),this.z+(d*tan(this.hFov/2)));
		line(this.x,this.y,this.z,this.x+d,this.y+((this.aspect)*(d*tan(this.hFov/2))),this.z-(d*tan(this.hFov/2)));
		line(this.x,this.y,this.z,this.x+d,this.y-((this.aspect)*(d*tan(this.hFov/2))),this.z-(d*tan(this.hFov/2)));
		
		
		translate(this.x+d,this.y,this.z);
		rotateX(180);
		rotateY(90);
		
		tint(255,255*transparency);
		let graphics = createGraphics(windowWidth,windowHeight);
		graphics.image(drawPoints(capture,predictions),0,0,width,height);
		texture(graphics);
		
		strokeWeight(5);
		stroke(r,g,b);
		plane((d*tan(this.hFov/2))*2,((this.aspect)*(d*tan(this.hFov/2)))*2);
		
		pop();
		
		
	}
}

function drawPoints(video,predictions){
  let videoImage = createImage(video.width,video.height);
  videoImage=video;
  videoImage.loadPixels();
  for(var p = 0;p < predictions.length;p++){
    const keypoints = predictions[p].scaledMesh;
    
    for(var k = 0;k < keypoints.length;k++){
      const [x,y] = keypoints[k];
      videoImage.set(x,y,color(255,0,0,255));
    }
  }
  videoImage.updatePixels();
  return videoImage;
}

function modelReady(debugml5){
  if(debugml5){
    console.log("ml5 Ready");
  }
}
