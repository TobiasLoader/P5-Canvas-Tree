class GraphicsImg {
  constructor(){
    this.object = null;
    this.built = false;
    this.building = false;
    this.graphics = null;
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
    this.building = true;
  }
  
  endbuild(){
    this.built = true;
    this.building = false;
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
  
  draw(){
    if (this.isbuilt()) image(this.graphics,this.x,this.y);
  }
}

class Obj {
  constructor(rw,rh){
    this.id = "";
    this.parent = null;
    this.children = [];
    this.properties = {};
    this.listners = {};
    this.frozen = false;
    this.img = new GraphicsImg();
    this.rdim = {w:1,h:1};
    if (rw!=null) this.rdim.w = rw;
    if (rh!=null) this.rdim.h = rh;
  }
  setId(id){
    this.id = id;
  }
  getId(id){
    return this.id;
  }
  setParent(parent){
    this.parent = parent;
  }
  getParent(){
    return this.parent;
  }
  addProperty(name,value){
    // for adding a new property
    if (!(name in this.properties)) {
      this.listners[name] = new Set();
      this.properties[name] = value;
    }
  }
  setProperty(name,value){
    // for writing to an existing property
    if (name in this.properties) {
      this.properties[name] = value;
      const rebuildlist = this.listners[name];
      for (var obj of rebuildlist){
        obj.rebuild();
      }
    } else {
      if (name == '_iter') this.parent.setProperty('_iter',value);
      else console.log("Illegal setting")
    }
  }
  getProperty(fromobj,name){
    // if property can't be found search parents properties
    // properties are inherited
    if (name in this.properties) {
      this.listners[name].add(fromobj);
      return this.properties[name];
    }
    return this.parent.getProperty(fromobj,name);
  }
  get(name){
    return this.getProperty(this,name);
  }
  addChild(obj){
    obj.setParent(this);
    obj.setId(this.id+'-'+(this.children.length).toString());
    obj.setupWrapper();
    this.children.push(obj);
  }
  addChildren(objs){
    for (var obj of objs){
      this.addChild(obj);
    }
  }
  build(){
    console.log("Build the Object",this.id)
  }
  buildWrapper(){
    this.img.startbuild();
    this.build();
    this.img.endbuild();
  }
  rebuild(){
    console.log("Rebuild",this.id)
    this.buildWrapper();
  }
  freeze(){
    this.frozen = true;
    //this.img
  }
  unfreeze(){
    this.frozen = false;
    // this.build(canvas);
  }
  setup(){
    const parentdim = this.getProperty(this,'dim');
    const dim = {w:this.rdim.w*parentdim.w,h:this.rdim.h*parentdim.h};
    console.log(this.id);
    this.addProperty('dim',dim);
    this.img.setup(this,0,0);
  }
  setupWrapper(){
    this.setup();
    this.postSetup();
  }
  postSetup(){
    console.log('post setup')
  }
  draw(){
    console.log("Draw Object to Canvas",this.id);
    this.img.draw();
  }
}

class Base extends Obj {
  constructor(){
    super();
    this.setId('#');
    this.setParent(null);
  }
  
  getProperty(fromobj,name){
    if (name in this.properties) {
      this.listners[name].add(fromobj);
      return this.properties[name];
    }
    return null;
  }

  getObjectById(id){
    // id is of the type: #-0-0-0-0-0...
    const fullpath = id.split('-')
    if (fullpath.length==0 || fullpath[0]!='#') return {'found':false,'reason':'id of the wrong type','object':null}
    fullpath.shift();
    const path = fullpath.map(Number);
    var o = this;
    for (var p of path){
      const next = o.children[p];
      if (next!=undefined) o = next;
      else return {'found':false,'reason':'not found in object tree'};
    }
    return {'found':true,'object':o};
  }
  
  applySearch(id,callbackSuccess,callbackFailure){
    const search = this.getObjectById(id);
    if (search.found){
      callbackSuccess(id,search.object);
    } else {
      callbackFailure(id);
    }
  }
  
  defaultSearch(id,callbackSuccess){
    this.applySearch(id,callbackSuccess,(id)=>{});
  }
}

class P5Base extends Base {
  constructor(w,h){
    super();
    this.addProperty('dim',{w:w,h:h});
    this.addProperty('_iter',0);
    this._W = w;
    this._H = h;
    this.traversal = [];
  }
  
  computedraworder(){
    this.traversal = [];
    var drawqueue = new Queue();
    for (var obj of this.children){
      drawqueue.enqueue(obj);
    }
    while (!drawqueue.isEmpty()){
      const el = drawqueue.dequeue();
      this.traversal.push(el);
      for (var obj of el.children){
        if (!obj.frozen) drawqueue.enqueue(obj);
      }
    }
  }
  
  setup(){
    createCanvas(this._W, this._H);
    super.setup();
  }
  
  postSetup(){
    this.computedraworder();
  }
  
  buildWrapper(){
    super.buildWrapper();
    // then build on traversal
    console.log('builllld',this.traversal.length)
    for (var el of this.traversal){
      el.buildWrapper();
    }
    // this.img.background(0,0,0);
  }
  
  init(){
    this.setupWrapper();
    this.buildWrapper();
  }
  
  draw(){
    super.draw();
    for (var el of this.traversal){
      el.draw();
    }
  }
}