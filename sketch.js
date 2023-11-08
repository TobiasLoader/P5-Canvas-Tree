class Canvas extends P5Base {
  constructor(w,h){
    super(w,h);
  }
  setup(){
    super.setup();
    
    this.addProperty('haveSearched', false);
    
    this.addChildren([
      new Polygon([{x:0.2,y:0.4},{x:0.4,y:0.6},{x:0.6,y:0.1}]),
      new Text('Goodbye',0.5,0.45),
      new Text('Hello',0.35,0.2),
      new Text('In 2 seconds something will happen...',0.15,0.7)
    ]);
    
    this.textFont('Inconsolata',20);
  }
  draw(){
    background(240);
    super.draw(this);
    
    // effect in the draw function - using search inherited from the Base class
    if (millis()>2000 && !this.getProperty('haveSearched')){
      this.setProperty('haveSearched',true)
      this.defaultSearch('#-0-2',(id,obj)=>{
        obj.setProperty('x',0.25);
        this.defaultSearch('#-3',(id2,obj2)=>{
          obj2.setProperty('txt',"x coord of object with id: ("+id+") moved: 0.3 to 0.25");
        });
      });
    }
  }
}

// p5 setup and draw below + instantiation of the Canvas class

let canvas;
function setup() {
  canvas = new Canvas(800,800);
  canvas.setup();
}

function draw() {
  canvas.draw();
}