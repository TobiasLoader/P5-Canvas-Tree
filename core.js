class Obj {
  constructor({x=0,y=0,w=1,h=1,ratio='variable'}={}){
    this.ident = new Ident(this);
    this.parent = null;
    this.children = [];
		this.env = new Env(this,x,y,w,h,ratio);
    this.freezer = new Frozen(this);
    this.img = new GraphicsImg(ratio);
		this._internal = {
      populated: false,
			insetup: false,
			templog: [],
      debug: false,
		}
  }
	
	// core Obj
	setParent(parent){
		this.parent = parent;
	}
	getParent(){
		return this.parent;
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
	setChildren(){
		return [];
	}
	
	// internals
	_getInternal(flag){
		if (flag in this._internal) return this._internal[flag];
		return null;
	}
	_setInternal(flag,func){
		if (flag in this._internal) this._internal[flag] = func(this._internal[flag]);
	}
	
	// identifiers
	_getIdent(){
		return this.ident;
	}
  setTreeId(id){
    this._getIdent().setTreeId(id);
  }
  setId(id){
		this._getIdent().setNameId(id);
  }
  getId(){
    return this._getIdent().getTreeId();
  }
	idBubble(nameid,treeid){
		if (this.parent!=null) this.parent.idBubble(nameid,treeid);
	}
	
	// environment
	_getEnv(){
		return this.env;
	}
  addProperty(name,value){
		this._getEnv().addProperty(name,value);
  }
  async set(name,update){
		await this._getEnv().set(name,update);
  }
  get(name){
		return this._getEnv().get(name);
  }
  pointer(name){
		return this._getEnv().pointer(name);
  }
  addPointer(local,pointerObj){
		this._getEnv().addPointer(local,pointerObj);
  }
  getPointer(local){
    return this._getEnv().getPointer(local);
  }
	
	// frozen status
	_getFreezer(){
		return this.freezer;
	}
	freeze(){
		this._getFreezer().freeze();
	}
	unfreeze(){
		this._getFreezer().unfreeze();
	}
	getFrozen(){
		return this._getFreezer().getFrozen();
	}
	getFrozenTo(){
		return this._getFreezer().getFrozenTo();
	}
	getFrozenHead(){
		return this._getFreezer().getFrozenHead();
	}
	getFrozenBFS(){
		return this._getFreezer().getFrozenBFS();
	}
	
	// setup methods
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
		if (this.getFrozenHead()) this._getFreezer().computeTraversal();
	}
	setupWrapper(){
		this.preSetup();
		this.setup();
		this.postSetup();
	}
	
	// build methods
  build(img){
    console.log("Empty Build of the Object",this.getId())
  }
  buildHighlight(){
    if (this._getInternal('debug')) this.img.highlight();
  }
  async buildWrapper(){
    this.img.startbuild();
    if (this.getFrozen()){
      for (var obj of this.getFrozenBFS()){
				const objratio = obj.get('ratio');
				const objrelfrozenpos = obj.get('relfrozenpos');
				this.img.updatebuildcontext(objratio,objrelfrozenpos);
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
	  
	// drawing methods
  draw(ctx){
    // console.log("Draw Object to Canvas",this.getId());
    this.img.draw(ctx);
  }
  redrawBubble(){
    this.parent.redrawBubble();
  }
	
	// logging methods
	log(msg){
		if (this.parent!=null) this.logBubble(this.getId()+': "'+this.constructor.name+'" '+msg)
		else this._setInternal('templog',(arr)=>{arr.push(msg); return arr})
	}
	logBubble(txt){
		if (this.parent!=null) this.parent.logBubble(txt);
	}
	
	// misc methods
	hover(){
		const hovering = this.img.withinImg(mouseX,mouseY);
		if (hovering) cursor('pointer');
		else cursor('default');
		return hovering;
	}
  debug(){
    if (!this.getFrozen() || this.getFrozenHead()) {
      this._setInternal("debug", ()=>true);
    }
    else this.log('cannot be debugged as it is in a frozen subtree');
  }
}

class Base extends Obj {
  constructor(pos){
    super(pos);
    this.setTreeId('@');
    this.setParent(null);
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
    this._internal["traversal"] = [];
    this._internal["redrawBubble"] = true;
    this._internal["context"] = null;
		this._internal["logdata"] = [];
    this._internal["iddict"] = {};
  }
  
  redrawBubble(){
		this._setInternal("redrawBubble",()=>true);
  }
  
  computeTraversal(){
		this._setInternal("traversal",()=>[]);
    var drawqueue = new Queue();
    for (var obj of this.children){
      drawqueue.enqueue(obj);
    }
    while (!drawqueue.isEmpty()){
      const el = drawqueue.dequeue();
			this._setInternal("traversal",(trav)=>[...trav,el]);
      for (var obj of el.children) drawqueue.enqueue(obj);
    }
  }
	
  preSetup(){
		super.preSetup();
		const abspos = this.get('abspos');
    createCanvas(abspos.w, abspos.h);
		this._setInternal("context",()=>{
			return document.getElementById('defaultCanvas0').getContext('2d');
		});
  }

  async buildWrapper(){
    // build this Canvas img first
    await super.buildWrapper();
    // then build on traversal
    for (var el of this._getInternal("traversal")){
      if (el._getFreezer().isTreeLeaf()) await el.buildWrapper();
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
    for (var el of this._getInternal("traversal")){
      el.setupWrapper();
    }
    await this.buildWrapper();
  }
  
  effects(){
    // things changing dynamically
  }
  
  draw(){
    if (this._getInternal("context")!=null){
      if (this._getInternal("redrawBubble")) {
        super.draw(this._getInternal("context"));
        for (var el of this._getInternal("traversal")){
          if (el._getFreezer().isTreeLeaf()) {
						el.draw(this._getInternal("context"));
					}
        }
        this._setInternal('redrawBubble',()=>false);
      }
      this.effects();
    }
  }
	
  log(msg){
		this._setInternal('logdata',(ld) => [...ld,
			this.getId()+': "'+this.constructor.name+'" '+msg
		]);
  }
	logBubble(txt){
		this._setInternal('logdata',(ld)=>[...ld,txt]);
	}
  
  idBubble(nameid,treeid){
    if (!(nameid in this._getInternal("iddict"))) {
			this._setInternal('iddict',(ids) => ({...ids, [nameid]:treeid}));
    } else {
      this.applySearch(treeid,(obj)=>{
        obj.log('nameid "'+nameid+'" already exists at "'+this._getInternal("iddict")[nameid]+'"');
				obj._getIdent().nullifyNameId();
      },()=>{
        this.log('treeid "'+treeid+'" does not exist and nameid "'+nameid+'" already does');
      });
    }
  }
	
	readLog(){
    console.log('%c LOG DATA: '+this._getInternal("logdata").length.toString()+' warnings',"color:rgb(255,255,0);")
    for (var l of this._getInternal("logdata")){
      console.log('%c   '+l,"color:rgb(210,188,75);");
    }
	}
}