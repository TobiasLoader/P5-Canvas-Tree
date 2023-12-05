class Ident {
	constructor(obj){
		this.obj = obj;
		this.treeid = null;
		this.nameid = null;
		this.classes = [];
	}
	
	setTreeId(id){
		const regex = /^[a-zA-Z0-9-]+$/;
		if (id.length>0 && id[0]=='@' && (id.length==1 || regex.test(id.substring(1)))) {
			this.treeid = id;
		} else this.obj.log('setTreeId "'+id+'" is not a valid id string')
	}
	getTreeId(){
		return this.treeid;
	}
	
	setNameId(id){
		const regex = /^[a-zA-Z0-9-_]+$/;
		if (regex.test(id)) {
			const nameid = '#'+id;
			this.nameid = nameid;
			this.obj.idBubble(nameid,this.obj.getId());
		}
		else this.log('setId "'+id+'" is not a valid id string')
	}
	nullifyNameId(){
		this.nameid = null;
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