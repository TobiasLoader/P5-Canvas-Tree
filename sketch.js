class Canvas extends P5Base {
  constructor(W,H){
    super(W,H);
  }
  
  setChildren(){
    return [
      new Div([
        new Polygon([{x:0.2,y:0.5},{x:0.4,y:0.8},{x:0.6,y:0.3}],{x:0.05,y:0.1,w:0.5,h:0.4}),
        new Text('Goodbye',0.8,0.45),
        new Text('Hello',0.35,0.2),
        new BgText('Wait 2 seconds...',0.25,0.5,{x:0.05,y:0.55,w:0.7,h:0.2})
      ]),
      new Card('not hovering',[{x:0.2,y:0.7},{x:0.7,y:0.6},{x:0.6,y:0.2}],0.25,0.8,{
        x:0.3,y:0.3,w:0.3,h:0.3,ratio:'fixed'
      })
    ];
  }
  
  setup(){	
    // this.freeze();
  }

  build(img){
    img.background(230,230,230);
  }  

  effects(){
    // effect in the draw function - using search inherited from the Base class
    if (millis()>2000 && millis()<3000){
      this.defaultSearch('@-0-0',(obj,id)=>{
        obj.set('coords',(coords)=>{
          coords[2].x = 0.25;
          return coords;
        });
        this.defaultSearch('@-0-3',(obj2,id2)=>{
          obj2.set('txt',() => "x coord of object with id: ("+id+") moved: 0.3 to 0.25");
        });
      });
    }
		this.defaultSearch('@-1',(obj,id)=>{
			if (obj.hover()){
				obj.set('txt',() => "hovering");
			} else {
				obj.set('txt',() => "not hovering");
			}
		});
  }
}

// p5 setup and draw below + instantiation of the Canvas class

let canvas;
async function setup() {
  canvas = new Canvas();
  await canvas.init(innerWidth,innerHeight);
  console.log(canvas);
	canvas.readLog();
}

function draw() {
  canvas.draw();
}