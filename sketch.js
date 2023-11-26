class Canvas extends P5Base {
  constructor(W,H){
    super(W,H);
  }
  
  setup(){
		const div = new Div([
			new Polygon([{x:0.2,y:0.4},{x:0.4,y:0.6},{x:0.6,y:0.1}],{x:0.05,y:0,w:0.5,h:0.5}),
			new Text('Goodbye',0.7,0.45),
			new Text('Hello',0.35,0.2),
			new Text('In 2 seconds something will happen...',0.15,0.7)
		]);
    this.addChildren([
      div,
      new Card('not hovering',[{x:0.4,y:0.4},{x:0.4,y:0.2},{x:0.6,y:0.1}],0.5,0.8,{
				x:0.3,y:0.3,w:0.3,h:0.3,ratio:'fixed'
			})
    ]);
    // this.freeze();
  }

  build(img){
    img.background(230,230,230);
  }  

  effects(){
    // effect in the draw function - using search inherited from the Base class
    if (millis()>2000 && millis()<3000){
      this.defaultSearch('#-0-0',(id,obj)=>{
        obj.set('coords',(coords)=>{
          coords[2].x = 0.25;
          return coords;
        });
        this.defaultSearch('#-0-3',(id2,obj2)=>{
          obj2.set('txt',() => "x coord of object with id: ("+id+") moved: 0.3 to 0.25");
        });
      });
    }
		this.defaultSearch('#-1',(id,obj)=>{
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