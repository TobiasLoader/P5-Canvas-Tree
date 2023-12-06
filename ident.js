class Ident {
	constructor(obj){
		this.obj = obj;
		this.treeid = null;
		this.nameid = null;
		this.classes = [];
		this._cache = {};
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
		if (id.length>0 && id[0]=='#') id = id.slice(1);
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
	
	_updateCache(query,found,object,err){
		// if (!(query in this._cache))
		this._cache[query] = {
			'found':found,
			'object':object,
			'err':err
		};
	}
	_retrieveCache(query){
		if (query in this._cache){
			return {'cached':true,'result':this._cache[query]};
		} else {
			return {'cached':false,'result':null};
		}
	}
	clearCache(){
		this._cache = {};
	}
	
	// searches current subtree for treeid
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
		if (path.length==0) return {'found':true,'object':this.obj,'err':null}
		var o = this.obj;
		for (var p of path){
			const next = o.children[p];
			if (next!=undefined) o = next;
			else return {'found':false,'object':null,'err':'not found in object tree'};
		}
		return {'found':true,'object':o,'err':null};
	}
	
	// searches *entire* object tree for nameid
	_searchForNameId(nameid){
		// if found nameid then return
		if (this.getNameId()==nameid) return {'found':true,'object':this.obj,'err':null};
		// else check if root
		if (this.getTreeId()=='@'){
			if (nameid in this.obj._getInternal("iddict")) {
				const treeid = this.obj._getInternal("iddict")[nameid];
				return this._searchForTreeId(treeid);
			} else return {'found':false,'object':null,'err':'does not exist'};
		} else return this.obj.getParent()._getIdent()._searchForNameId(nameid);
	}
	
	// searches current subtree for classname
	_searchForClassNameAcc(classname,acc){
		var currentacc = acc;
		const childrenidents = this.obj.children.map(o => o._getIdent());
		for (var i of childrenidents){
			acc = i._searchForClassNameAcc(classname,acc);
		}
		if (this.hasClass(classname)) return [...acc, this.obj];
		else return acc;
	}
	_searchForClassName(classname){
		const results = this._searchForClassNameAcc(classname,[]);
		// if found nameid then return
		if (results.length>0) return {'found':true,'object':results,'err':null};
		else return {'found':false,'object':this.obj,'err':'no objects with class'};
	}
	
	// search function
	search(query, success, failure){
		const readcache = this._retrieveCache(query);
		if (readcache.cached){
			if (readcache.result.found) success(readcache.result.object,query);
			else failure(readcache.result.err,query);
		} else {
			if (query.length==0) {
				failure('query string had length 0',query);
			} else {
				if (query[0]=='@') {
					const s = this._searchForTreeId(query);
					this._updateCache(query,s.found,s.object,s.err);
					if (s.found) success(s.object,query);
					else failure('query id "'+query+'" '+s.err,query);
				} else if (query[0]=='#') {
					const s = this._searchForNameId(query);
					this._updateCache(query,s.found,s.object,s.err);
					if (s.found) success(s.object,query);
					else failure('query id "'+query+'" '+s.err,query);
				} else if (query[0]=='.') {
					const s = this._searchForClassName(query);
					if (s.found) {
						for (var o of s.object) success(o,query);
					} else failure('query class "'+query+'" '+s.err,query);
				}
				else {
					failure("query not of the correct format",query)
				}
			}
		}
	}
}