// Author: Three.js - https://threejs.org/examples/?q=mine#webgl_geometry_minecraft_ao

import Expo from 'expo';
import React from 'react';
import {PanResponder,View, Dimensions} from 'react-native'
const {width, height} = Dimensions.get('window')
var voxel = require('voxel')

import Engine from '../js/lib/voxel-engine';
import voxelView from '../js/lib/voxel-view';
import * as THREE from 'three';
const THREEView = Expo.createTHREEViewClass(THREE);
const VoxelView = voxelView(THREE, {});

import Dpad from './Dpad'
import GestureType from '../js/GestureType'

export default class Voxel extends React.Component {
  // world;

  // scene =

  // engine = new Engine({
  //   view: voxelView,
  //   generate: voxel.generator['Valley'],
  //   chunkDistance: 2,
  //   materials: ['#fff', '#000'],
  //   materialFlatColor: true,
  //   worldOrigin: [0, 0, 0],
  //   controls: { discreteFire: true }
  // });
  state = {
    ready: false
  }

  setupGestures = () => {
    // const {controls} = this
    const touchesBegan = (event, gestureState) => {
      // this.controls.onGesture(event, gestureState, GestureType.began)
      //
      // const {nativeEvent} = event
      // this.raycaster.setFromCamera( new THREE.Vector2(nativeEvent.locationX, nativeEvent.locationY), this.camera );
      //
      // var intersections = this.raycaster.intersectObjects( this.mesh );
      // // intersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null;
      // console.log("VOXEL:: intersection", intersections)
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

  // // setupControls = () => {
  // //   this.controls = new Player( this.camera, this.physics );
  // //   this.controls.setSize(width, height);
  // //   this.controls.movementSpeed = 10;
  // //   this.controls.lookSpeed = 0.3;
  // //   this.controls.lookVertical = true;
  // //   this.controls.constrainVertical = false;
  // //   this.controls.verticalMin = 1.1;
  // //   this.controls.verticalMax = 2.2;
  // //
  // //   this.controls.setPosition(new THREE.Vector3(
  // //     100,
  // //     (this.world.getY( 100, 100 ) + 10),
  // //     100
  // //   ))
  // //   // this.camera.position.y = this.world.getY( worldSize/2, worldSize/2 ) * 1 + 1;
  // //   /// Setup Gestures after Controls
  // //   this.setupGestures()
  // // }
  //
  // // setupSky = () => {
  // //   // Add Sky Mesh
  // //   let sky = new Sky();
  // //   this.scene.add( sky.mesh );
  // //
  // //   // Add Sun Helper
  // //   let sunSphere = new THREE.Mesh(
  // //     new THREE.SphereBufferGeometry( 2000, 16, 8 ),
  // //     new THREE.MeshBasicMaterial( { color: 0xffffff } )
  // //   );
  // //   sunSphere.position.y = - 700000;
  // //   this.scene.add( sunSphere );
  // //
  // //   var effectController  = {
  // //     turbidity: 10,
  // //     rayleigh: 2,
  // //     mieCoefficient: 0.004,
  // //     mieDirectionalG: 0.8,
  // //     luminance: 1,
  // //     inclination: 0.4315, // elevation / inclination
  // //     azimuth: 0.25, // Facing front,
  // //     sun: true
  // //   };
  // //
  // //   var distance = 400000;
  // //   var uniforms = sky.uniforms;
  // //   uniforms.turbidity.value = effectController.turbidity;
  // //   uniforms.rayleigh.value = effectController.rayleigh;
  // //   uniforms.luminance.value = effectController.luminance;
  // //   uniforms.mieCoefficient.value = effectController.mieCoefficient;
  // //   uniforms.mieDirectionalG.value = effectController.mieDirectionalG;
  // //   var theta = Math.PI * ( effectController.inclination - 0.5 );
  // //   var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );
  // //   sunSphere.position.x = distance * Math.cos( phi );
  // //   sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
  // //   sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );
  // //   sunSphere.visible = effectController.sun;
  // //   sky.uniforms.sunPosition.value.copy( sunSphere.position );
  // // }
  //
  // setupCamera = (fov = 60, zNear = 0.01, zFar = 20000) => {
  //   // this.camera = new THREE.PerspectiveCamera( fov, width / height, zNear, zFar );
  // }
  //
  // setupScene = (fogColor = 0xffffff, fogFalloff = 0.00015) => {
  //   this.scene = new THREE.Scene();
  //   this.scene.fog = new THREE.FogExp2(fogColor, fogFalloff);
  // }
  //
  // setupLights = () => {
  //   /// General Lighting
  //   var ambientLight = new THREE.AmbientLight( 0xcccccc );
  //   this.scene.add( ambientLight );
  //
  //   /// Directional Lighting
  //   var directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
  //   directionalLight.position.set( 1, 1, 0.5 ).normalize();
  //   this.scene.add( directionalLight );
  // }

  async componentWillMount() {
    // this.world = new World(worldSize, worldSize)

this.setupGestures();
    // const textureAsset = Expo.Asset.fromModule(require('../assets/images/material.png'));
    // await textureAsset.downloadAsync();

    // this.world.textureAsset = textureAsset

    // this.mesh = this.world.getGeometry()

    // this.physics = new Physics(this.world)


    // engine

    // this.setupWorld()

    // this.scene.add( this.mesh );



    this.setState({ready: true});
  }

  // setupWorld = () => {
  //   this.setupCamera()
  //   // this.setupControls()
  //   this.setupScene()
  //   this.setupGestures()
  //   this.setupLights()
  //   // this.setupSky()
  // }
  //
  // frame = 0
  //
  // tick = (dt) => {
  //   // this.engine.update(dt);
  //   // if (this.frame % 60 == 0) {
  //     // this.controls.update( dt, this.moveID );
  //   // }
  //   // this.frame += 1
  // }

  render() {
    if (!this.state.ready) {
      return <Expo.AppLoading />
    }

    const dPad = (<Dpad
      style={{position: 'absolute', bottom: 8, left: 8}}
      onPressOut={_=> {this.moveID = null}}
      onPress={id => {
        this.moveID = id
      }}/>
    )

    return (
      <View style={{flex: 1}}>
        <VoxelView
          backgroundColor={'red'}
          {...this.panResponder.panHandlers}
          style={{ flex: 1 }}
        />
        {dPad}
      </View>
    );
  }
}
