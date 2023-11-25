class Obj {
  constructor({x=0,y=0,w=1,h=1,ratio='variable'}={}){
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
			},
			'ratio':ratio
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
		if (name in this.defaults){
			this.log("--- Setting a default property",this.id,name)
			this.defaults[name] = update(this.defaults[name]);
		} else if (name in this.properties) {
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
	getPropertyBase(fromobj,name){
		// first check defaults
		// then check properties
		// if property can't be found search parents properties
		// => properties are inherited
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
  freeze(){
    this.getFreezer().freeze();
  }
  unfreeze(){
    this.getFreezer().unfreeze();
  }
	setAbsPos(){
		let parentpos = this.getParent().get('abspos');
		let relpos = this.get('relpos');
		let absx = parentpos.x+relpos.x*parentpos.w;
		let absy = parentpos.y+relpos.y*parentpos.h;
		let aspectratio = this.get('ratio');
		let absw = relpos.w*parentpos.w;
		let absh = relpos.h*parentpos.h;
		if (aspectratio=='fixed') {
			absw = min(absw,absh);
			absh = min(absw,absh);
		}
		const abspos = {
			x: absx,
			y: absy,
			w: absw,
			h: absh,
		}
		this.set('abspos',()=>abspos);
	}
  preSetup(){
    if (this.getParent()==null) this.img.setup(this);
		else {
			this.setAbsPos();
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
	log(msg){
		this.logBubble(this.id+": "+msg)
	}
	logBubble(txt){
		if (this.parent!=null) this.parent.logBubble(txt);
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
  constructor(){
    super({x:0,y:0,w:1,h:1});
    this._traversal = [];
    this._redrawBubble = true;
    this._context = null;
		this._logdata = [];
  }
  
  redrawBubble(){
    this._redrawBubble = true;
  }
  
  computedraworder(){
    this._traversal = [];
    var drawqueue = new Queue();
    for (var obj of this.children){
      drawqueue.enqueue(obj);
    }
    while (!drawqueue.isEmpty()){
      const el = drawqueue.dequeue();
      this._traversal.push(el);
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
    for (var el of this._traversal){
      if (el.getFreezer().isTreeLeaf()) await el.buildWrapper();
    }
  }
  
  async init(W,H){
		const abspos = {x:0,y:0,w:W,h:H};
		this.set('abspos', ()=>abspos);
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
        for (var el of this._traversal){
          if (el.freezer.isTreeLeaf()) el.draw(this._context);
        }
        this._redrawBubble = false;
      }
      this.effects();
    }
  }
	
	logBubble(txt){
		this._logdata.push(txt);
	}
	
	readLog(){
		console.log(this._logdata)
	}
}