class GraphicsImg {
  constructor(){
		this.object = null;
		this.built = false;
		this.building = false;
		this.graphics = null;
		this.bitmap = null;
		this.pos = {x:0,y:0,w:100,h:100};
		this.relfrozen = {x:0,y:0,w:1,h:1};
  }
  // 
  // updatex(x){
	// 	this.pos.x = x;
  // }
  // updatey(y){
	// 	this.pos.y = y;
  // }
  // update(x,y){
	// 	if (x!=null) this.updatex(x);
	// 	if (y!=null) this.updatey(y);
  // }
	
	x(x){
		return (x*this.relfrozen.w+this.relfrozen.x)*this.pos.w;
	}
	y(y){
		return (y*this.relfrozen.h+this.relfrozen.y)*this.pos.h;
	}
  
  startbuild(){
		this.graphics.clear();
		this.built = false;
		this.building = true;
  }
	
	updatebuildcontext(relfrozen){
		this.relfrozen = relfrozen;
	}
  
  async endbuild(){
		this.built = true;
		this.building = false;
		this.bitmap = await createImageBitmap(this.graphics.elt);
  }
  
  isbuilt() {
		return this.built;
  }
		
	withinImg(X,Y){
		return (X>this.pos.x && mouseX<this.pos.x+this.pos.w && Y>this.pos.y && Y<this.pos.y+this.pos.h);
	}
  
  background(r,g,b){
		if (this.building) this.graphics.background(r,g,b);
  }
  text(txt,x,y){
		if (this.building) this.graphics.text(txt,this.x(x),this.y(y));
  }
  vertex(x,y){
		if (this.building) this.graphics.vertex(this.x(x),this.y(y));
  }
  point(x,y){
		if (this.building) this.graphics.point(this.x(x),this.y(y));
  }
	textAlign(mode){
		if (this.building) this.graphics.textAlign(mode);
	}
	
  fill(r,g,b){ this.graphics.fill(r,g,b); }
  strokeWeight(n){ this.graphics.strokeWeight(n); }
  beginShape(){ this.graphics.beginShape(); }
  endShape(param){ this.graphics.endShape(param); }
  textFont(name,size){ this.graphics.textFont(name,size); }
  
  get(object, name){
		return object.getProperty(object,name);
  }
  
  setup(object){
		this.object = object;
		// this.pos = this.get(object,'pos')
		// console.log(object.id,this.pos)
		this.pos = this.get(object,'abspos');
		if (this.pos != null) this.graphics = createGraphics(this.pos.w,this.pos.h);
  }
  
  draw(ctx){
		// if (this.isbuilt()) image(this.graphics,this.x,this.y);
		if (this.isbuilt()) ctx.drawImage(
			this.bitmap,
			this.pos.x,
			this.pos.y,
			this.pos.w,
			this.pos.h
		);
  }
}