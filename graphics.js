function canBuildWrapper(func) {
	return function(...args) {
		if (this.canBuild(args)) return func.apply(this, args);
	};
}

class GraphicsImg {
  constructor(ratio){
		this.obj = null;
		this.built = false;
		this.building = false;
		this.graphics = null;
		this.bitmap = null;
		this.pos = {x:0,y:0,w:100,h:100};
		this.relfrozen = {x:0,y:0,w:1,h:1};
		this.ratio = ratio;
		// building functions
		this.background = canBuildWrapper(this.background);
		this.text = canBuildWrapper(this.text);
		this.vertex = canBuildWrapper(this.vertex);
		this.point = canBuildWrapper(this.point);
		this.highlight = canBuildWrapper(this.highlight);
  }
	
	x(x){
		return (x*this.relfrozen.w+this.relfrozen.x)*this.pos.w;
	}
	y(y){
		return (y*this.relfrozen.h+this.relfrozen.y)*this.pos.h;
	}
	w(){
		if (this.ratio=='fixed') {
			return min(this.pos.w*this.relfrozen.w,this.pos.h*this.relfrozen.h);
		} else return this.pos.w*this.relfrozen.w;
	}
	h(){
		if (this.ratio=='fixed') {
			return min(this.pos.w*this.relfrozen.w,this.pos.h*this.relfrozen.h);
		} else return this.pos.h*this.relfrozen.h;
	}
  
  startbuild(){
		this.graphics.clear();
		this.built = false;
		this.building = true;
  }
	
	updatebuildcontext(ratio,relfrozen){
		this.ratio = ratio;
		this.relfrozen = relfrozen;
	}
  
  async endbuild(){
		this.built = true;
		this.building = false;
		this.bitmap = await createImageBitmap(this.graphics.elt);
  }
  
	
  isBuilt() {
		return this.built;
  }
	canBuild(args){
		if (!this.building) return false;
		for (let i = 0; i < args.length; i+=1) {
			if (args[i] === null) return false;
		}
		return true;
	}

	withinImg(X,Y){
		return (X>this.pos.x && mouseX<this.pos.x+this.pos.w && Y>this.pos.y && Y<this.pos.y+this.pos.h);
	}
  
	// building functions
	background(r,g,b){
		this.background(r, g, b, 1);
	}
  background(r,g,b,a){
		// this.graphics.background(r,g,b);
		this.graphics.noStroke();
		this.graphics.fill(r,g,b,a);
		this.graphics.rect(this.x(0),this.y(0),this.w(),this.h());
  }
  text(txt,x,y){
		this.graphics.text(txt,this.x(x),this.y(y));
  }
  vertex(x,y){
		this.graphics.vertex(this.x(x),this.y(y));
  }
  point(x,y){
		this.graphics.point(this.x(x),this.y(y));
  }
	highlight(){
		this.graphics.strokeWeight(10);
		this.graphics.stroke(255,255,0);
		this.graphics.strokeCap(PROJECT);
		this.graphics.noFill();
		this.graphics.beginShape(QUADS);
		this.graphics.vertex(this.x(0)+5,this.y(0)+5);
		this.graphics.vertex(this.x(0)-5+this.w(),this.y(0)+5);
		this.graphics.vertex(this.x(0)-5+this.w(),this.y(0)-5+this.h());
		this.graphics.vertex(this.x(0)+5,this.y(0)-5+this.h());
		this.graphics.endShape();
	}

	// non-building functions
	textAlign(mode){ this.graphics.textAlign(mode); }
  fill(r,g,b){ this.graphics.fill(r,g,b); }
	noStroke(){ this.graphics.noStroke(); }
	stroke(r,g,b){ this.graphics.stroke(r,g,b); }
  strokeWeight(n){ this.graphics.strokeWeight(n); }
  beginShape(){ this.graphics.beginShape(); }
  endShape(param){ this.graphics.endShape(param); }
  textFont(name,size){ this.graphics.textFont(name,size); }
  
  setup(object){
		this.obj = object;
		this.pos = object.get('abspos');
		if (this.pos != null) this.graphics = createGraphics(this.pos.w,this.pos.h);
  }
  
  draw(ctx){
		// if (this.isbuilt()) image(this.graphics,this.x,this.y);
		if (this.isBuilt()) ctx.drawImage(
			this.bitmap,
			this.pos.x,
			this.pos.y,
			this.pos.w,
			this.pos.h
		);
  }
}