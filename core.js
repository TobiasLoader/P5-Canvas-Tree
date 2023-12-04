class Obj {
  constructor({x=0,y=0,w=1,h=1,ratio='variable'}={}){
    this.ident = new Ident(this);
    this.parent = null;
    this.children = [];
    this.properties = {};
    this.pointers = {};
    this.listners = {};
    this.freezer = new Frozen(this);
    this.img = new GraphicsImg(ratio);
    this.defaults = {
      relpos:{
        x:x,
        y:y,
        w:w,
        h:h
      },
			abspos:{
				x:0,
				y:0,
				w:0,
				h:0
			},
			relfrozenpos:{
				x:0,
				y:0,
				w:1,
				h:1
			},
			ratio:ratio
    };
		this._internal = {
      populated: false,
			insetup: false,
			templog: [],
      debug: false,
		}
  }
	_getInternal(flag){
		if (flag in this._internal) return this._internal[flag];
		return null;
	}
	_setInternal(flag,func){
		if (flag in this._internal) this._internal[flag] = func(this._internal[flag]);
	}
  setTreeId(id){
    const regex = /^[a-zA-Z0-9-]+$/;
    if (id.length>0 && id[0]=='@' && (id.length==1 || regex.test(id.substring(1)))) {
      this.ident.setTreeId(id);
    } else this.log('setTreeId "'+id+'" is not a valid id string')
  }
  setId(id){
    const regex = /^[a-zA-Z0-9-_]+$/;
    if (regex.test(id)) {
      const nameid = '#'+id;
      this.ident.setNameId(nameid);
      this.idBubble(nameid,this.getId());
    }
    else this.log('setId "'+id+'" is not a valid id string')
  }
  getId(){
    return this.ident.getTreeId();
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
			// this.log("--- Setting a default property",this.getId(),name)
			this.defaults[name] = update(this.defaults[name]);
		} else if (name in this.properties) {
			const oldValue = JSON.stringify(this.properties[name])
			const newValue = update(this.properties[name]);
			if (oldValue !== JSON.stringify(newValue)){
				this.properties[name] = newValue;
				const rebuildlist = this.listners[name];
				const uniquerebuilds = new Set();
				for (var obj of rebuildlist){
					uniquerebuilds.add(obj.getFreezer().frozenTo);
				}
				for (var obj of uniquerebuilds){
					await obj.rebuild();
				}
			}
		} else {
			this.log('illegal set of property "'+name+'"');
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
  getProperty(fromobj,name,{idmatch=false,id=""}={}){
		const propertyInObject = this.getPropertyBase(fromobj,name);
		if (propertyInObject!=null && (!idmatch || id==this.getId())) {
      return propertyInObject;
    }
    return this.parent.getProperty(fromobj,name,{idmatch:idmatch,id:id});
  }
  get(name){
    return this.getProperty(this,name,{});
  }
  pointer(name){
    if (name in this.properties) return {property:name,id:this.getId()}
    this.log("property "+name+" doesn't exist");
    return null;
  }
  addPointer(local,pointerObj){
    if (pointerObj!=null){
      let name = pointerObj.property;
      let id = pointerObj.id;
      if (!(local in this.pointers)) this.pointers[local] = pointerObj;
      else this.log("pointer "+local+" already exists");
    }
  }
  getPointer(local){
    if (local in this.pointers) {
      return this.getProperty(this,this.pointers[local].property,{
        idmatch:true,
        id:this.pointers[local].id
      });
    }
    return null;
  }
  addChild(obj){
		if (this._getInternal('populated')==false){
			obj.setParent(this);
			obj.setTreeId(this.getId()+'-'+(this.children.length).toString());
      this.children.push(obj);
		} else {
			this.log('addChild "'+obj.constructor.name+'" on populated element')
		}
  }
  addChildren(objs){
		if (this._getInternal('populated')==false){
      for (var obj of objs) this.addChild(obj);
		} else {
			this.log('addChildren on populated element')
		}
  }
	getFreezer(){
		return this.freezer;
	}
  build(img){
    console.log("Build the Object",this.getId())
  }
  buildHighlight(){
    if (this._getInternal('debug')) this.img.highlight();
  }
  async buildWrapper(){
    this.img.startbuild();
    if (this.getFreezer().frozen){
      for (var obj of this.getFreezer().bfstraversal){
				// console.log(obj.constructor.name,'build context',obj.defaults.relfrozenpos);
				this.img.updatebuildcontext(obj.defaults.ratio,obj.defaults.relfrozenpos);
        obj.build(this.img);
        this.buildHighlight();
      }
    } else {
      this.build(this.img);
      this.buildHighlight();
    }
    await this.img.endbuild();
  }
  async rebuild(){
    console.log("Rebuild",this.getId())
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
  setChildren(){
    return [];
  }
  preSetup(){
		for (var msg of this._getInternal('templog')){
			this.logBubble(this.getId()+': "'+this.constructor.name+'" '+msg);
		}
    if (this.getParent()==null) this.img.setup(this);
		else {
			this.setAbsPos();
			this.img.setup(this);
		}
		this._setInternal('insetup',()=>true)
  }
  setup(){}
  postSetup(){
		this._setInternal('insetup',()=>false);
    if (this.getFreezer().head) this.getFreezer().computeTraversal();
  }
  setupWrapper(){
    this.preSetup();
    this.setup();
    this.postSetup();
  }
  draw(ctx){
    // console.log("Draw Object to Canvas",this.getId());
    this.img.draw(ctx);
  }
  redrawBubble(){
    this.parent.redrawBubble();
  }
	log(msg){
		if (this.parent!=null) this.logBubble(this.getId()+': "'+this.constructor.name+'" '+msg)
		else this._setInternal('templog',(arr)=>{arr.push(msg); return arr})
	}
	logBubble(txt){
		if (this.parent!=null) this.parent.logBubble(txt);
	}
	hover(){
		const hovering = this.img.withinImg(mouseX,mouseY);
		if (hovering) cursor('pointer');
		else cursor('default');
		return hovering;
	}
  debug(){
    if (!this.getFreezer().frozen || this.getFreezer().head) {
      this._setInternal("debug", ()=>true);
    }
    else this.log('cannot debug as in frozen subtree');
  }
  idBubble(nameid,treeid){
    if (this.parent!=null) this.parent.idBubble(nameid,treeid);
  }
}

class Base extends Obj {
  constructor(pos){
    super(pos);
    this.setTreeId('@');
    this.setParent(null);
  }
  
  getProperty(fromobj,name,idmatching={}){
    return this.getPropertyBase(fromobj,name,idmatching);
  }

  getObjectById(id){
    // id is of the type: @-0-0-0-0-0...
    const fullpath = id.split('-')
    if (fullpath.length==0 || fullpath[0]!='@') return {'found':false,'reason':'id of the wrong type','object':null}
    fullpath.shift();
    const path = fullpath.map(Number);
    var o = this;
    for (var p of path){
      const next = o.children[p];
      if (next!=undefined) o = next;
      else return {'found':false,'reason':'not found in object tree'};
    }
    return {'found':true,'obj':o};
  }
  
  applySearch(id,callbackSuccess,callbackFailure){
    const search = this.getObjectById(id);
    if (search.found){
      callbackSuccess(search.obj,id);
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
    this._iddict = {};
  }
  
  redrawBubble(){
    this._redrawBubble = true;
  }
  
  computeTraversal(){
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
	
  preSetup(){
		super.preSetup();
		const abspos = this.get('abspos');
    createCanvas(abspos.w, abspos.h);
    this._context = document.getElementById('defaultCanvas0').getContext('2d');
  }

  async buildWrapper(){
    // build this Canvas img first
    await super.buildWrapper();
    // then build on traversal
    for (var el of this._traversal){
      if (el.getFreezer().isTreeLeaf()) await el.buildWrapper();
    }
  }
  
  populateChildren(){
    var populateQueue = new Queue();
    populateQueue.enqueue(this);
    while (!populateQueue.isEmpty()){
      const populateEl = populateQueue.dequeue();
      if (populateEl._getInternal("populated")==false) {
        populateEl.addChildren(populateEl.setChildren());
        populateEl._setInternal('populated',()=>true);
        for (var c of populateEl.children) {
          populateQueue.enqueue(c);
        }
      } else {
        this.log('Attempted to populate '+populateEl.getId())
      }
    }
  }
  
  async init(W,H){
		const abspos = {x:0,y:0,w:W,h:H};
		this.set('abspos', ()=>abspos);
    this.populateChildren();
    this.computeTraversal();
    this.setupWrapper();
    for (var el of this._traversal){
      el.setupWrapper();
    }
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
	
  log(msg){
    this._logdata.push(this.getId()+': "'+this.constructor.name+'" '+msg);
  }
	logBubble(txt){
		this._logdata.push(txt);
	}
  
  idBubble(nameid,treeid){
    if (!(nameid in this._iddict)) this._iddict[nameid] = treeid;
    else {
      this.applySearch(treeid,(obj)=>{
        obj.log('nameid "'+nameid+'" already exists at "'+this._iddict[nameid]+'"');
      },()=>{
        this.log('treeid "'+treeid+'" does not exist and nameid "'+nameid+'" already does');
      });
    }
  }
	
	readLog(){
    console.log('%c LOG DATA: '+this._logdata.length.toString()+' warnings',"color:rgb(255,255,0);")
    for (var l of this._logdata){
      console.log('%c    ! '+l,"color:rgb(210,188,75);");
    }
	}
}