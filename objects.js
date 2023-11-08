class Vertex extends Obj {
  constructor(x,y){
    super();
    this.addProperty('x', x);
    this.addProperty('y', y);
  }
  draw(canvas){
    canvas.strokeWeight(10);
    canvas.point(this.getProperty('x'),this.getProperty('y'));
  }
}

class Text extends Obj {
  constructor(txt,x,y){
    super();
    this.addProperty('txt', txt);
    this.addProperty('x', x);
    this.addProperty('y', y);
  }
  draw(canvas){
    canvas.text(this.getProperty('txt'),this.getProperty('x'),this.getProperty('y'));
  }
}


class Polygon extends Obj {
  constructor(coords){
    super();
    this.addProperty('coords', coords);
  }
  
  setup(){
    for (var c of this.getProperty('coords')){
      this.addChild(new Vertex(c.x,c.y));
    }
  }
  
  draw(canvas){
    canvas.strokeWeight(1);
    canvas.beginShape();
    for (let v of this.children) {
      canvas.vertex(v.getProperty('x'), v.getProperty('y'));
    }
    canvas.endShape(CLOSE);
    for (let v of this.children) {
      v.draw(canvas);
    }
  }
}