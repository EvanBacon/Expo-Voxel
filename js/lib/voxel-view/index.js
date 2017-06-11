var temporaryPosition, temporaryVector
import * as THREE from 'three';

import React, { PropTypes } from 'react';
import { View,StyleSheet, Dimensions } from 'react-native';
import {GLView} from 'expo'

import Game from '../voxel-engine';

const {width, height} = Dimensions.get('window');
// module.exports = function(three, opts) {
//   temporaryPosition = new three.Vector3
//   temporaryVector = new three.Vector3
//
//   return new View(three, opts)
// }

var voxel = require('../voxel')

// <VoxelView tick={}  />
export default (opts) => class VoxelView extends React.Component {

  constructor(props) {
    super(props)
//     temporaryPosition = new THREE.Vector3
//     temporaryVector = new THREE.Vector3
//
//     // THREE = three // three.js doesn't support multiple instances on a single page
//
//     this.scene.fog = new THREE.FogExp2(0xBFD1E5, 0.00015);
//

//     this.fov = opts.fov || 60
//     this.aspectRatio = opts.aspectRatio || width/height
//     this.nearPlane = opts.nearPlane || 1
//     this.farPlane = opts.farPlane || 10000
//     this.skyColor = opts.skyColor || 0xBFD1E5
//     this.ortho = opts.ortho
//     this.camera = this.ortho ? (new THREE.OrthographicCamera(width/-2, width/2, height/2, height/-2, this.nearPlane, this.farPlane)) : (new THREE.PerspectiveCamera(this.fov, this.aspectRatio, this.nearPlane, this.farPlane))
//     this.camera.lookAt(new THREE.Vector3(0, 0, 0))
//
//     // if (!process.browser) return
//
//     console.log("VOX.js:: Terrain", voxel.generator['Valley']());
//

    this.camera = new THREE.PerspectiveCamera(60, width/height, 1, 10000)
    this.engine = new Game({
      // view: this,
      getCamera: ( _=> this.camera ),
      // generate: voxel.generator['Valley'],
      // mesher: voxel.meshers.greedy,
      chunkDistance: 2,
      materials: ['#fff', '#000'],
      materialFlatColor: true,
      worldOrigin: [0, 0, 0],
      controls: { discreteFire: true }
    });

    // this.addLights()

//
//
//     this.createRenderer()
//     // this.element = this.renderer.domElement
//


  }

  createRenderer = () => {
    // this.renderer = new THREE.WebGLRenderer({
    //   antialias: true
    // })
    // this.renderer.setSize(this.width, this.height)
    // this.renderer.setClearColorHex(this.skyColor, 1.0)
    // this.renderer.clear()
  }

  bindToScene = (scene) => {
    this.scene = scene;
    // scene.add(this.camera)
  }

  getCamera = () => this.camera;

  cameraPosition = () => {
    temporaryPosition.multiplyScalar(0)
    temporaryPosition.applyMatrix4(this.camera.matrixWorld)
    return [temporaryPosition.x, temporaryPosition.y, temporaryPosition.z]
  }

  cameraVector = () => {
    temporaryVector.multiplyScalar(0)
    temporaryVector.z = -1
    this.camera.matrixWorld.rotateAxis(temporaryVector)
    return [temporaryVector.x, temporaryVector.y, temporaryVector.z]
  }
  static propTypes = {
    // Parameters to http://threejs.org/docs/?q=webgl#Reference/Renderers/WebGLRenderer.render
    scene: PropTypes.object,
    // camera: PropTypes.object,

    // Whether to automatically set the aspect ratio of the camera from
    // the viewport. Defaults to `true`.
    autoAspect: PropTypes.bool,

    // NOTE: 0x000000 is considered a PropType.number, while '#000000' is considered a PropType.string.
    backgroundColor: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    backgroundColorAlpha: PropTypes.number,

    // Called every animation frame with one parameter `dt` which is the
    // time in seconds since the last animation frame
    tick: PropTypes.func,

    ...View.propTypes,
  };

  static defaultProps = {
    autoAspect: true,
    backgroundColor: 0x000000,
    backgroundColorAlpha: 1,
  };

  // Get a three.js texture from an Exponent Asset
  static textureFromAsset(asset) {
    if (!asset.localUri) {
      throw new Error(
        `Asset '${asset.name}' needs to be downloaded before ` +
          `being used as an OpenGL texture.`
      );
    }
    const texture = new THREE.Texture();
    texture.image = {
      data: asset,
      width: asset.width,
      height: asset.height,
    };
    texture.needsUpdate = true;
    texture.isDataTexture = true; // send to gl.texImage2D() verbatim
    return texture;
  }

  _onContextCreate = gl => {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: {
        width: gl.drawingBufferWidth,
        height: gl.drawingBufferHeight,
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {},
        clientHeight: gl.drawingBufferHeight,
      },
      context: gl,
    });

    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(
      'red',
      1
    );

    let lastFrameTime;
    const animate = () => {
      this._requestAnimationFrameID = requestAnimationFrame(animate);

      const now = 0.001 * global.nativePerformanceNow();
      const dt = typeof lastFrameTime !== 'undefined'
        ? now - lastFrameTime
        : 0.16666;

      // if (this.tick) {
        this.tick(dt);
      // }

      if (this.scene && this.camera) {
        const {camera} = this;
        if (this.props.autoAspect && camera.aspect) {
          const desiredAspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
          if (camera.aspect !== desiredAspect) {
            camera.aspect = desiredAspect;
            camera.updateProjectionMatrix();
          }
        }

        renderer.render(this.scene, camera);
      }
      gl.flush();
      gl.endFrameEXP();

      lastFrameTime = now;
    };
    animate();
  };

  componentWillUnmount() {
    if (this._requestAnimationFrameID) {
      cancelAnimationFrame(this._requestAnimationFrameID);
    }
  }

  tick = (dt) => {



    // if (this.frame % 60 == 0) {
      // this.controls.update( dt, this.moveID );
    // }
    // this.frame += 1
  }

  render() {
    // eslint-disable-next-line no-unused-vars
    const { scene, camera, autoAspect, ...viewProps } = this.props;
    return (
      <GLView
        {...viewProps}
        style={StyleSheet.absoluteFill}
        onContextCreate={this._onContextCreate}
      />
    );
  }

}
