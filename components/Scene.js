// Author: Three.js - https://threejs.org/examples/?q=mine#webgl_geometry_minecraft_ao

import Expo from 'expo';
import React from 'react';
import { PanResponder, View, Dimensions } from 'react-native'
const { width, height } = Dimensions.get('window')


import ExpoTHREE from 'expo-three';
const OrbitControls = require('three-orbit-controls')(THREE);

import ThreeView from '../ThreeView';

import '../Three';
import '../window/domElement';
import '../window/resize';
import Touches from '../window/Touches';
import DeviceMotion from '../window/Touches';

import ImprovedNoise from '../js/ImprovedNoise'
import Player from '../js/Player'
import Physics from '../js/Physics'

import Sky from '../js/SkyShader'
import Dpad from './Dpad'
import World from '../js/World'
import GestureType from '../js/GestureType'





var sky, sunSphere;
const worldSize = 20

class App extends React.Component {
  world;

  setupGestures = () => {
    const { controls } = this
    const touchesBegan = (event, gestureState) => {
      // this.controls.onGesture(event, gestureState, GestureType.began)
    }

    const touchesMoved = (event, gestureState) => {
      // this.controls.onGesture(event, gestureState, GestureType.moved)
    }

    const touchesEnded = (event, gestureState) => {
      // this.controls.onGesture(event, gestureState, GestureType.ended)
    }

    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: touchesBegan,
      onPanResponderMove: touchesMoved,
      onPanResponderRelease: touchesEnded,
      onPanResponderTerminate: touchesEnded, //cancel
      onShouldBlockNativeResponder: () => false,
    });

  }

  setupControls = () => {
    // this.controls = new Player(this.camera, this.physics);
    // this.controls.setSize(width, height);
    // this.controls.movementSpeed = 10;
    // this.controls.lookSpeed = 0.3;
    // this.controls.lookVertical = true;
    // this.controls.constrainVertical = false;
    // this.controls.verticalMin = 1.1;
    // this.controls.verticalMax = 2.2;

    // this.controls.setPosition(new THREE.Vector3(
    //   100,
    //   (this.world.getY(100, 100) + 10),
    //   100
    // ))
    // this.camera.position.y = this.world.getY( worldSize/2, worldSize/2 ) * 1 + 1;
    /// Setup Gestures after Controls
    // this.setupGestures()
  }

  setupSky = () => {
    // Add Sky Mesh
    let sky = new Sky();
    this.scene.add(sky.mesh);

    // Add Sun Helper
    let sunSphere = new THREE.Mesh(
      new THREE.SphereBufferGeometry(2000, 16, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    sunSphere.position.y = - 700000;
    this.scene.add(sunSphere);

    var effectController = {
      turbidity: 10,
      rayleigh: 2,
      mieCoefficient: 0.004,
      mieDirectionalG: 0.8,
      luminance: 1,
      inclination: 0.4315, // elevation / inclination
      azimuth: 0.25, // Facing front,
      sun: true
    };

    var distance = 400000;
    var uniforms = sky.uniforms;
    uniforms.turbidity.value = effectController.turbidity;
    uniforms.rayleigh.value = effectController.rayleigh;
    uniforms.luminance.value = effectController.luminance;
    uniforms.mieCoefficient.value = effectController.mieCoefficient;
    uniforms.mieDirectionalG.value = effectController.mieDirectionalG;
    var theta = Math.PI * (effectController.inclination - 0.5);
    var phi = 2 * Math.PI * (effectController.azimuth - 0.5);
    sunSphere.position.x = distance * Math.cos(phi);
    sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta);
    sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta);
    sunSphere.visible = effectController.sun;
    sky.uniforms.sunPosition.value.copy(sunSphere.position);
  }


  setupLights = () => {
    /// General Lighting
    var ambientLight = new THREE.AmbientLight(0xcccccc);
    this.scene.add(ambientLight);

    /// Directional Lighting
    var directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(1, 1, 0.5).normalize();
    this.scene.add(directionalLight);
  }

  async componentWillMount() {


  }

  _onContextCreate = async (gl, arSession) => {

    const { innerWidth: width, innerHeight: height, devicePixelRatio: scale } = window;

    // renderer

    this.renderer = ExpoTHREE.createRenderer({ gl });
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 1.0);

    // scene

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x7394a0, 0.00015);
    
    // AR Background Texture
    this.scene.background = ExpoTHREE.createARBackgroundTexture(arSession, this.renderer);

    // Standard Background
    // this.scene.background = new THREE.Color(0xcccccc);
    // this.scene.fog = new THREE.FogExp2(0xcccccc, 0.002);

    // camera

    /// AR Camera
    this.camera = ExpoTHREE.createARCamera(arSession, width, height, 0.01, 1000);

    /// Standard Camera

    // this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 1000);
    // this.camera.position.z = 500;

    this.camera.lookAt(new THREE.Vector3());

    // controls

    // VR Controls
    // this.controls = new THREE.DeviceOrientationControls(this.camera);

    // this.controls = new OrbitControls(this.camera);
    // this.controls.addEventListener('change', this._render); // remove when using animation loop

    // lights
    // resize listener

    window.addEventListener('resize', this._onWindowResize, false);

    // setup custom world

    await this._setupWorld();
  }

  _setupWorld = async () => {

    this.world = new World(worldSize, worldSize)

    this.mesh = await this.world.getGeometry()

    // this.physics = new Physics(this.world)
    // this.setupWorld()
    this.scene.add(this.mesh);

    // this.setupControls()

    this.setupLights()
    // this.setupSky()

    //  // Rotating cube

    //  this.cube = new THREE.Mesh(
    //   new THREE.BoxGeometry(0.07, 0.07, 0.07),
    //   new THREE.MeshBasicMaterial({
    //     map: await ExpoTHREE.createTextureAsync({
    //       asset: Expo.Asset.fromModule(require('./assets/icons/app-icon.png')),
    //     }),
    //   })
    // );
    // this.cube.position.z = -0.4;
    // this.scene.add(this.cube);


    // // Random Items

    // const geometry = new THREE.CylinderGeometry(0, 10, 30, 4, 1);
    // const material = new THREE.MeshPhongMaterial({ color: 0xff00ff, flatShading: true });

    // for (var i = 0; i < 500; i++) {
    //   const mesh = new THREE.Mesh(geometry, material);
    //   mesh.position.x = (Math.random() - 0.5) * 1000;
    //   mesh.position.y = (Math.random() - 0.5) * 1000;
    //   mesh.position.z = (Math.random() - 0.5) * 1000;
    //   mesh.updateMatrix();
    //   mesh.matrixAutoUpdate = false;
    //   this.scene.add(mesh);
    // }

  }

  _onWindowResize = () => {
    const { innerWidth: width, innerHeight: height, devicePixelRatio: scale } = window;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
  }

  _animate = (delta) => {
    // Rotate cube

    // Render the scene
    this._render();
  }

  _render = () => {
    this.renderer.render(this.scene, this.camera);
  }


  render() {
   
    // const dPad = (<Dpad
    //   style={{position: 'absolute', bottom: 8, left: 8}}
    //   onPressOut={_=> {this.moveID = null}}
    //   onPress={id => {
    //     this.moveID = id
    //   }}/>
    // )


    return (
      <ThreeView
        style={{ flex: 1 }}
        onContextCreate={this._onContextCreate}
        render={this._animate}
        enableAR={true}
      />
    );
  }
}
const TouchesComponent = Touches(App);
export default TouchesComponent;