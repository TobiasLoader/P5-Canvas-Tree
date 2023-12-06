class Frozen {
	constructor(obj){
		this.obj = obj;
		this.head = false;
		this.frozen = false;
		this.frozenTo = obj;
		this.bfstraversal = [];
	}

	// getters and setters	
	getFrozen(){
		return this.frozen;
	}
	getFrozenTo(){
		return this.frozenTo;
	}
	getFrozenHead(){
		return this.head;
	}
	getFrozenBFS(){
		return this.bfstraversal;
	}
	setFrozen(b){
		this.frozen = b;
	}
	setFrozenTo(obj){
		this.frozenTo = obj;
	}
	setFrozenHead(b){
		this.head = b;
	}
		
	isTreeLeaf(){
		return this.getFrozenHead() || !this.getFrozen();
	}
	
	_computeTraversal(){
		this.bfstraversal = [this.obj];
		var frozenqueue = new Queue();
		for (var o of this.obj.children) frozenqueue.enqueue(o);
		while (!frozenqueue.isEmpty()){
		  const el = frozenqueue.dequeue();
			const elFreezer = el._getFreezer();
		  if (
			  !el.getFrozenHead() &&
			  el.getFrozen() &&
			  el.getFrozenTo().getId()==this.obj.getId()
			) this.bfstraversal.push(el);
		  for (var o of el.children) frozenqueue.enqueue(o);
		}
	}
	
	_freezeChildren(to){
		const relfrozenpos = this.obj.get("relfrozenpos");
		for (var o of this.obj.children){
			const oFreezer = o._getFreezer();
			oFreezer.setFrozen(true);
			oFreezer.setFrozenHead(false);
			oFreezer.setFrozenTo(to);
			const childrelpos = o.get("relpos");
			let absw = relfrozenpos.w*childrelpos.w;
			let absh = relfrozenpos.h*childrelpos.h;
			const childratio = o.get("ratio");
			const toabspos = to.get("abspos");
			if (childratio=='fixed') {
				if (absw*toabspos.w < absh*toabspos.h) absh = absw*toabspos.w/toabspos.h;
				else absw = absh*toabspos.h/toabspos.w;
			}
			o.set("relfrozenpos",()=>({
				x: relfrozenpos.x+childrelpos.x*relfrozenpos.w,
				y: relfrozenpos.y+childrelpos.y*relfrozenpos.h,
				w: absw,
				h: absh,
			}));
			oFreezer._freezeChildren(to);
		}
	}
	
	freeze(){
		if (!this.getFrozen()){
			// if not already frozen
			this.setFrozenHead(true);
			this.setFrozen(true);
			this._freezeChildren(this.obj);
			this.setFrozenTo(this.obj);
			this._computeTraversal();
		} else {
			this.obj.log('already frozen to '+this.getFrozenTo().getId()+' it cannot be refrozen');
			// // if already frozen
			// this.head = true;
			// this.frozen = true;
			// this.freezeChildren(this.obj);
			// // recompute traversal of object previously frozenTo
			// this.frozenTo._getFreezer()._computeTraversal();
			// // set frozenTo to be its object and _computeTraversal
			// this.frozenTo = this.obj;
			// this._computeTraversal();
		}
	}
	
	_unfreezeChildren(){
		for (var obj of this.obj.children){
			this.setFrozenHead(false);
			this.setFrozen(false);
			this.setFrozenTo(obj);
			obj.set("relfrozenpos",() => ({x:0,y:0,w:1,h:1}));
			obj._getFreezer()._unfreezeChildren();
		}
	}
	
	unfreeze(){
		this.setFrozenHead(false);
		this.setFrozen(false);
		this._unfreezeChildren();
	}
}