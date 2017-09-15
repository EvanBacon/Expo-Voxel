// Author: Three.js - https://threejs.org/examples/?q=mine#webgl_geometry_minecraft_ao

import Expo from 'expo';
import React from 'react';
import { PanResponder, StyleSheet, View, Dimensions } from 'react-native'
const { width, height } = Dimensions.get('window')
import DirectionType from '../js/DirectionType'
global.THREE = THREE;
var fly = require('voxel-fly')
var highlight = require('../js/lib/voxel-highlight')
var walk = require('voxel-walk')
var player = require('../js/lib/voxel-player')
var voxel = require('voxel')
const examples = voxel.generateExamples();
import Engine from '../js/lib/voxel-engine';
import voxelView from '../js/lib/voxel-view';
import * as THREE from 'three';
import ExpoTHREE from 'expo-three'
var createReach = require('../js/lib/voxel-reach');

import Dpad from './Dpad'
import GestureType from '../js/GestureType'

const LONG_PRESS_MIN_DURATION = 500;

var terrain = require('voxel-perlin-terrain')
var chunkSize = 32

// initialize your noise with a seed, floor height, ceiling height and scale factor
var generateChunk = terrain('foo', 0, 5, 20)


export default class Voxel extends React.Component {
  // world;
  reach;
  state = {
    camera: null,
    ready: true,
  }
  screenDelta = { x: 0, y: 0 }


  updateStreamWithEvent = (type, event, gestureState) => {
    const { nativeEvent } = event;
    const { dx, dy } = gestureState;
    const scale = 1;
    this.screenDelta = {
      x: dx,
      y: dy
    }
    window.document.body.emitter.emit(type, { ...nativeEvent, screenX: this.screenDelta.x, screenY: this.screenDelta.y });

  }


  buildGestures = ({ onTouchStart, onTouchMove, onTouchEnd }) => PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => true,
    onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

    onPanResponderGrant: ((event, gestureState) => {
      this.longPressing = false;
      const { dx, dy, x0, y0 } = gestureState;
      let screenDelta = {
        x: dx,
        y: dy
      }
      const saved = { ...event.nativeEvent, clientX: x0, clientY: y0, screenX: x0, screenY: y0 };

      this.long_press_timeout = setTimeout(_ => {
        this.longPressing = true;
        // if (this.voxelPos) {
        //   this.game.setBlock(this.voxelPos, 0) // on
        // }
        // console.warn(this.voxelPos)
        // game.setBlock(pos, 0) // off

        window.document.body.emitter.emit("keydown", { keyCode: 18 });
        window.document.body.emitter.emit('click', saved); //contextmenu
        window.document.body.emitter.emit("keyup", { keyCode: 18 });

        //// Remove Block
        this.controls.onfire({fire: true});
      }, LONG_PRESS_MIN_DURATION);

      this.updateStreamWithEvent("mousedown", event, gestureState)
    }),
    onPanResponderMove: ((event, gestureState) => {
      if (Math.sqrt((gestureState.dx * gestureState.dx) + (gestureState.dy * gestureState.dy)) > 10) {
        clearTimeout(this.long_press_timeout);

      }

      this.updateStreamWithEvent("mousemove", event, gestureState)
      // window.document.body.emitter.emit("keyup", {keyCode});
      // onTouchMove(nativeEvent)
    }),
    onPanResponderRelease: ((event, gestureState) => {
      clearTimeout(this.long_press_timeout);
      this.reach.stopMining();
      this.updateStreamWithEvent("mouseup", event, gestureState);

      const distance = Math.hypot(gestureState.dx, gestureState.dy);

      /*
        Is it a tap?
        Make sure the duration and distance are short...
      */
      if (!this.longPressing && distance < this.minimumTappingDistance) {      
         //// Place Block
         this.controls.onfire({firealt: true});
      }


      this.longPressing = false;
    }),
    onPanResponderTerminate: ((event, gestureState) => {
      clearTimeout(this.long_press_timeout);
      this.longPressing = false;
      this.reach.stopMining();
      this.updateStreamWithEvent("mouseup", event, gestureState);
    }),
  })
  minimumTappingDistance = 20;
  componentWillMount() {
    this.panResponder = this.buildGestures({});
  }


  keyCodeForDirection = (direction) => {
    let keyCode = null;
    switch (direction) {
      case DirectionType.front:
        keyCode = 38;
        break;
      case DirectionType.left:
        keyCode = 37;
        break;
      case DirectionType.right:
        keyCode = 39;
        break;
      case DirectionType.back:
        keyCode = 40;
        break;
      case DirectionType.up:
        keyCode = 32;
        // this.avatar.toggle()
        break;
      default:
        break;
    }
    return keyCode;
  }
  render() {
    if (!this.state.ready) {
      return <Expo.AppLoading />
    }
    const dPad = (<Dpad
      style={{ position: 'absolute', bottom: 8, left: 8 }}
      onPressOut={_ => {
        let keyCode = this.keyCodeForDirection(this.moveID);
        this.moveID = null
        window.document.body.emitter.emit("keyup", { keyCode });
        ///TODO: Fix this hack
        // window.document.body.emitter.emit("keydown", {keyCode: 1000});
        // window.document.body.emitter.emit("keyup", {keyCode: 1000});
      }}
      onPress={id => {
        let keyCode = this.keyCodeForDirection(id);
        window.document.body.emitter.emit("keydown", { keyCode });
        this.moveID = id
      }} />
    )
    return (
      <View style={{ flex: 1 }}>
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
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;


    view = new voxelView(THREE, {
      width,
      height,
      skyColor,
      ortho: false,
      antialias: true,
      bindToScene: (element) => {

      },
      canvas: {
        width,
        height,
        style: {},
        addEventListener: () => { },
        removeEventListener: () => { },
        clientHeight: height,
      },
      context: gl,
    });

    // const mesher = voxel.generate([0,0,0], [16,16,16], function(x,y,z) {
    //   return Math.round(Math.random() * 0xffffff)
    // });

    this.controls = { 
      discreteFire: true, 
      fireRate: 100,
    };
    this.game = new Engine({
      THREE,
      view,
      interactMouseDrag: true,
      isClient: true,
      getCamera: (_ => view.getCamera()),
      generateChunks: false,
      // mesher: voxel.meshers.stupid,
      // meshType: 'wireMesh',
      // tickFPS: 60,
      // generate: (x,y,z) => {
      //   if (y == 0) {
      //     return 1
      //   }
      //   return 0
      //   // return x*x+y*y+z*z <= 15*15 ? 1 : 0 // sphere world
      // },

      // generate: voxel.generator['Valley'],
      chunkDistance: 2,
      materials: ['#fff', '#000'],
      materialFlatColor: true,
      worldOrigin: [0, 0, 0],
      controls: this.controls
    });
    
  
    
    this.setState({ camera: this.game.camera });



    (async () => {


      this._texture = await ExpoTHREE.createTextureAsync({
        asset: Expo.Asset.fromModule(require('../assets/images/player.png')),
      });

      var createPlayer = player(this.game)

      // create the player from a minecraft skin file and tell the
      // game to use it as the main player
      this.avatar = createPlayer(this._texture, {})
      this.avatar.possess()
      this.avatar.yaw.position.set(2, 14, 4)

      this.defaultSetup(this.game, this.avatar)
    })()
  }

  defaultSetup = (game, avatar) => {

    let plugins = {

    }
    game.plugins = {
      get: (name) => plugins[name],
      add: (name, mod, options) => {
        plugins[name] = mod(game, options)
        return plugins[name];
      }
    };
    
    game.plugins.add('voxel-registry', require('voxel-registry'), {});

    // console.warn("Tickle");
    // console.warn(game.plugins.get('voxel-registry'), "");
//  return;
    game.plugins.add('voxel-land', require('../js/lib/voxel-land'), {});
    

    // then hook it up to your game as such:

    // game.voxels.emitter.addListener('missingChunk', function (p) {
    //   var voxels = generateChunk(p, chunkSize)
    //   var chunk = {
    //     position: p,
    //     dims: [chunkSize, chunkSize, chunkSize],
    //     voxels: voxels
    //   }
    //   game.showChunk(chunk)
    // })

    // note that your game should have generateChunks: false

    var makeFly = fly(game)
    var target = game.controls.target()
    game.flyer = makeFly(target)

    // highlight blocks when you look at them, hold <Ctrl> for block placement
    this.blockPosPlace;
    this.blockPosErase;
    var hl = game.highlighter = highlight(game, { color: 0xdddddd })
    hl.emitter.addListener('highlight', (voxelPos) => {
      // console.warn("Highlight", voxelPos)
      this.blockPosErase = voxelPos
    })
    hl.emitter.addListener('remove', (voxelPos) => {
      // console.warn("removed", voxelPos)
      this.blockPosErase = null
    })
    hl.emitter.addListener('highlight-adjacent', (voxelPos) => {
      // console.warn("adjacent", voxelPos)
      this.blockPosPlace = voxelPos
    })
    hl.emitter.addListener('remove-adjacent', (voxelPos) => { this.blockPosPlace = null })
    plugins['highlighter'] = hl;

    const reachDistance = 9;
    this.reach = createReach(game, reachDistance);

    
    plugins['voxel-reach'] = this.reach;
    this.reach.emitter.addListener('use', function (target) {
      console.warn("use", target)
      if (target)
        game.createBlock(target.adjacent, 1);
    });

    this.reach.emitter.addListener('mining', function (target) {
      // console.warn("mining", target)
      if (target)
        game.setBlock(target.voxel, 0);
    });

    var createMine = require('../js/lib/voxel-mine');

    var mine = createMine(game, {

    });
    plugins['voxel-mine'] = mine;
    mine.addListener('break', function (target) {
      // do something to this voxel (remove it, etc.)
      console.warn("Remove This Voxel", target)
    });



    // toggle between first and third person modes
    // window.addEventListener('keydown', function (ev) {
    //   if (ev.keyCode === 'R'.charCodeAt(0)) avatar.toggle()
    // })
    // avatar.toggle()
    // block interaction stuff, uses highlight data
    var currentMaterial = 1

    game.on('fire', function (target, state) {
      // var position = this.blockPosPlace
      // if (position) {
      //   game.createBlock(position, currentMaterial)
      //   // console.warn("added", position)
      // }
      // else {
      //   position = this.blockPosErase
      //   if (position) game.setBlock(position, 0)
      // }
    })

    game.on('tick', function () {
      walk.render(target.playerSkin)
      var vx = Math.abs(target.velocity.x)
      var vz = Math.abs(target.velocity.z)
      if (vx > 0.001 || vz > 0.001) walk.stopWalking()
      else walk.startWalking()
    })



  }


}
