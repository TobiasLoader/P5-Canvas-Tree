class Vertex extends Obj {
  constructor(x,y,pos){
    super(pos);
    this.addProperty('x', x);
    this.addProperty('y', y);
  }
  build(img){
    img.strokeWeight(10);
    img.point(this.get('x'),this.get('y'));
  }
}

class Text extends Obj {
  constructor(txt,x,y,pos){
    super(pos);
    this.addProperty('txt', txt);
    this.addProperty('x', x);
    this.addProperty('y', y);
  }
  build(img){
    img.textFont('Inconsolata',20);
    img.text(this.get('txt'),this.get('x'),this.get('y'));
  }
}

class PolygonVertex extends Obj {
  constructor(index,pos){
    super(pos);
    this.addProperty('index', index);
  }
  build(img){
    img.strokeWeight(10);
    const vertexcoords = this.get('coords')[this.get('index')];
    img.point(vertexcoords.x,vertexcoords.y);
  }
}

class Polygon extends Obj {
  constructor(coords,pos){
    super(pos);
    this.addProperty('coords', coords);
  }
  
  setup(){
    for (var i=0; i<this.get('coords').length; i+=1){
      this.addChild(new PolygonVertex(i));
    }
    this.freeze();
  }
  
  build(img){
    img.strokeWeight(1);
    img.fill(255,255,0);
    img.beginShape();
    for (let coord of this.get('coords')) {
      img.vertex(coord.x, coord.y);
    }
    img.endShape(CLOSE);
  }
}

class Card extends Obj {
  constructor(txt,coords,x,y,pos){
    super(pos);
    this.addProperty('txt', txt);
    this.addProperty('coords', coords);
    this.addProperty('x', x);
    this.addProperty('y', y);
  }
  
  setup(){
    this.addChild(new Text(this.get('txt'),this.get('x'),this.get('y')));
    this.addChild(new Polygon(this.get('coords')));
    this.freeze();
  }
  
  build(img){
    img.background(255,255,255);
  }
}