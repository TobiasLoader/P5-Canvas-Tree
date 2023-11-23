class Queue {
  constructor(init){
    this.q = [];
    if (init) this.q = init;
  }
  
  enqueue(v){
    this.q.push(v);
  }
  
  dequeue(v){
    return this.q.shift();
  }
  
  isEmpty(){
    return this.q.length == 0;
  }
  
  peek(){
    return this.q[this.q.length-1];
  }
}