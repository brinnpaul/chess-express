var socket = io(window.location.origin);

var colors = [
    0xFF62B0,
    0x9A03FE,
    0x62D0FF,
    0x48FB0D,
    0xDFA800,
    0xC27E3A,
    0x990099,
    0x9669FE,
    0x23819C,
    0x01F33E,
    0xB6BA18,
    0xFF800D,
    0xB96F6F,
    0x4A9586
  ]

var pieces = {
  king: './pieces/king.stl',
  queen: './pieces/queen.stl',
  bishop: './pieces/bishop.stl',
  knight: './pieces/knight.stl',
  rook: './pieces/rook.stl',
  pawn: './pieces/pawn.stl'
}

var chessBoard = {
  scene: null,
  camera: null,
  renderer: null,
  container: null,
  controls: null,
  clock: null,
  stats: null,
  plane: null,
  selection: null,
  offset: new THREE.Vector3(),
  objects: [],
  white: {},
  black: {},
  centers: [],
  raycaster: new THREE.Raycaster(),

  getRandColor: function() { return colors[Math.floor(Math.random()*colors.length)] },

  init: function() {
    this.scene = new THREE.Scene()

    var SCREEN_WIDTH = window.innerWidth,
        SCREEN_HEIGHT = window.innerHeight

    var VIEW_ANGLE = 45,
        ASPECT = SCREEN_WIDTH/SCREEN_HEIGHT,
        NEAR = 1,
        FAR = 10000
    //camera
    this.camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR )
    this.scene.add(this.camera)
    this.camera.position.set(0, 500, 1000)
    this.camera.lookAt( new THREE.Vector3(152,0,-114) )
    //renderer
    this.renderer = new THREE.WebGLRenderer({antialias: true, alpha: false, shadowMapEnabled: true})
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT)
    this.renderer.setClearColor(0x000000)

    this.renderer.shadowMap.enabled = true
    this.renderer.showMapSoft = true
    this.renderer.shadowMapHeight = 1000
    this.renderer.shadowMapWidth = 1000
    var loader = new THREE.TextureLoader();
    var texture = loader.load( 'space-2.jpg' );
    var backgroundMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(5000, 5000,8,8),
        new THREE.MeshBasicMaterial({
             map: texture
        }));
    backgroundMesh.material.depthTest = false;
    backgroundMesh.material.depthWrite = false;
    backgroundMesh.position.set(0,0,-1000)

    var backgroundMesh2 = new THREE.Mesh(
        new THREE.PlaneGeometry(2048, 2048,8,8),
        new THREE.MeshBasicMaterial({
             map: texture
        }));
    backgroundMesh2.material.depthTest = false;
    backgroundMesh2.material.depthWrite = false;
    backgroundMesh2.position.set(-1000,0,1000)


    this.scene.add(backgroundMesh)

    this.container = document.createElement('div')
    document.body.appendChild(this.container)
    this.container.appendChild(this.renderer.domElement)

    //controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
    this.controls.target = new THREE.Vector3(0, 0, 0)
    //clock
    this.clock = new THREE.Clock()
    //stats
    this.stats = new Stats()
    this.stats.domElement.style.position = 'absolute'
    this.stats.domElement.style.bottom = '0px'
    this.stats.domElement.style.zIndex = 10
    this.container.appendChild( this.stats.domElement )

    document.addEventListener('mousedown', this.onDocumentMouseDown, false)
    document.addEventListener('mousemove', this.onDocumentMouseMove, false)
    document.addEventListener('mouseup', this.onDocumentMouseUp, false)

    var spLight = new THREE.SpotLight(0xfffff0, 1.5, 4000, Math.PI / 3)
    spLight.castShadow = true
    spLight.position.set(-200, 300, -100)
    this.scene.add(spLight)

    var ground = new THREE.Mesh( new THREE.PlaneGeometry(1000, 1000, 10, 10), new THREE.MeshLambertMaterial({color:0x999999}) )
    ground.receiveShadow = true
    ground.position.set(0, 0, 0)
    ground.rotation.x = -Math.PI / 2
    // this.scene.add(ground)

    var light = new THREE.AmbientLight( 0x404040, 1 ) // soft white light
    this.scene.add( light )

    this.loadPieces()
    this.createBoard()

    this.plane = new THREE.Mesh(
      new THREE.PlaneBufferGeometry(1000, 1000, 8, 8),
      new THREE.MeshBasicMaterial({transparent:true, opacity:0.3}))
    this.scene.add(this.plane)

  },

  loadPieces: function() {
    //load white
    renderPiece(pieces.rook, [0, 0, -305], 0xCDCDC1, 'rook1')
    renderPiece(pieces.bishop, [0, 0, -305], 0xCDCDC1, 'bishop1')
    renderPiece(pieces.knight, [107, 0, -201], 0xCDCDC1, 'knight1', rotate=true)
    renderPiece(pieces.king, [0, 0, -305], 0xCDCDC1, 'king')
    renderPiece(pieces.queen, [0, 0, -305], 0xCDCDC1, 'queen')
    renderPiece(pieces.knight, [292, 0, -201], 0xCDCDC1, 'knight2', rotate=true)
    renderPiece(pieces.bishop, [-110, 0, -305], 0xCDCDC1, 'bishop2')
    renderPiece(pieces.rook, [-260, 0, -305], 0xCDCDC1, 'rook2')

    renderPiece(pieces.pawn, [73, 0, -225], 0xCDCDC1, 'pawn1')
    renderPiece(pieces.pawn, [34, 0, -225], 0xCDCDC1, 'pawn2')
    renderPiece(pieces.pawn, [-3, 0, -225], 0xCDCDC1, 'pawn3')
    renderPiece(pieces.pawn, [-39, 0, -225], 0xCDCDC1, 'pawn4')
    renderPiece(pieces.pawn, [-77, 0, -225], 0xCDCDC1, 'pawn5')
    renderPiece(pieces.pawn, [-115, 0, -225], 0xCDCDC1, 'pawn6')
    renderPiece(pieces.pawn, [-152, 0, -225], 0xCDCDC1, 'pawn7')
    renderPiece(pieces.pawn, [-188, 0, -225], 0xCDCDC1, 'pawn8')
    // load black
    renderPiece(pieces.rook, [0, 0, -35], 0x36454f, 'rook1')
    renderPiece(pieces.bishop, [0, 0, -35], 0x36454f, 'bishop1')
    renderPiece(pieces.knight, [0, 0, -35], 0x36454f, 'knight1')
    renderPiece(pieces.king, [0, 0, -35], 0x36454f, 'king')
    renderPiece(pieces.queen, [0, 0, -35], 0x36454f, 'queen')
    renderPiece(pieces.knight, [185, 0, -35], 0x36454f, 'knight2')
    renderPiece(pieces.bishop, [-110, 0, -35], 0x36454f, 'bishop2')
    renderPiece(pieces.rook, [-260, 0, -35], 0x36454f, 'rook2')

    renderPiece(pieces.pawn, [73, 0, -35], 0x36454f, 'pawn1')
    renderPiece(pieces.pawn, [34, 0, -35], 0x36454f, 'pawn2')
    renderPiece(pieces.pawn, [-3, 0, -35], 0x36454f, 'pawn3')
    renderPiece(pieces.pawn, [-39, 0, -35], 0x36454f, 'pawn4')
    renderPiece(pieces.pawn, [-77, 0, -35], 0x36454f, 'pawn5')
    renderPiece(pieces.pawn, [-115, 0, -35], 0x36454f, 'pawn6')
    renderPiece(pieces.pawn, [-152, 0, -35], 0x36454f, 'pawn7')
    renderPiece(pieces.pawn, [-188, 0, -35], 0x36454f, 'pawn8')

  },
  createBoard: function() {
    var size = 8
    var black = 0x000000, white = 0xffffff
    for (var i=0; i<size; i++) {
      for (var j=0; j<size; j++) {
        if ((i+j)%2 === 0) color = white
        else color = black
        if (color===black) {
          var square = new THREE.Mesh(
            new THREE.PlaneGeometry(38, 38, 10, 10),
            new THREE.MeshPhongMaterial({color:color, transparent:true, opacity:0.3})
          )
        } else {
          var square = new THREE.Mesh(
            new THREE.PlaneGeometry(38, 38, 10, 10),
            new THREE.MeshPhongMaterial({color:color})
          )
        }
        square.receiveShadow = true
        square.position.set(38*i+16-155, 7, 38*j-250)
        chessBoard.centers.push([38*i+16-155, 38*j-250])
        square.rotation.x = -Math.PI / 2
        chessBoard.scene.add(square)
      }
    }
  },
  onDocumentMouseDown: function (event) {
    // Get mouse position
    var mouseX = (event.clientX / window.innerWidth) * 2 - 1
    var mouseY = -(event.clientY / window.innerHeight) * 2 + 1

    // Get 3D vector from 3D mouse position using 'unproject' function
    var vector = new THREE.Vector3(mouseX, mouseY, 1)
    vector.unproject(chessBoard.camera)

    // Set the raycaster position
    chessBoard.raycaster.set(
      chessBoard.camera.position,
      vector.sub( chessBoard.camera.position
      ).normalize() )
    // Find all intersected objects
    var intersects = chessBoard.raycaster.intersectObjects(chessBoard.objects)
    // console.log("INTERSECTS", intersects)
    if (intersects.length > 0) {
      // Disable the controls
      chessBoard.controls.enabled = false
      // Set the selection - first intersected object
      chessBoard.selection = intersects[0].object
      // Calculate the offset
      var intersects = chessBoard.raycaster.intersectObject(chessBoard.plane)
      chessBoard.offset.copy(intersects[0].point).sub(chessBoard.plane.position)
    }
  },
  onDocumentMouseMove: function (event) {
    event.preventDefault()
    console.log("hello")
    // Get mouse position
    var mouseX = (event.clientX / window.innerWidth) * 2 - 1
    var mouseY = -(event.clientY / window.innerHeight) * 2 + 1
    // Get 3D vector from 3D mouse position using 'unproject' function
    var vector = new THREE.Vector3(mouseX, mouseY, 1)
    vector.unproject(chessBoard.camera)
    // Set the raycaster position
    chessBoard.raycaster.set(
      chessBoard.camera.position,
      vector.sub( chessBoard.camera.position
      ).normalize() )
    if (chessBoard.selection) {
      // Check the position where the plane is intersected
      var intersects = chessBoard.raycaster.intersectObject(chessBoard.plane)
      console.log(intersects)
      // Reposition the object based on the intersection point with the plane
      var newPoint = intersects[0]
      // socket.emit('moving', newPoint)
      // // console.log(newPoint.point)
      // socket.on('update', function(movement) {
      //   chessBoard.selection.position.copy(movement.point.sub(chessBoard.offset))
      // })
      chessBoard.selection.position.copy(intersects[0].point.sub(chessBoard.offset))
    } else {
      // Update position of the plane if need
      var intersects = chessBoard.raycaster.intersectObjects(chessBoard.objects)
      if (intersects.length > 0) {
        chessBoard.plane.position.copy(intersects[0].object.position)
        chessBoard.plane.lookAt(chessBoard.camera.position)
      }
    }
  },
  onDocumentMouseUp: function (event) {
    // Enable the controls
    chessBoard.controls.enabled = true
    // drop chess piece to 0 y coordinate
    if(chessBoard.selection) {
      // console.log(calcMinDistance(chessBoard.selection, chessBoard.centers))
      chessBoard.selection.position.y = 0
    }
    chessBoard.selection = null
  }

}

function animate() {
  requestAnimationFrame(animate)
  render()
  update()
}

function update() {
  chessBoard.controls.update(chessBoard.clock.getDelta())
  chessBoard.stats.update()
  var timer = Date.now() * 0.000025
  var distances = [0.39, 0.72, 1, 1.52, 5.2, 9.52, 19.22, 30.006]
}

function render() {
  if (chessBoard.renderer) {
    chessBoard.renderer.render(chessBoard.scene, chessBoard.camera)
  }
}

function initialize() {
  chessBoard.init()
  animate()
}

function renderPiece(piece, coor, color, name, rotate=false) {
  var oStlLoader = new THREE.STLLoader()
  oStlLoader.load(piece, function(geometry) {
    var material = new THREE.MeshPhongMaterial({color:color, shininess:3})
    var mesh = new THREE.Mesh(geometry, material)
    chessBoard.objects.push(mesh)
    if (color == 0xCDCDC1) {
      chessBoard.white[name] = mesh
    } else {
      chessBoard.black[name] = mesh
    }
    if (rotate) mesh.rotation.y = Math.PI
    mesh.position.x = coor[0]
    mesh.position.y = coor[1]
    mesh.position.z = coor[2]
    mesh.scale.set(0.75,0.75,0.75);
    chessBoard.scene.add(mesh)
  })
}

if (window.addEventListener) {
  window.addEventListener('load', initialize, false)
} else if (window.attachEvent) {
  window.attachEvent('onload', initialize)
} else {
  window.onload = initialize
}
