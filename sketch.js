class Canvas extends P5Base {
  constructor(w,h){
    super(w,h);
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

  build(img){
    img.background(230,230,230);
  }  

  effects(){
    // effect in the draw function - using search inherited from the Base class
    if (millis()>2000 && millis()<3000){
      this.defaultSearch('#-0',(id,obj)=>{
        obj.set('coords',(coords)=>{
          coords[2].x = 0.25;
          return coords;
        });
        this.defaultSearch('#-3',(id2,obj2)=>{
          obj2.set('txt',() => "x coord of object with id: ("+id+") moved: 0.3 to 0.25");
        });
      });
    }
  }
}

// p5 setup and draw below + instantiation of the Canvas class

let canvas;
async function setup() {
  canvas = new Canvas(800,800);
  await canvas.init();
  console.log(canvas);
}

function draw() {
  canvas.draw();
}