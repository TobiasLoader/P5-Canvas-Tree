class GraphicsImg {
  constructor(){
		this.object = null;
		this.built = false;
		this.building = false;
		this.graphics = null;
		this.bitmap = null;
		this.abspos = {x:0,y:0,w:100,h:100};
  }
  // 
  // updatex(x){
	// 	this.abspos.x = x;
  // }
  // updatey(y){
	// 	this.abspos.y = y;
  // }
  // update(x,y){
	// 	if (x!=null) this.updatex(x);
	// 	if (y!=null) this.updatey(y);
  // }
  
  startbuild(){
		this.graphics.clear();
		this.built = false;
		this.building = true;
  }
  
  async endbuild(){
		this.built = true;
		this.building = false;
		this.bitmap = await createImageBitmap(this.graphics.elt);
  }
  
  isbuilt() {
		return this.built;
  }
  
  background(r,g,b){
		if (this.building) this.graphics.background(r,g,b);
  }
  text(txt,x,y){
		if (this.building) this.graphics.text(txt,x*this.abspos.w,y*this.abspos.h);
  }
  vertex(x,y){
		if (this.building) this.graphics.vertex(x*this.abspos.w,y*this.abspos.h);
  }
  point(x,y){
		if (this.building) this.graphics.point(x*this.abspos.w,y*this.abspos.h);
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
		this.abspos = this.get(object,'abspos');
		if (this.abspos != null) this.graphics = createGraphics(this.abspos.w,this.abspos.h);
  }
  
  draw(ctx){
		// if (this.isbuilt()) image(this.graphics,this.x,this.y);
		if (this.isbuilt()) ctx.drawImage(
			this.bitmap,
			this.abspos.x,
			this.abspos.y,
			this.abspos.w,
			this.abspos.h
		);
  }
}