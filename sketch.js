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

class Vertex extends Obj {
  constructor(x,y){
    super();
    this.addProperty('x', x);
    this.addProperty('y', y);
  }
  draw(canvas){
    canvas.strokeWeight(10);
    canvas.point(this.getProperty('x'),this.getProperty('y'));
  }
}

class Text extends Obj {
  constructor(txt,x,y){
    super();
    this.addProperty('txt', txt);
    this.addProperty('x', x);
    this.addProperty('y', y);
  }
  draw(canvas){
    canvas.text(this.getProperty('txt'),this.getProperty('x'),this.getProperty('y'));
  }
}


class Polygon extends Obj {
  constructor(coords){
    super();
    this.addProperty('coords', coords);
  }
  
  setup(){
    for (var c of this.getProperty('coords')){
      this.addChild(new Vertex(c.x,c.y));
    }
  }
  
  draw(canvas){
    canvas.strokeWeight(1);
    canvas.beginShape();
    for (let v of this.children) {
      canvas.vertex(v.getProperty('x'), v.getProperty('y'));
    }
    canvas.endShape(CLOSE);
    for (let v of this.children) {
      v.draw(canvas);
    }
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
  
  draw(canvas){
    for (var obj of this.children){
      obj.draw(canvas);
    }
  }
}

class Canvas extends P5Base {
  constructor(w,h){
    super(w,h);
  }
  setup(){
    super.setup();
    
    this.haveSearched = false;
    
    this.addChildren([
      new Polygon([{x:0.2,y:0.4},{x:0.4,y:0.6},{x:0.6,y:0.1}]),
      new Text('Goodbye',0.5,0.45),
      new Text('Hello',0.35,0.2),
      new Text('In 2 seconds something will happen...',0.15,0.7)
    ]);
    
    textFont('Inconsolata',20);
  }
  draw(){
    background(240);
    super.draw(this);
    
    // effect in the draw function - using search inherited from the Base class
    if (millis()>2000 && !this.haveSearched){
      this.haveSearched = true;
      this.defaultSearch('#-0-2',(id,obj)=>{
        obj.setProperty('x',0.25);
        this.defaultSearch('#-3',(id2,obj2)=>{
          obj2.setProperty('txt',"x coord of object with id: ("+id+") moved: 0.3 to 0.25");
        });
      });
    }
  }
}

// p5 setup and draw below + instantiation of the Canvas class

let canvas;
function setup() {
  canvas = new Canvas(800,800);
  canvas.setup();
}

function draw() {
	canvas.draw();
}