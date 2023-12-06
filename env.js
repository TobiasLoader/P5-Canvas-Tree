class Env {
	constructor(obj,x,y,w,h,ratio){
		this.obj = obj;
		this.properties = {};
		this.pointers = {};
		this.listners = {};
		this.defaults = {
			relpos:{
				x:x,
				y:y,
				w:w,
				h:h
			},
			ratio:ratio,
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
			}
		};
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
			// this.obj.log("--- Setting a default property",this.obj.getId(),name)
			this.defaults[name] = update(this.defaults[name]);
			// don't rebuild if default set
		} else if (name in this.properties) {
			const oldValue = JSON.stringify(this.properties[name])
			const newValue = update(this.properties[name]);
			if (oldValue !== JSON.stringify(newValue)){
				this.properties[name] = newValue;
				const rebuildlist = this.listners[name];
				const uniquerebuilds = new Set();
				for (var obj of rebuildlist){
					uniquerebuilds.add(obj.getFrozenTo());
				}
				for (var obj of uniquerebuilds){
					await obj._rebuild();
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
		if (propertyInObject!=null && (!idmatch || id==this.obj.getId())) {
			return propertyInObject;
		}
		if (this.obj.parent!=null){
			return this.obj.parent._getEnv().getProperty(fromobj,name,{idmatch:idmatch,id:id});
		}
		return null;
	}
	
	get(name){
		return this.getProperty(this.obj,name,{});
	}
	
	pointer(name){
		if (name in this.properties) return {property:name,id:this.obj.getId()}
		this.obj.log("property "+name+" doesn't exist");
		return null;
	}
	addPointer(local,pointerObj){
		if (pointerObj!=null){
			let name = pointerObj.property;
			let id = pointerObj.id;
			if (!(local in this.pointers)) this.pointers[local] = pointerObj;
			else this.obj.log("pointer "+local+" already exists");
		}
	}
	getPointer(local){
		if (local in this.pointers) {
			return this.getProperty(this.obj,this.pointers[local].property,{
				idmatch:true,
				id:this.pointers[local].id
			});
		}
		return null;
	}
}