class Obj {
  constructor({x=0,y=0,w=1,h=1}={}){
    this.id = "";
    this.parent = null;
    this.children = [];
    this.properties = {};
    this.listners = {};
    this.freezer = new Frozen(this);
    this.img = new GraphicsImg();
    this.defaults = {
      'relpos':{
        x:x,
        y:y,
        w:w,
        h:h
      },
			'abspos':{
				x:0,
				y:0,
				w:0,
				h:0
			}
    }
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
    if (!(name in this.properties) && !(name in this.defaults)) {
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
    } else if (name in this.defaults){
      console.log("---- Setting a default property",this.id,name)
    } else {
      console.log("Illegal setting")
    }
  }
	getPropertyBase(fromobj,name){
		// if property can't be found search parents properties
		// properties are inherited
		if (name in this.defaults) {
			return this.defaults[name];
		}
		if (name in this.properties) {
			this.listners[name].add(fromobj);
			return this.properties[name];
		}
		return null;
	}
  getProperty(fromobj,name){
		const propertyInObject = this.getPropertyBase(fromobj,name);
		if (propertyInObject!=null) return propertyInObject;
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
	getFreezer(){
		return this.freezer;
	}
  build(img){
    console.log("Build the Object",this.id)
  }
  async buildWrapper(){
    this.img.startbuild();
    if (this.getFreezer().frozen){
      for (var obj of this.getFreezer().bfstraversal){
        obj.build(this.img);
      }
    } else {
      this.build(this.img);
    }
    await this.img.endbuild();
  }
  async rebuild(){
    console.log("Rebuild",this.id)
    await this.buildWrapper();
    this.redrawBubble();
  }
  // freezeTo(el){
  //   // this.frozen = true;
  //   this.buildOn = el;
  //   for (var obj of this.children){
  //     obj.freezeTo(el);
  //   }
  // }
  freeze(){
    this.getFreezer().freeze();
    // this.freezeTo(this);
    // this.frozen = false;
  }
  unfreeze(){
    this.getFreezer().unfreeze();
    // this.frozen = false;
    // this.build(canvas);
  }
  // isFrozen(){
  //   return this.frozen;
  // }
  preSetup(){
		// console.log(this);
    // const parentpos = this.getProperty(this,'pos');
    // const pos = {
    //   w:this.defaults.w*parentpos.w,
    //   h:this.rdim.h*parentpos.h};
    // this.addProperty('dim',dim);
    if (this.getParent()==null) this.img.setup(this);
		else {
			const parentpos = this.getParent().get('abspos');
			const relpos = this.get('relpos');
			const abspos = {
				x: parentpos.x+relpos.x*parentpos.w,
				y: parentpos.y+relpos.y*parentpos.h,
				w: relpos.w*parentpos.w,
				h: relpos.h*parentpos.w,
			}
			this.defaults['abspos'] = abspos;
			this.img.setup(this);
		}
  }
  setup(){}
  postSetup(){
    this.getFreezer().computeTraversal();
  }
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
  constructor(pos){
    super(pos);
    this.setId('#');
    this.setParent(null);
  }
  
  getProperty(fromobj,name){
    return this.getPropertyBase(fromobj,name);
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
  constructor(W,H){
    super({x:0,y:0,w:1,h:1});
    this.defaults['abspos'] = {x:0,y:0,w:W,h:H};
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
		const abspos = this.get('abspos');
    createCanvas(abspos.w, abspos.h);
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
      if (el.freezer.isTreeLeaf()) await el.buildWrapper();
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
          if (el.freezer.isTreeLeaf()) el.draw(this._context);
        }
        this._redrawBubble = false;
      }
      this.effects();
    }
  }
}