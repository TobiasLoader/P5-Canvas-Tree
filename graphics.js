class GraphicsImg {
  constructor(){
	this.object = null;
	this.built = false;
	this.building = false;
	this.graphics = null;
	this.bitmap = null;
	this.dim = {w:0,h:0};
	this.x = 0;
	this.y = 0;
  }
  
  updatex(x){
	this.x = x;
  }
  updatey(y){
	this.y = y;
  }
  update(x,y){
	if (x!=null) this.updatex(x);
	if (y!=null) this.updatey(y);
  }
  
  startbuild(){
	this.graphics.clear();
	this.built = false;
  }
  
  resumebuild(){
	this.building = true;
  }
  
  async endbuild(){
	this.built = true;
	this.building = false;
	console.log(this.graphics)
	this.bitmap = await createImageBitmap(this.graphics.elt);
  }
  
  isbuilt() {
	return this.built;
  }
  
  background(r,g,b){
	if (this.building) this.graphics.background(r,g,b);
  }
  text(txt,x,y){
	if (this.building) this.graphics.text(txt,x*this.dim.w,y*this.dim.h);
  }
  vertex(x,y){
	if (this.building) this.graphics.vertex(x*this.dim.w,y*this.dim.h);
  }
  point(x,y){
	if (this.building) this.graphics.point(x*this.dim.w,y*this.dim.h);
  }
	
  fill(r,g,b){ this.graphics.fill(r,g,b); }
  strokeWeight(n){ this.graphics.strokeWeight(n); }
  beginShape(){ this.graphics.beginShape(); }
  endShape(param){ this.graphics.endShape(param); }
  textFont(name,size){ this.graphics.textFont(name,size); }
  
  get(object, name){
	return object.getProperty(object,name);
  }
  
  setup(object,x,y){
	this.object = object;
	this.dim = this.get(object,'dim')
	this.x = x;
	this.y = y;
	if (this.dim != null) {
	  this.graphics = createGraphics(this.dim.w,this.dim.h);
	  this.endbuild();
	}
  }
  
  draw(ctx){
	// if (this.isbuilt()) image(this.graphics,this.x,this.y);
	if (this.isbuilt()) ctx.drawImage(this.bitmap,this.x,this.y,this.dim.w,this.dim.h);
  }
}