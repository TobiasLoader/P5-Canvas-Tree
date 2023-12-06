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
			this.obj._idBubble(nameid,this.obj.getId());
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
		const regex = /^[a-zA-Z0-9-_]+$/;
		if (regex.test(className)) this.classes.push('.'+className);
		else this.log('addClass "'+iclassNamed+'" is not a valid class name')
	}
	removeClass(className){
		this.classes = this.classes.filter((c) => c!=className);
	}
	
	hasClass(className){
		return this.classes.includes(className);
	}
	
	_searchForTreeId(id){
		// treeid is of the type: @-0-0-0-0-0...
		const regex = /^[0-9-@]+$/;
		if (!regex.test(id)) return {
			'found':false,
			'object':null,
			'err':'not in a tree id format (@-0-0...)'
		}
		const prefix = id.substring(0,this.getTreeId().length);
		if (this.getTreeId()!=prefix) return {
			'found':false,
			'object':null,
			'err':'not in subtree of object "'+this.getTreeId()+'"'
		}
		const truncated = id.substring(this.getTreeId().length);
		const path = truncated.split('-').map(Number);
		path.shift(); // get rid of initial element (from empty string preceding truncated)
		if (path.length==0) return {'found':true,'obj':this.obj}
		var o = this.obj;
		for (var p of path){
			const next = o.children[p];
			if (next!=undefined) o = next;
			else return {'found':false,'object':null,'err':'not found in object tree'};
		}
		return {'found':true,'obj':o};
	}
	
	search(query, success, failure){
		if (query.length==0) {
			failure('query string had length 0',query);
		} else {
			if (query[0]=='@') {
				const s = this._searchForTreeId(query);
				if (s.found) success(s.obj,query);
				else failure('query id "'+query+'" '+s.err,query);
			} else if (query[0]=='#') failure("#",query);
			else if (query[0]=='.') failure(".",query);
			else {
				failure("query not of the correct format",query)
			}
		}
	}
}