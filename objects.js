class Div extends Obj {
	constructor(arr,pos){
		super(pos);
		this.addProperty('divchildren', arr);
	}
  setChildren(){
    return this.get('divchildren');
  }
	setup(){
		this.freeze();
    this.debug();
	}
}

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
		img.noStroke();
		img.fill(0,0,0);
    img.textFont('Inconsolata',20);
    img.text(this.get('txt'),this.get('x'),this.get('y'));
  }
}

class BgText extends Text {
	constructor(txt,x,y,pos){
		super(txt,x,y,pos);
	}
	build(img){
		img.background(255,255,255);
		super.build(img);
	}
}

class InheritText extends Obj {
	constructor(txtPoint,xPoint,yPoint,pos){
		super(pos);
    this.addPointer('mytxt',txtPoint);
		this.addPointer('xtxt',xPoint);
		this.addPointer('ytxt',yPoint);
	}
	build(img){
		img.noStroke();
		img.fill(0,0,0);
		// img.textAlign(CENTER);
		img.textFont('Inconsolata',20);
		img.text(this.getPointer('mytxt'),this.getPointer('xtxt'),this.getPointer('ytxt'));
	}
}

class PolygonVertex extends Obj {
  constructor(index,pos){
    super(pos);
    this.addProperty('index', index);
  }
  build(img){
		img.stroke(0,0,0);
    img.strokeWeight(10);
    const vertexcoords = this.get('coords')[this.get('index')];
    img.point(vertexcoords.x,vertexcoords.y);
  }
  setup(){
    this.setId('holdup');
  }
}

class Polygon extends Obj {
  constructor(coords,pos){
    super(pos);
    this.addProperty('coords', coords);
  }

  setChildren(){
    let c = [];
    for (var i=0; i<this.get('coords').length; i+=1) c.push(new PolygonVertex(i));
    return c;
  }
  
  setup(){
    this.freeze();
    this.debug();
  }
  
  build(img){
		img.stroke(0,0,0);
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
  
  setChildren(){
    return [
      new InheritText(this.pointer('txt'),this.pointer('x'),this.pointer('y')),
      new Polygon(this.get('coords'),{x:0.1,y:0.1,w:0.7,h:0.5})
    ];
  }
  
  setup(){
    // this.freeze();
    this.setId('holdup');
  }
  
  build(img){
    img.background(255,0,0,50);
  }
}