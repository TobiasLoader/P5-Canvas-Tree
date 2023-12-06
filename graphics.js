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
		// size and position of the actual bitmap for this img on screen in pix
		this.pos = {x:0,y:0,w:100,h:100};
		// position relative to bitmap for each build context
		//  - changes for each frozen child which is built
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
		return round((x*this.relfrozen.w+this.relfrozen.x)*this.pos.w);
	}
	y(y){
		return round((y*this.relfrozen.h+this.relfrozen.y)*this.pos.h);
	}
	w(){
		if (this.ratio=='fixed') {
			return round(min(this.pos.w*this.relfrozen.w,this.pos.h*this.relfrozen.h));
		} else return round(this.pos.w*this.relfrozen.w);
	}
	h(){
		if (this.ratio=='fixed') {
			return round(min(this.pos.w*this.relfrozen.w,this.pos.h*this.relfrozen.h));
		} else return round(this.pos.h*this.relfrozen.h);
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
		// this.graphics.vertex(5,5);
		// this.graphics.vertex(-5+this.pos.w,5);
		// this.graphics.vertex(-5+this.pos.w,-5+this.pos.h);
		// this.graphics.vertex(+5,-5+this.pos.h);
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
		if (this.pos != null) {
			this.graphics = createGraphics(round(this.pos.w),round(this.pos.h));
		}
  }
  
  draw(ctx){
		// if (this.isbuilt()) image(this.graphics,this.x,this.y);
		if (this.isBuilt()) ctx.drawImage(
			this.bitmap,
			round(this.pos.x),
			round(this.pos.y),
			round(this.pos.w),
			round(this.pos.h)
		);
  }
}