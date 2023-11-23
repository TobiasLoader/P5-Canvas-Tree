class Canvas extends P5Base {
  constructor(w,h){
    super(w,h);
  }
  build(){
    this.img.background(230,230,230);
  }
  setup(){
    super.setup();
    this.addProperty('haveSearched', false);
    this.addChildren([
      new Polygon([{x:0.2,y:0.4},{x:0.4,y:0.6},{x:0.6,y:0.1}],0.5,0.5),
      new Text('Goodbye',0.5,0.45),
      new Text('Hello',0.35,0.2),
      new Text('In 2 seconds something will happen...',0.15,0.7)
    ]);
  }
  draw(){
    super.draw(this);
  }
  effect(){
    // effect in the draw function - using search inherited from the Base class
    if (millis()>500 && !this.get('haveSearched')){
      this.setProperty('haveSearched',true)
      this.defaultSearch('#-0',(id,obj)=>{
        // console.log(obj.getProperty('haveSearched'));
        var oldcoords = obj.get('coords');
        oldcoords[2].x = 0.25;
        console.log(oldcoords)
        obj.setProperty('coords',oldcoords);
        console.log(obj)
        this.defaultSearch('#-3',(id2,obj2)=>{
          obj2.setProperty('txt',"x coord of object with id: ("+id+") moved: 0.3 to 0.25");
        });
      });
    }
    this.draw();
  }
}

// p5 setup and draw below + instantiation of the Canvas class

let canvas;
function setup() {
  canvas = new Canvas(800,800);
  canvas.init();
  canvas.draw();
  console.log(canvas);
}

function draw() {
  canvas.effect();
}