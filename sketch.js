class Canvas extends Base {
  constructor(children){
    super(children);
  }
  
  setChildren(){
    return [
			new Div({x:0.1,w:0.7,ratio:'fixed'},[
				new Polygon([{x:0.2,y:0.5},{x:0.6,y:0.8},{x:0.8,y:0.3}],{x:0.05,y:0.1,w:0.3,h:0.4}),
				new Text('Hello',0.7,0.2),
				new Text('Goodbye',0.3,0.85),
				new BgText('Wait 2 seconds...',0.1,0.5,{x:0.05,y:0.65,w:0.7,h:0.15})
			]),
			new Card('not hovering',[{x:0.2,y:0.7},{x:0.7,y:0.6},{x:0.6,y:0.2}],0.25,0.75,{
				x:0.65,y:0.2,w:0.3,h:0.3,ratio:'fixed'
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
      this.search('@-0-0',(obj,id)=>{
        obj.set('coords',(coords)=>{
          coords[2].x = 0.4;
          return coords;
        });
        this.search('@-0-3',(obj2,id2)=>{
          obj2.set('txt',() => "x coord of object with id: ("+id+") moved: 0.3 to 0.25");
        });
      });
    }
		this.search('#infocard',(obj,id)=>{
			if (obj.hover()){
				obj.set('txt',() => "hovering");
			} else {
				obj.set('txt',() => "not hovering");
			}
		});
  }
	
	mouseClicked(){
		this.search('#infocard',(obj,id)=>{
			obj.set('x',(x) => 0.3+0.9*(0.5-x));
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

function mouseClicked(){
	canvas.mouseClickedPropagate();
}