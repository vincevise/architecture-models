import '../style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import * as dat from 'lil-gui'
import {EdgesGeometry, LineSegments, ShaderMaterial} from 'three';

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Models
 */
// const dracoLoader = new DRACOLoader()
// dracoLoader.setDecoderPath('/draco/')

// Add origin axis
const axisHelper = new THREE.AxesHelper(5); // Adjust the size as needed
scene.add(axisHelper);

const gltfLoader = new GLTFLoader()
// gltfLoader.setDRACOLoader(dracoLoader)

let mixer = null

function setShadowProperties(object) {
    if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
    }

    if (object.children && object.children.length > 0) {
        for (const child of object.children) {
            setShadowProperties(child);
        }
    }
}

function loadModel(path, position) {
    gltfLoader.load(
        path,
        (gltf) => {
            gltf.scene.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material.side = THREE.DoubleSide;

                    // Create edges geometry and line segments
                    const edges = new THREE.EdgesGeometry(child.geometry);
                    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
                    const lines = new THREE.LineSegments(edges, edgesMaterial);
                    child.add(lines);
                }
            });

            gltf.scene.children.forEach(child => {
                setShadowProperties(child);
            });

            gltf.scene.position.copy(position);
            // gltf.scene.rotation.y = Math.PI; // Rotate the model 180 degrees
            scene.add(gltf.scene);
        }
    );
}

// Load the first model
loadModel('/canteen_borders.gltf', new THREE.Vector3(-15, 0, 15));

// Load the second model
loadModel('/canteen_borders2.glb', new THREE.Vector3(-15, 0, 15));

// comment line 63 while loading this
// loadModel('/residence.gltf', new THREE.Vector3(-60, 3, 60));

// loadModel('/safakathouse2.gltf', new THREE.Vector3(0, 0, 20));
// loadModel('/safakathouse2.glb', new THREE.Vector3(0, 0, 20));

// uncomment rotate code while loading this model
// loadModel('/vav2.gltf', new THREE.Vector3(0, 1, -10));


// const gridHelper = new THREE.GridHelper(50, 50, 0x888888, 0x444444);
// // gridHelper.rotation.x = -Math.PI / 2; // Rotate the grid to be horizontal
// gridHelper.position.y = -0.01
// scene.add(gridHelper);



/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({
        color: '#ffffff',
        metalness: 0,
        roughness: 0.5
    })
)
floor.receiveShadow = true
floor.rotation.x = - Math.PI * 0.5
floor.position.set(0,-0.01, 0)
scene.add(floor)

//Sphere
// const geometry = new THREE.BoxGeometry(10, 10, 10)

// const material = new THREE.MeshStandardMaterial({
// //   color: '#ffffff'
// })

// const mesh = new THREE.Mesh(geometry, material)
// mesh.castShadow = true
// mesh.receiveShadow = true
// scene.add(mesh)
// 
//Lines

// const edges = new THREE.EdgesGeometry(geometry);
// const edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 10 });
// const lines = new THREE.LineSegments(edges, edgesMaterial);
// mesh.position.set(0,10,0)
// lines.position.set(0,10,0)
// scene.add(lines);


/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 2)

// const directionalLight = new THREE.DirectionalLight
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(2048, 2048)
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(10, 20, 10);
directionalLight.shadowCameraLeft = -3000
// directionalLight.scale.set(10,10,10)
// directionalLight.s
directionalLight.shadow.bias = -0.001;

const helper = new THREE.DirectionalLightHelper( directionalLight, 10 );
 


const lightHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
// scene.add(lightHelper);

// For DirectionalLight
directionalLight.shadow.bias = -0.001;
 
scene.add(directionalLight)
// scene.add(helper)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 200)
camera.position.set(-7, 22, -15);

// Function to set camera direction
function setCameraDirection(camera, target) {
    camera.lookAt(target);
}

// Example usage: set camera to look at the origin
setCameraDirection(camera, new THREE.Vector3(0, 0, 0));

scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 1, 0)
controls.enableDamping = true

// Log camera position when orbiting
controls.addEventListener('change', () => {
    console.log(`Camera position: x=${camera.position.x}, y=${camera.position.y}, z=${camera.position.z}`);
});

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputColorSpace = THREE.SRGBColorSpace ;
/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    if(mixer)
    {
        mixer.update(deltaTime)
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)
    renderer.setClearColor(new THREE.Color('#dddddd'));
    


    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()