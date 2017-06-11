// Author: Three.js - https://threejs.org/examples/?q=mine#webgl_geometry_minecraft_ao

import Expo from 'expo';
import React from 'react';
import {PanResponder,StyleSheet, View, Dimensions} from 'react-native'
const {width, height} = Dimensions.get('window')

var voxel = require('../js/lib/voxel')
// var voxel = require('voxel')
const examples = voxel.generateExamples();
// import Engine from 'voxel-engine';

import Engine from '../js/lib/voxel-engine';
// import voxelView from 'voxel-view';
import voxelView from '../js/lib/voxel-view';
import * as THREE from 'three';
global.THREE = THREE;
const THREEView = Expo.createTHREEViewClass(THREE);
// const VoxelView = voxelView({});

import Dpad from './Dpad'
import GestureType from '../js/GestureType'


THREE.WebGLRenderer.setClearColorHex = function(color, alpha) {
  this.setClearColor(color, hex);
}

export default class Voxel extends React.Component {
  // world;


  state = {
    ready: false
  }

  setupGestures = () => {
    // const {controls} = this
    const touchesBegan = (event, gestureState) => {
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


  async componentWillMount() {

this.setupGestures();


    this.setState({ready: true});
  }

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
        {/* <VoxelView
          backgroundColor={'red'}
          {...this.panResponder.panHandlers}
          style={{ flex: 1}}
        /> */}
        <Expo.GLView
          {...this.panResponder.panHandlers}

       style={StyleSheet.absoluteFill}
       onContextCreate={this._onGLContextCreate}
     />
        {dPad}
      </View>
    );
  }



  // This is called by the `Expo.GLView` once it's initialized
_onGLContextCreate = async (gl) => {
  // Based on https://threejs.org/docs/#manual/introduction/Creating-a-scene
  // In this case we instead use a texture for the material (because textures
  // are cool!). All differences from the normal THREE.js example are
  // indicated with a `NOTE:` comment.

  const skyColor = '#5dc3ea';
  const {drawingBufferWidth: width, drawingBufferHeight:height} = gl;


  const camera = new THREE.OrthographicCamera(
    width / -2, width / 2, height / 2, height / -2, 0, 1);


  view = new voxelView(THREE, {
      width: width,
      height: height,
      skyColor: skyColor,
      antialias: true,
      bindToScene: (element) => {

      },

      canvas: {
     width,
     height,
     style: {},
     addEventListener: () => {},
     removeEventListener: () => {},
     clientHeight: gl.drawingBufferHeight,
   },
   context: gl,


 });


  // const mesher = voxel.generate([0,0,0], [16,16,16], function(x,y,z) {
  //   return Math.round(Math.random() * 0xffffff)
  // });
  engine = new Engine({
    view: view,
    isClient: true,
    getCamera: (_ => camera),
    mesher: voxel.meshers.greedy,
    generate: voxel.generator['Valley'],
    chunkDistance: 2,
    materials: ['#fff', '#000'],
    materialFlatColor: true,
    worldOrigin: [0, 0, 0],
    controls: { discreteFire: true },
    // context: gl,
    postrender: (dt => {
      gl.endFrameEXP();
      console.log("VOXEL:: postrender", dt)

    }),
  });
  console.log("VOXEL:: init")
  // engine.on('postrender', function(dt) {
  // })

//        gl.endFrameEXP();

  }


}
