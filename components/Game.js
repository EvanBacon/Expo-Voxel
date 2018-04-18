import ExpoGraphics from 'expo-graphics';
import ExpoTHREE, { THREE } from 'expo-three';
import React from 'react';
import {
  Platform,
  PanResponder,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native';

import Assets from '../Assets';
import Expo from 'expo';

const { width, height } = Dimensions.get('window');
import DirectionType from '../js/DirectionType';
const fly = require('voxel-fly');
import VoxelHighlighter from '../js/lib/voxel-highlight';
const walk = require('../js/lib/voxel-walk');
const voxel = require('voxel');
import Engine from '../js/lib/voxel-engine';
import VoxelView from '../js/lib/voxel-view';
const createReach = require('../js/lib/voxel-reach');
const player = require('../js/lib/voxel-player');
import Dpad from './Dpad';
import GestureType from '../js/GestureType';

const LONG_PRESS_MIN_DURATION = 500;

const terrain = require('voxel-perlin-terrain');
const chunkSize = 32;

// initialize your noise with a seed, floor height, ceiling height and scale factor
const generateChunk = terrain('foo', 0, 5, 20);

export default class App extends React.Component {
  componentWillMount() {
    THREE.suppressExpoWarnings(true);
  }
  componentWillUnmount() {
    THREE.suppressExpoWarnings(false);
  }
  onShouldReloadContext = () => {
    /// The Android OS loses gl context on background, so we should reload it.
    return Platform.OS === 'android';
  };

  shouldComponentUpdate() {
    return false;
  }

  screenDelta = { x: 0, y: 0 };

  updateStreamWithEvent = (type, event, gestureState) => {
    const { nativeEvent } = event;
    const { dx, dy } = gestureState;
    const scale = 1;
    this.screenDelta = {
      x: dx,
      y: dy,
    };
    console.log('stream touch', this.screenDelta);
    window.document.body.emitter.emit(type, {
      ...nativeEvent,
      screenX: this.screenDelta.x,
      screenY: this.screenDelta.y,
    });
  };

  buildGestures = ({ onTouchStart, onTouchMove, onTouchEnd }) =>
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,

      onPanResponderGrant: (event, gestureState) => {
        this.longPressing = false;
        const { dx, dy, x0, y0 } = gestureState;
        let screenDelta = {
          x: dx,
          y: dy,
        };
        const saved = {
          ...event.nativeEvent,
          clientX: x0,
          clientY: y0,
          screenX: x0,
          screenY: y0,
        };

        this.long_press_timeout = setTimeout(_ => {
          this.longPressing = true;
          // if (this.voxelPos) {
          //   this.game.setBlock(this.voxelPos, 0) // on
          // }
          // console.warn(this.voxelPos)
          // game.setBlock(pos, 0) // off

          window.document.body.emitter.emit('keydown', { keyCode: 18 });
          window.document.body.emitter.emit('click', saved); //contextmenu
          window.document.body.emitter.emit('keyup', { keyCode: 18 });

          //// Remove Block
          this.controls.onfire({ fire: true });
        }, LONG_PRESS_MIN_DURATION);

        this.updateStreamWithEvent('mousedown', event, gestureState);
      },
      onPanResponderMove: (event, gestureState) => {
        if (
          Math.sqrt(
            gestureState.dx * gestureState.dx +
              gestureState.dy * gestureState.dy,
          ) > 10
        ) {
          clearTimeout(this.long_press_timeout);
        }

        this.updateStreamWithEvent('mousemove', event, gestureState);
        // window.document.body.emitter.emit("keyup", {keyCode});
        // onTouchMove(nativeEvent)
      },
      onPanResponderRelease: (event, gestureState) => {
        clearTimeout(this.long_press_timeout);
        if (this.reach) {
          this.reach.stopMining();
        }

        this.updateStreamWithEvent('mouseup', event, gestureState);

        const distance = Math.hypot(gestureState.dx, gestureState.dy);

        /*
        Is it a tap?
        Make sure the duration and distance are short...
      */
        if (!this.longPressing && distance < this.minimumTappingDistance) {
          //// Place Block
          if (this.controls) {
            this.controls.onfire({ firealt: true });
          }
        }

        this.longPressing = false;
      },
      onPanResponderTerminate: (event, gestureState) => {
        clearTimeout(this.long_press_timeout);
        this.longPressing = false;
        if (this.reach) {
          this.reach.stopMining();
        }
        this.updateStreamWithEvent('mouseup', event, gestureState);
      },
    });
  minimumTappingDistance = 20;
  componentWillMount() {
    this.panResponder = this.buildGestures({});
  }

  keyCodeForDirection = direction => {
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
  };

  get dpad() {
    return (
      <Dpad
        style={{ position: 'absolute', bottom: 8, left: 8 }}
        onPressOut={_ => {
          let keyCode = this.keyCodeForDirection(this.moveID);
          this.moveID = null;
          window.document.body.emitter.emit('keyup', { keyCode });
          ///TODO: Fix this hack
          // window.document.body.emitter.emit("keydown", {keyCode: 1000});
          // window.document.body.emitter.emit("keyup", {keyCode: 1000});
        }}
        onPress={id => {
          let keyCode = this.keyCodeForDirection(id);
          window.document.body.emitter.emit('keydown', { keyCode });
          this.moveID = id;
        }}
      />
    );
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View
          style={StyleSheet.absoluteFill}
          {...this.panResponder.panHandlers}
        >
          <ExpoGraphics.View
            onContextCreate={this.onContextCreate}
            onRender={this.onRender}
            onResize={this.onResize}
            onShouldReloadContext={this.onShouldReloadContext}
          />
        </View>
        {this.dpad}
      </View>
    );
  }

  // This is called by the `ExpoGraphics.View` once it's initialized
  onContextCreate = async ({ gl, canvas, width, height, scale }) => {
    global.__context = gl;
    global.gl = gl;

    view = new VoxelView({
      width,
      height,
      scale,
      skyColor: 0x5dc3ea,
      ortho: false,
      antialias: true,
      bindToScene: element => {},
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

    // const mesher = voxel.generate([0, 0, 0], [16, 16, 16], function(x, y, z) {
    //   return Math.round(Math.random() * 0xffffff);
    // });

    this.controls = {
      discreteFire: true,
      fireRate: 100,
    };
    this.game = new Engine({
      view,
      interactMouseDrag: true,
      isClient: true,
      getCamera: () => view.getCamera(),
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
      controls: this.controls,
    });

    const createPlayer = player(this.game);

    const texture = await ExpoTHREE.loadAsync(Assets.images['player.png']);
    const avatar = createPlayer(texture);
    avatar.possess();
    avatar.yaw.position.set(2, 14, 4);
    this.avatar = avatar;

    this.defaultSetup(this.game, this.avatar);
    // })();
  };

  onResize = ({ width, height, scale }) => {
    if (this.game) {
    }
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
  };

  onRender = delta => {
    // this.cube.rotation.x += 3.5 * delta;
    // this.cube.rotation.y += 2 * delta;
    // this.renderer.render(this.scene, this.camera);
  };

  defaultSetup = (game, avatar) => {
    let plugins = {};
    game.plugins = {
      get: name => plugins[name],
      add: (name, mod, options) => {
        plugins[name] = mod(game, options);
        return plugins[name];
      },
    };
    game.plugins.add('voxel-registry', require('voxel-registry'), {});
    // console.warn("Tickle");
    // console.warn(game.plugins.get('voxel-registry'), "");
    //  return;
    game.plugins.add('voxel-land', require('../js/lib/voxel-land'), {});
    game.plugins.add('voxel-recipes', require('voxel-recipes'), {});
    game.plugins.add('voxel-bedrock', require('voxel-bedrock'), {});
    game.plugins.add('voxel-fluid', require('voxel-fluid'), {});
    game.plugins.add('voxel-bucket', require('voxel-bucket'), {});
    // then hook it up to your game as such:
    // game.voxels.emitter.addListener('missingChunk', function(p) {
    //   var voxels = generateChunk(p, chunkSize);
    //   var chunk = {
    //     position: p,
    //     dims: [chunkSize, chunkSize, chunkSize],
    //     voxels: voxels,
    //   };
    //   game.showChunk(chunk);
    // });
    // note that your game should have generateChunks: false
    var makeFly = fly(game);
    var target = game.controls.target();
    game.flyer = makeFly(target);

    // highlight blocks when you look at them, hold <Ctrl> for block placement
    const hl = (game.highlighter = new VoxelHighlighter(game, {
      color: 0xdddddd,
    }));
    hl.emitter.addListener('highlight', voxelPos => {
      // console.warn("Highlight", voxelPos)
      this.blockPosErase = voxelPos;
    });
    hl.emitter.addListener('remove', voxelPos => {
      // console.warn("removed", voxelPos)
      this.blockPosErase = null;
    });
    hl.emitter.addListener('highlight-adjacent', voxelPos => {
      // console.warn("adjacent", voxelPos)
      this.blockPosPlace = voxelPos;
    });
    hl.emitter.addListener('remove-adjacent', voxelPos => {
      this.blockPosPlace = null;
    });
    plugins['highlighter'] = hl;

    const reachDistance = 9;
    this.reach = createReach(game, reachDistance);

    plugins['voxel-reach'] = this.reach;
    this.reach.emitter.addListener('use', function(target) {
      if (target) game.createBlock(target.adjacent, 1);
    });

    this.reach.emitter.addListener('mining', function(target) {
      // console.warn("mining", target)
      if (target) game.setBlock(target.voxel, 0);
    });

    var createMine = require('../js/lib/voxel-mine');

    var mine = createMine(game, {});
    plugins['voxel-mine'] = mine;
    mine.addListener('break', function(target) {
      // do something to this voxel (remove it, etc.)
      console.warn('Remove This Voxel', target);
    });

    // toggle between first and third person modes
    // window.addEventListener('keydown', function (ev) {
    //   if (ev.keyCode === 'R'.charCodeAt(0)) avatar.toggle()
    // })
    // avatar.toggle()
    // block interaction stuff, uses highlight data
    var currentMaterial = 1;

    game.on('fire', function(target, state) {
      // var position = this.blockPosPlace
      // if (position) {
      //   game.createBlock(position, currentMaterial)
      //   // console.warn("added", position)
      // }
      // else {
      //   position = this.blockPosErase
      //   if (position) game.setBlock(position, 0)
      // }
    });

    game.on('tick', function() {
      walk.render(target.playerSkin);
      var vx = Math.abs(target.velocity.x);
      var vz = Math.abs(target.velocity.z);
      if (vx > 0.001 || vz > 0.001) walk.stopWalking();
      else walk.startWalking();
    });
  };
}
