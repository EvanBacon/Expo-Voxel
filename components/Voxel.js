// Author: Three.js - https://threejs.org/examples/?q=mine#webgl_geometry_minecraft_ao

import Expo from 'expo';
import React from 'react';
import {PanResponder,StyleSheet, View, Dimensions} from 'react-native'
const {width, height} = Dimensions.get('window')
import DirectionType from '../js/DirectionType'
global.THREE = THREE;
var fly = require('voxel-fly')
var highlight = require('voxel-highlight')
var walk = require('voxel-walk')
var player = require('../js/lib/voxel-player')
var voxel = require('voxel')
const examples = voxel.generateExamples();
import Engine from '../js/lib/voxel-engine';
import voxelView from '../js/lib/voxel-view';
import * as THREE from 'three';
const THREEView = Expo.createTHREEViewClass(THREE);
import ExpoTHREE from 'expo-three'

import Dpad from './Dpad'
import GestureType from '../js/GestureType'


export default class Voxel extends React.Component {
  // world;

  state = {
    camera: null,
    ready: true,
  }
  screenDelta = {x: 0, y: 0}


  updateStreamWithEvent = (type, event, gestureState) => {
    const {nativeEvent} = event;
    const {dx, dy} = gestureState;
    const scale = 0.1;
    this.screenDelta = {
      x: this.screenDelta.x + (dx * scale),
      y: this.screenDelta.y + (dy * scale),
    }
    window.document.body.emitter.emit(type, {...nativeEvent, screenX: this.screenDelta.x, screenY: this.screenDelta.y });

  }
  buildGestures = ({onTouchStart, onTouchMove, onTouchEnd}) => PanResponder.create({
    onStartShouldSetPanResponder: (evt, gestureState) => true,
    onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => true,
    onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

    onPanResponderGrant: ( ( event, gestureState ) => {
      this.updateStreamWithEvent("mousedown", event, gestureState)
    }),
    onPanResponderMove: ( ( event, gestureState ) => {
      this.updateStreamWithEvent("mousemove", event, gestureState)
      // window.document.body.emitter.emit("keyup", {keyCode});
      // onTouchMove(nativeEvent)
    }),
    onPanResponderRelease:  ( ( event, gestureState ) => {
      this.updateStreamWithEvent("mouseup", event, gestureState)
    }),
      onPanResponderTerminate: ( ( event, gestureState ) => {
        this.updateStreamWithEvent("mouseup", event, gestureState)
      }),
    })

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
        style={{position: 'absolute', bottom: 8, left: 8}}
        onPressOut={_=> {
          let keyCode = this.keyCodeForDirection(this.moveID);
          this.moveID = null
          window.document.body.emitter.emit("keyup", {keyCode});
          ///TODO: Fix this hack
          // window.document.body.emitter.emit("keydown", {keyCode: 1000});
          // window.document.body.emitter.emit("keyup", {keyCode: 1000});
        }}
        onPress={id => {
          let keyCode = this.keyCodeForDirection(id);
          window.document.body.emitter.emit("keydown", {keyCode});
          this.moveID = id
        }}/>
      )
      return (
        <View style={{flex: 1}}>
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
          addEventListener: () => {},
          removeEventListener: () => {},
          clientHeight: height,
        },
        context: gl,
      });

      // const mesher = voxel.generate([0,0,0], [16,16,16], function(x,y,z) {
      //   return Math.round(Math.random() * 0xffffff)
      // });
      this.game = new Engine({
        THREE,
        view,
        interactMouseDrag: true,
        isClient: true,
        getCamera: (_ => view.getCamera()),
        // mesher: voxel.meshers.stupid,
        generate: voxel.generator['Sphere'],
        // meshType: 'wireMesh',
        // tickFPS: 60,
        chunkDistance: 2,
        materials: ['#fff', '#000'],
        materialFlatColor: true,
        worldOrigin: [0, 0, 0],
        controls: { discreteFire: true },
      });
      this.setState({camera: this.game.camera});



      (async () => {


        this._texture = await ExpoTHREE.createTextureAsync({
          asset: Expo.Asset.fromModule(require('../assets/images/player.png')),
        });

        var createPlayer = player(this.game)

        // create the player from a minecraft skin file and tell the
        // game to use it as the main player
        this.avatar = createPlayer(this._texture)
        this.avatar.possess()
        this.avatar.yaw.position.set(2, 14, 4)

        this.defaultSetup(this.game, this.avatar)
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
      avatar.toggle()
      // block interaction stuff, uses highlight data
      var currentMaterial = 1

      game.on('fire', function (target, state) {
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
        walk.render(target.playerSkin)
        var vx = Math.abs(target.velocity.x)
        var vz = Math.abs(target.velocity.z)
        if (vx > 0.001 || vz > 0.001) walk.stopWalking()
        else walk.startWalking()
      })

    }


  }
