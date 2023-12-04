class Ident {
	constructor(obj){
		this.obj = obj;
		this.treeid = null;
		this.nameid = null;
		this.classes = [];
	}
	
	setTreeId(id){
		this.treeid = id;
	}
	getTreeId(){
		return this.treeid;
	}
	
	setNameId(idName){
		this.nameid = idName;
	}
	getNameId(){
		return this.nameid;
	}
	
	addClass(className){
		this.classes.push(className);
	}
	removeClass(className){
		this.classes = this.classes.filter((c) => c!=className);
		console.log(this.classes)
	}
	
	hasClass(className){
		return this.classes.includes(className);
	}
}