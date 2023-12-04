class Frozen {
	constructor(obj){
		this.obj = obj;
		this.head = false;
		this.frozen = false;
		this.frozenTo = obj;
		this.bfstraversal = [];
	}
	
	isTreeLeaf(){
		return this.head || !this.frozen;
	}
	
	computeTraversal(){
		this.bfstraversal = [this.obj];
		var frozenqueue = new Queue();
		for (var o of this.obj.children) frozenqueue.enqueue(o);
		while (!frozenqueue.isEmpty()){
		  const el = frozenqueue.dequeue();
		  if (
			  !el.getFreezer().head &&
			  el.getFreezer().frozen &&
			  el.getFreezer().frozenTo.getId()==this.obj.getId()
			) this.bfstraversal.push(el);
		  for (var o of el.children) frozenqueue.enqueue(o);
		}
	}
	
	freezeChildren(to){
		const relfrozenpos = this.obj.defaults.relfrozenpos;
		for (var o of this.obj.children){
			o.getFreezer().head = false;
			o.getFreezer().frozen = true;
			o.getFreezer().frozenTo = to;
			const childrelpos = o.defaults.relpos;
			let absw = relfrozenpos.w*childrelpos.w;
			let absh = relfrozenpos.h*childrelpos.h;
			o.defaults.relfrozenpos = {
				x: relfrozenpos.x+childrelpos.x*relfrozenpos.w,
				y: relfrozenpos.y+childrelpos.y*relfrozenpos.h,
				w: absw,
				h: absh,
			}
			o.getFreezer().freezeChildren(to);
		}
	}
	
	freeze(){
		if (!this.frozen){
			// if not already frozen
			this.head = true;
			this.frozen = true;
			this.freezeChildren(this.obj);
			this.frozenTo = this.obj;
			this.computeTraversal();
		} else {
			this.obj.log('already frozen to '+this.frozenTo.getId()+' - cannot refreeze');
			// // if already frozen
			// this.head = true;
			// this.frozen = true;
			// this.freezeChildren(this.obj);
			// // recompute traversal of object previously frozenTo
			// this.frozenTo.getFreezer().computeTraversal();
			// // set frozenTo to be its object and computeTraversal
			// this.frozenTo = this.obj;
			// this.computeTraversal();
		}
	}
	
	unfreezeChildren(){
		for (var obj of this.obj.children){
			obj.getFreezer().head = false;
			obj.getFreezer().frozen = false;
			obj.getFreezer().frozenTo = obj;
			obj.defaults.relfrozenpos = {x:0,y:0,w:1,h:1};
			obj.getFreezer().unfreezeChildren();
		}
	}
	
	unfreeze(){
		this.head = false;
		this.frozen = false;
		this.unfreezeChildren();
	}
}