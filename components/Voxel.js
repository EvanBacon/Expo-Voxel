// Author: Three.js - https://threejs.org/examples/?q=mine#webgl_geometry_minecraft_ao

import Expo from 'expo';
import React from 'react';
import {PanResponder,StyleSheet, View, Dimensions} from 'react-native'
const {width, height} = Dimensions.get('window')
import EventEmitter from 'EventEmitter';

import TouchControls from '../js/lib/voxel-touchcontrols';

global.THREE = THREE;
import OrbitControls from 'expo-three-orbit-controls'
var fly = require('voxel-fly')
var highlight = require('voxel-highlight')
var walk = require('voxel-walk')
var voxel = require('../js/lib/voxel')
var player = require('../js/lib/voxel-player')
// var voxel = require('voxel')
const examples = voxel.generateExamples();
// import Engine from 'voxel-engine';

import Engine from '../js/lib/voxel-engine';
// import voxelView from 'voxel-view';
import voxelView from '../js/lib/voxel-view';
import * as THREE from 'three';
const THREEView = Expo.createTHREEViewClass(THREE);
// const VoxelView = voxelView({});
import ExpoTHREE from 'expo-three'

import Dpad from './Dpad'
import GestureType from '../js/GestureType'


export default class Voxel extends React.Component {
  // world;


  state = {
    camera: null,
    ready: false
  }

  buildGestures = ({onTouchStart, onTouchMove, onTouchEnd}) => PanResponder.create({
  onStartShouldSetPanResponder: (evt, gestureState) => true,
  onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
  onMoveShouldSetPanResponder: (evt, gestureState) => true,
  onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

  onPanResponderGrant: (({nativeEvent}) => onTouchStart(nativeEvent)),
  onPanResponderMove: (({nativeEvent}) => onTouchMove(nativeEvent)),
  onPanResponderRelease: (({nativeEvent}) => onTouchEnd(nativeEvent)),
  onPanResponderTerminate: (({nativeEvent}) => onTouchEnd(nativeEvent)),
})



  async componentWillMount() {

    this.setState({
      ready: true,
      // panResponder: this.buildGestures(controls)
    });
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

        {/* <OrbitControls
   style={{flex: 1}}
   camera={this.state.camera}> */}
        <Expo.GLView
          {...(this.state.panResponder || {}).panHandlers}
          pointerEvents={'none'}
       style={StyleSheet.absoluteFill}
       onContextCreate={this._onGLContextCreate}
     />
     {/* </OrbitControls> */}
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
  this.game = new Engine({
    THREE,
    view: view,
    isClient: true,
    getCamera: (_ => view.getCamera()),
    mesher: voxel.meshers.culled,
    generate: voxel.generator['Hilly Terrain'],
    chunkDistance: 2,
    materials: ['#ff0000', '#000'],
    materialFlatColor: true,
    worldOrigin: [0, 0, 0],
    controls: { discreteFire: true },
  });
  this.setState({camera: this.game.camera});
    // console.log("VOXEL::", voxel.generator['Hilly Terrain'])
  // this.game.on('postrender', function(dt) {
  //   // console.log("VOXEL:: postrender")
  // })

//        gl.endFrameEXP();


  // for (let _x = 0; _x < 20; _x += 1) {
  //   for (let _y = 0; _y < 20; _y += 1) {
  //     for (let _z = 0; _z < 20; _z += 1) {
  //       this.game.addMarker(new THREE.Vector3(_x,_y,_z));
  //     }
  //   }
  // }


(async () => {


  this._texture = await ExpoTHREE.createTextureAsync({
    asset: Expo.Asset.fromModule(require('../assets/images/player.png')),
  });


var createPlayer = player(this.game)

// create the player from a minecraft skin file and tell the
// game to use it as the main player
var avatar = createPlayer(this._texture)
avatar.possess()
avatar.yaw.position.set(2, 14, 4)

  this.defaultSetup(this.game, avatar)
})()

  }



  defaultSetup = (game, avatar) => {

    var makeFly = fly(game)
    var target = game.controls.target()
    game.flyer = makeFly(target)

    // highlight blocks when you look at them, hold <Ctrl> for block placement
    var blockPosPlace, blockPosErase
    var hl = game.highlighter = highlight(game, { color: 0xff0000 })
    hl.on('highlight', function (voxelPos) { blockPosErase = voxelPos })
    hl.on('remove', function (voxelPos) { blockPosErase = null })
    hl.on('highlight-adjacent', function (voxelPos) { blockPosPlace = voxelPos })
    hl.on('remove-adjacent', function (voxelPos) { blockPosPlace = null })

    // toggle between first and third person modes
    // window.addEventListener('keydown', function (ev) {
    //   if (ev.keyCode === 'R'.charCodeAt(0)) avatar.toggle()
    // })

    // block interaction stuff, uses highlight data
    var currentMaterial = 1

    game.on('fire', function (target, state) {
      console.log("VOXEL:: On Fire")

      var position = blockPosPlace
      if (position) {
        game.createBlock(position, currentMaterial)
      }
      else {
        position = blockPosErase
        if (position) game.setBlock(position, 0)
      }
    })

    game.on('tick', function() {
      console.log("VOXEL:: On Tick")
      walk.render(target.playerSkin)
      var vx = Math.abs(target.velocity.x)
      var vz = Math.abs(target.velocity.z)
      if (vx > 0.001 || vz > 0.001) walk.stopWalking()
      else walk.startWalking()
    })



    this.setState({panResponder: this.buildGestures( new TouchControls(game.controls) )  });

  }


}
