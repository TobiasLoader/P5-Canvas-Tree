# P5 Canvas Tree

### A structured OOP style for writing P5.js scripts.

*Note: this is just a wrapper around ordinary P5.js, so under the hood P5 is still actually rendering to the html canvas element – see the `P5Base` class. This is just an abstraction on top of P5 to keep your project well structured with inheritance.*



###  The `Obj` class:

Every element that can be rendered to the canvas is designed to be of type `Obj` (including the class `Canvas`  itself).

Every `Obj` object has only 4 attributes:

- `id`: the unique id of the `Obj` object – set by its parent on creation of the object
- `parent`: the `id` of the parent object
- `children`: a list of type `Obj` – all of the objects children
- `properties`: properties associated with the object

Further every `Obj` object instantiates the following methods:

- `setParentId`
- `getParentId`
- `setId`
- `getId`
- `addProperty`
- `setProperty`
- `getProperty`
- `addChild`
- `addChildren`
- `setup`
- `draw`

The `id` attributes are of the form  `#-0-1-2`, which uniquely defines where the `Obj` object sits in the Object tree. Each integer is the objects index in the `children` array of the `parent`. The `#` is the root of the tree, see `Base` below.

Users are encouraged to implement other classes that extend `Obj` in the `objects.js` file  – currently `Vertex`, `Text` and  `Polygon` have been implemented. These can then be instantiated in `setup` of `Canvas` (see below) to add these objects to the Object tree.

`Obj` is defined in the `core.js` file.

### The `Base` and `P5Base` classes

A `Base` object is the root of the Object tree. It extends the `Obj` class with the methods to search the Object tree. These are:

- `getObjectById`
- `applySearch`
- `defaultSearch`

Additionally the `Base` object initialises `id` and `parent` of `#` since it is the root of the Object tree.

`P5Base` extends the `Base` class with an interface to P5.js rendering tools. Additional methods to `P5Base` include `text`, `point`, `line`... Further the `P5Base` class takes `w` and `h` in its constructor (these are the dimensions of the canvas and are stored in the `properties` attribute). The P5 canvas is created in the `setup` method of `P5Base`.

`Base` and `P5base` are defined in the `core.js` file.

### The `Canvas` class

The `Canvas` class extends `P5Base`. The `setup` and  `draw` methods of  `Canvas` are the methods a programmer using `P5-Canvas-Tree` can use to create their own Object tree and draw it to the canvas. `setup` is where the top level of the Object tree is defined, and the `draw` method is how to draw the objects to the screen. Note leaving `super.draw(this)` at the bottom of the `draw` method by default traverses the Object tree in a Depth-First-Search manner and draws all the Objects to the canvas (using each `Obj` draw method).

The example that I've created includes a search for an object by id after a delay of 2 seconds. This is done in the `draw` method of the `Canvas` class. If the object is found, I then change some properties of the object – and this is reflected on the page.

`Canvas` is defined in the `sketch.js` file. Also in the file are the top level p5.js `draw` and `setup` functions (that shouldn't be used).

### How to view the Object tree:

- clone the repo
- open the index.html in a browser
- open developer tools and switch to the javascript console
- the full Object tree (in the state after `setup`) is logged to the console
