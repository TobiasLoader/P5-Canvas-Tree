class Obj {
  constructor({x=0,y=0,w=1,h=1,ratio='variable'}={},children=[]){
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
			custom: children,
			noclick: false
		}
  }
	
	// core Obj
	constructorName(){
		return this.constructor.name;
	}
	setParent(parent){
		this.parent = parent;
	}
	getParent(){
		return this.parent;
	}
	_addChild(obj){
		if (this._getInternal('populated')==false){
			obj.setParent(this);
			obj.setTreeId(this.getId()+'-'+(this.children.length).toString());
			obj.addClass(obj.constructorName());
			this.children.push(obj);
		} else {
			this.log('addChild "'+obj.constructorName()+'" on populated element')
		}
	}
	_addChildren(objs){
		if (this._getInternal('populated')==false){
			for (var obj of objs) this._addChild(obj);
		} else {
			this.log('addChildren on populated element')
		}
	}
	setChildren(){
		return [];
	}
	
	// internals
	_addInternal(flag,val){
		if (!(flag in this._internal)) this._internal[flag] = val;
	}
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
	_idBubble(nameid,treeid){
		if (this.parent!=null) this.parent._idBubble(nameid,treeid);
	}
	addClass(className){
		this._getIdent().addClass(className);
	}
	removeClass(className){
		this._getIdent().removeClass(className);
	}
	hasClass(className){
		return this._getIdent().hasClass(className);
	}
	search(query, success = (obj,query)=>{}, failure = (err,query) => {
		this.log('search failed: '+err);
	}){
		return this._getIdent().search(query,success,failure);
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
	_setAbsPos(){
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
	_preSetup(){
		for (var msg of this._getInternal('templog')){
			this._logBubble(this.getId()+': "'+this.constructorName()+'" '+msg);
		}
		if (this.getParent()==null) this.img.setup(this);
		else {
			this._setAbsPos();
			this.img.setup(this);
		}
		this._setInternal('insetup',()=>true)
	}
	setup(){}
	_postSetup(){
		this._setInternal('insetup',()=>false);
		if (this.getFrozenHead()) this._getFreezer()._computeTraversal();
	}
	_setupWrapper(){
		this._preSetup();
		this.setup();
		this._postSetup();
	}
	
	// build methods
  build(img){
    console.log("Empty Build of the Object",this.getId())
  }
  _buildHighlight(){
    if (this._getInternal('debug')) this.img.highlight();
  }
  async _buildWrapper(){
    this.img.startbuild();
    if (this.getFrozen()){
      for (var obj of this.getFrozenBFS()){
				const objratio = obj.get('ratio');
				const objrelfrozenpos = obj.get('relfrozenpos');
				this.img.updatebuildcontext(objratio,objrelfrozenpos);
        obj.build(this.img);
        this._buildHighlight();
      }
    } else {
      this.build(this.img);
      this._buildHighlight();
    }
    await this.img.endbuild();
  }
  async _rebuild(){
    console.log("Rebuild",this.getId())
    await this._buildWrapper();
    this._redrawBubble();
  }
	  
	// drawing methods
  draw(ctx){
    // console.log("Draw Object to Canvas",this.getId());
    this.img.draw(ctx);
  }
  _redrawBubble(){
    this.parent._redrawBubble();
  }
	
	// logging methods
	log(msg){
		if (this.parent!=null) this._logBubble(this.getId()+': "'+this.constructorName()+'" '+msg)
		else this._setInternal('templog',(arr)=>{arr.push(msg); return arr})
	}
	_logBubble(txt){
		if (this.parent!=null) this.parent._logBubble(txt);
	}
	
	// misc methods
	hover(){
		const hovering = this.img.withinImg(mouseX,mouseY);
		if (hovering) cursor('pointer');
		else cursor('default');
		return hovering;
	}	
	mouseClicked(){
		this._setInternal('noclick',()=>true);
	}
  debug(){
    if (!this.getFrozen() || this.getFrozenHead()) {
      this._setInternal("debug", ()=>true);
    }
    else this.log('cannot be debugged as it is in a frozen subtree');
  }
}

class Base extends Obj {
  constructor(children){
    super({x:0,y:0,w:1,h:1},children);
    this.setTreeId('@');
    this.setParent(null);
		this._addInternal("traversal",[]);
		this._addInternal("_redrawBubble",true);
		this._addInternal("context",null);
		this._addInternal("logdata",[]);
		this._addInternal("iddict",{});
  }
  
  _redrawBubble(){
		this._setInternal("_redrawBubble",()=>true);
  }
  
  _computeTraversal(){
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
	
  _preSetup(){
		super._preSetup();
		const abspos = this.get('abspos');
    createCanvas(abspos.w, abspos.h);
		this._setInternal("context",()=>{
			return document.getElementById('defaultCanvas0').getContext('2d');
		});
  }

  async _buildWrapper(){
    // build this Canvas img first
    await super._buildWrapper();
    // then build on traversal
    for (var el of this._getInternal("traversal")){
      if (el._getFreezer().isTreeLeaf()) await el._buildWrapper();
    }
  }
  
  _populateChildren(){
    var populateQueue = new Queue();
    populateQueue.enqueue(this);
    while (!populateQueue.isEmpty()){
      const populateEl = populateQueue.dequeue();
      if (populateEl._getInternal("populated")==false) {
        populateEl._addChildren(populateEl.setChildren());
				populateEl._addChildren(populateEl._getInternal("custom"));
        populateEl._setInternal("populated",()=>true);
        for (var c of populateEl.children) {
          populateQueue.enqueue(c);
        }
      } else {
        this.log('Attempted to populate '+populateEl.getId())
      }
    }
  }
	
  log(msg){
		this._setInternal('logdata',(ld) => [...ld,
			this.getId()+': "'+this.constructorName()+'" '+msg
		]);
  }
	_logBubble(txt){
		this._setInternal('logdata',(ld)=>[...ld,txt]);
	}
  
  _idBubble(nameid,treeid){
    if (!(nameid in this._getInternal("iddict"))) {
			this._setInternal('iddict',(ids) => ({...ids, [nameid]:treeid}));
    } else {
      this.search(treeid,(obj,query)=>{
        obj.log('nameid "'+nameid+'" already exists at "'+this._getInternal("iddict")[nameid]+'"');
				obj._getIdent().nullifyNameId();
      },(err,query)=>{
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
	
		
	async init(W,H){
		const abspos = {x:0,y:0,w:W,h:H};
		this.set('abspos', ()=>abspos);
		this._populateChildren();
		this._computeTraversal();
		this._setupWrapper();
		for (var el of this._getInternal("traversal")){
			el._setupWrapper();
		}
		await this._buildWrapper();
	}
	
	effects(){
		// things changing dynamically
	}
	
	draw(){
		if (this._getInternal("context")!=null){
			if (this._getInternal("_redrawBubble")) {
				super.draw(this._getInternal("context"));
				for (var el of this._getInternal("traversal")){
					if (el._getFreezer().isTreeLeaf()) {
						el.draw(this._getInternal("context"));
					}
				}
				this._setInternal('_redrawBubble',()=>false);
			}
			this.effects();
		}
	}
	
	mouseClickedPropagate(){
		const objetcsClicked = this._getInternal("traversal").slice().reverse();
		objetcsClicked.push(this);
		for (var el of objetcsClicked){
			if (el.hover()){
				el.mouseClicked();
				if (el._getInternal('noclick')==false) return null;
			}
		}
		return null;
	}
}