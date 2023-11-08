class Obj {
  constructor(){
    this.id = "";
    this.parent = "";
    this.children = [];
    this.properties = {};
  }
  setParentId(id){
    this.parent = id;
  }
  getParentId(){
    return this.parent;
  }
  setId(id){
    this.id = id;
  }
  getId(id){
    return this.id;
  }
  addProperty(name,value){
    // for adding a new property
    if (!(name in this.properties)) this.properties[name] = value;
  }
  setProperty(name,value){
    // for writing to an existing property
    if (name in this.properties) this.properties[name] = value;
  }
  getProperty(name,value){
    if (name in this.properties) return this.properties[name];
    return null;
  }
  addChild(obj){
    obj.setParentId(this.id);
    obj.setId(this.id+'-'+(this.children.length).toString());
    this.children.push(obj);
    obj.setup();
  }
  addChildren(objs){
    for (var obj of objs){
      this.addChild(obj);
    }
  }
  setup(){}
  draw(canvas){
    console.log("Draw Object to Canvas");
  }
}

class Base extends Obj {
  constructor(){
    super();
    this.setId('#');
    this.setParentId('#');
  }
  
  setup(){
    console.log(this);
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
  }
  
  setup(){
    super.setup();
    createCanvas(this.getProperty('dim').w, this.getProperty('dim').h);
    // textAlign(CENTER,CENTER)
  }
  
  text(txt,x,y){
    text(txt,x*this.getProperty('dim').w,y*this.getProperty('dim').h);
  }
  
  vertex(x,y){
    vertex(x*this.getProperty('dim').w,y*this.getProperty('dim').h);
  }
  
  point(x,y){
    point(x*this.getProperty('dim').w,y*this.getProperty('dim').h);
  }
  
  strokeWeight(n){ strokeWeight(n); }
  beginShape(){ beginShape(); }
  endShape(param){ endShape(param); }
  textFont(name,size){ textFont(name,size); }
  
  draw(canvas){
    for (var obj of this.children){
      obj.draw(canvas);
    }
  }
}