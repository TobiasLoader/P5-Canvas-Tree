class Vertex extends Obj {
  constructor(x,y,rw,rh){
    super(rw,rh);
    this.addProperty('x', x);
    this.addProperty('y', y);
  }
  build(){
    this.img.strokeWeight(10);
    this.img.point(this.get('x'),this.get('y'));
  }
}

class Text extends Obj {
  constructor(txt,x,y,rw,rh){
    super(rw,rh);
    this.addProperty('txt', txt);
    this.addProperty('x', x);
    this.addProperty('y', y);
  }
  build(){
    this.img.textFont('Inconsolata',20);
    this.img.text(this.get('txt'),this.get('x'),this.get('y'));
  }
}

class PolygonVertex extends Obj {
  constructor(index,rw,rh){
    super(rw,rh);
    this.addProperty('index', index);
  }
  build(){
    this.img.strokeWeight(10);
    this.img.point(this.get('coords')[this.get('index')].x,this.get('coords')[this.get('index')].y);
  }
}

class Polygon extends Obj {
  constructor(coords,rw,rh){
    super(rw,rh);
    this.addProperty('coords', coords);
    // this.freeze();
  }
  
  setup(){
    super.setup();
    for (var i=0; i<this.get('coords').length; i+=1){
      this.addChild(new PolygonVertex(i));
    }
  }
  
  build(){
    this.img.strokeWeight(1);
    this.img.fill(255,255,0);
    this.img.beginShape();
    for (let coord of this.get('coords')) {
      this.img.vertex(coord.x, coord.y);
    }
    this.img.endShape(CLOSE);
  }
}