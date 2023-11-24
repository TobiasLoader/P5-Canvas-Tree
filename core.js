class Obj {
  constructor(rw,rh){
    this.id = "";
    this.parent = null;
    this.children = [];
    this.properties = {};
    this.listners = {};
    this.buildOn = this;
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
  async set(name,update){
    // for writing to an existing property
    if (name in this.properties) {
      const oldValue = JSON.stringify(this.properties[name])
      const newValue = update(this.properties[name]);
      if (oldValue !== JSON.stringify(newValue)){
        this.properties[name] = newValue;
        const rebuildlist = this.listners[name];
        for (var obj of rebuildlist){
          await obj.rebuild();
        }
      }
    } else {
      console.log("Illegal setting")
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
  build(img){
    console.log("Build the Object",this.id)
  }
  async buildWrapper(){
    if (this.id==this.buildOn.id) this.img.startbuild();
    this.buildOn.img.resumebuild();
    this.build(this.buildOn.img);
    // inefficient we are building new bitmap for every
    // node in subtree of frozen element.
    // --> should only call once when last child element built
    await this.buildOn.img.endbuild();
  }
  async rebuild(){
    console.log("Rebuild",this.id)
    await this.buildWrapper();
    this.redrawBubble();
  }
  freezeTo(el){
    // this.frozen = true;
    this.buildOn = el;
    for (var obj of this.children){
      obj.freezeTo(el);
    }
  }
  freeze(){
    this.freezeTo(this);
    // this.frozen = false;
  }
  unfreeze(){
    // this.frozen = false;
    // this.build(canvas);
  }
  // isFrozen(){
  //   return this.frozen;
  // }
  preSetup(){
    const parentdim = this.getProperty(this,'dim');
    const dim = {w:this.rdim.w*parentdim.w,h:this.rdim.h*parentdim.h};
    this.addProperty('dim',dim);
    this.img.setup(this,0,0);
  }
  setup(){}
  postSetup(){}
  setupWrapper(){
    this.preSetup();
    this.setup();
    this.postSetup();
  }
  draw(ctx){
    console.log("Draw Object to Canvas",this.id);
    this.img.draw(ctx);
  }
  redrawBubble(){
    this.parent.redrawBubble();
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
    this._W = w;
    this._H = h;
    this.traversal = [];
    this._redrawBubble = true;
    this._context = null;
  }
  
  redrawBubble(){
    this._redrawBubble = true;
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
      for (var obj of el.children) drawqueue.enqueue(obj);
    }
  }
  
  setup(){
    createCanvas(this._W, this._H);
    this._context = document.getElementById('defaultCanvas0').getContext('2d');
  }
  
  postSetup(){
    this.computedraworder();
  }
  
  async buildWrapper(){
    // build this Canvas img first
    await super.buildWrapper();
    // then build on traversal
    for (var el of this.traversal){
      await el.buildWrapper();
    }
  }
  
  async init(){
    this.setupWrapper();
    await this.buildWrapper();
  }
  
  effects(){
    // things changing dynamically
  }
  
  draw(){
    if (this._context!=null){
      if (this._redrawBubble) {
        super.draw(this._context);
        for (var el of this.traversal){
          if (el.id==el.buildOn.id) el.draw(this._context);
        }
        this._redrawBubble = false;
      }
      this.effects();
    }
  }
}