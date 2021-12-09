import * as THREE from "three";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.querySelector("#bg"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.updateShadowMap.enabled = true;
camera.position.setZ(30);

renderer.render(scene, camera);

//Add Torus

const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const material = new THREE.MeshStandardMaterial({
  color: 0x3378af,
});
const torus = new THREE.Mesh(geometry, material);

scene.add(torus);

//think as one bulb at a given x,y, and z
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(5, 5, 5);

//light up everything
const ambientLight = new THREE.AmbientLight(0xffffff);

scene.add(pointLight, ambientLight);

const lightHelper = new THREE.PointLightHelper(pointLight);
const gridHelper = new THREE.GridHelper(200, 50);
//scene.add(lightHelper);
//scene.add(gridHelper);

//grid helper later

const controls = new OrbitControls(camera, renderer.domElement);

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3)
    .fill()
    .map(() => THREE.MathUtils.randFloatSpread(100));

  star.position.set(x, y, z);
  scene.add(star);
}

Array(200).fill().forEach(addStar);

const spaceTexture = new THREE.TextureLoader().load("galaxy2.jpeg");
scene.background = spaceTexture;

//MySelf
const jiminTexture = new THREE.TextureLoader().load("./images/myFace.svg");

const jimin = new THREE.Mesh(
  new THREE.BoxGeometry(3, 3, 3),
  new THREE.MeshBasicMaterial({ map: jiminTexture })
);

jimin.position.setX(4);

scene.add(jimin);

//Add Bowser and Rideshare
const bowserTexture = new THREE.TextureLoader().load("./images/Bowser.png");

const bowser = new THREE.Mesh(
  new THREE.BoxGeometry(5, 2, 2),
  new THREE.MeshBasicMaterial({ map: bowserTexture })
);

bowser.position.setX(10.5);
bowser.position.setY(2);
bowser.position.setZ(14);

scene.add(bowser);

const rideTexture = new THREE.TextureLoader().load("./images/sachacks.jpg");

const ride = new THREE.Mesh(
  new THREE.BoxGeometry(5, 2, 2),
  new THREE.MeshBasicMaterial({ map: rideTexture })
);

ride.position.setX(10.5);
ride.position.setY(-2);
ride.position.setZ(14);

scene.add(ride);

const loader = new GLTFLoader();

//Too avoid console errors while model loads
var model = jimin;

loader.load(
  "./dyson_sphere/scene.gltf",
  function (gltf) {
    model = gltf.scene;
    model.position.z = 30;
    model.position.setX(50);
    model.position.setY(50);
    model.position.setZ(-100);
    model.rotateX(90);
    geometry.center();
    scene.add(gltf.scene);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

//Add some 3D Font

const loaderText = new FontLoader();

loaderText.load("./Libre_Franklin_Regular.json", function (font) {
  const geometry = new TextGeometry("Contact: Jimin947@Gmail.com", {
    font: font,
    size: 0.6,
    height: 0.4,
  });
  const materials = [
    new THREE.MeshPhongMaterial({ color: 0xf1e3c4 }), // front
    new THREE.MeshPhongMaterial({ color: 0x00000cf }), // side
  ];
  const textMesh = new THREE.Mesh(geometry, materials);
  textMesh.castShadow = true;
  textMesh.position.y = -6.5;
  textMesh.position.x = -5.5;
  textMesh.position.z = 12;
  scene.add(textMesh);
});

//controls how fast bowser and ride moves
var tran = 0.2;

function moveCamera() {
  const view = document.body.getBoundingClientRect().top;

  jimin.rotation.y += 0.05;
  jimin.rotation.z += 0.05;
  //jimin.position.x += -0.01;

  if (bowser.position.x > 0.5) {
    bowser.position.x -= tran;
  }

  if (ride.position.x > 0.5) {
    ride.position.x -= tran;
  }

  camera.position.z = view * -0.01;
  camera.position.x = view * -0.0002;
  camera.position.y = view * -0.0002;
}

const view = document.body.getBoundingClientRect().top;

camera.position.z = view * -0.01;
camera.position.x = view * -0.0002;
camera.position.y = view * -0.0002;

document.body.onscroll = moveCamera;

function getDocHeight() {
  var D = document;
  return Math.max(
    Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
    Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
    Math.max(D.body.clientHeight, D.documentElement.clientHeight)
  );
}

function animate() {
  requestAnimationFrame(animate);

  torus.rotation.x += 0.01;
  torus.rotation.y += 0.005;
  torus.rotation.z += 0.01;

  model.rotation.y += 0.01;

  if (window.innerHeight + window.scrollY >= getDocHeight()) {
    // you're at the bottom of the page
    bowser.position.setX(10.5);
    bowser.position.setY(2);
    bowser.position.setZ(14);

    ride.position.setX(10.5);
    ride.position.setY(-2);
    ride.position.setZ(14);

    tran = 0.4;
  }

  controls.update();

  renderer.render(scene, camera);
}

const raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

window.addEventListener("pointermove", onMouseMove);

function onMouseMove(event) {
  // Get screen-space x/y
  mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

  // Perform raycast
  raycaster.setFromCamera(mouse, camera);

  // See if the ray from the camera into the world hits our mesh
  const intersects = raycaster.intersectObject(torus);

  // Check if an intersection took place
  if (intersects.length > 0) {
    const posX = intersects[0].point.x;
    const posY = intersects[0].point.y;
    const posZ = intersects[0].point.z;
    console.log(posX, posY, posZ);
  }
}

animate();
