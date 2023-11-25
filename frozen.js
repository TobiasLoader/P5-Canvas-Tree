class Frozen {
	constructor(obj){
		this.object = obj;
		this.head = false;
		this.frozen = false;
		this.frozenTo = obj;
		this.bfstraversal = [];
	}
	
	isTreeLeaf(){
		return this.head || !this.frozen;
	}
	
	computeTraversal(){
		this.bfstraversal = [this.object];
		var frozenqueue = new Queue();
		for (var obj of this.object.children) frozenqueue.enqueue(obj);
		while (!frozenqueue.isEmpty()){
		  const el = frozenqueue.dequeue();
		  if (
			  !el.freezer.head &&
			  el.freezer.frozen &&
			  el.freezer.frozenTo.id==this.object.id
			) this.bfstraversal.push(el);
		  for (var obj of el.children) frozenqueue.enqueue(obj);
		}
	}
	
	freezeChildren(to){
		for (var obj of this.object.children){
			obj.freezer.head = false;
			obj.freezer.frozen = true;
			obj.freezer.frozenTo = to;
			obj.freezer.freezeChildren(to);
		}
	}
	
	freeze(){
		if (!this.frozen){
			// if not already frozen
			this.head = true;
			this.frozen = true;
			this.freezeChildren(this.object);
			this.frozenTo = this.object;
			this.computeTraversal();
		} else {
			// if already frozen
			this.head = true;
			this.frozen = true;
			this.freezeChildren(this.object);
			// recompute traversal of object previously frozenTo
			this.frozenTo.freezer.computeTraversal();
			// set frozenTo to be its object and computeTraversal
			this.frozenTo = this.object;
			this.computeTraversal();
		}
	}
	
	unfreezeChildren(){
		for (var obj of this.object.children){
			obj.freezer.head = false;
			obj.freezer.frozen = false;
			obj.freezer.frozenTo = obj;
			obj.freezer.unfreezeChildren();
		}
	}
	
	unfreeze(){
		this.head = false;
		this.frozen = false;
		this.unfreezeChildren();
	}
}