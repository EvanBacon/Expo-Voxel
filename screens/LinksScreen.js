import Expo, {GLView} from 'expo';
import React, { PropTypes } from 'react';
import {PanResponder, Dimensions} from 'react-native'
const {width, height} = Dimensions.get('window')
import * as THREE from 'three';

import { View } from 'react-native';

skyColor = 0xcce0ff
class THREEView extends React.Component {
  static propTypes = {
    // Parameters to http://threejs.org/docs/?q=webgl#Reference/Renderers/WebGLRenderer.render
    scene: PropTypes.object,
    camera: PropTypes.object,

    // Whether to automatically set the aspect ratio of the camera from
    // the viewport. Defaults to `true`.
    autoAspect: PropTypes.bool,

    // Called every animation frame with one parameter `dt` which is the
    // time in seconds since the last animation frame
    tick: PropTypes.func,

    ...View.propTypes,
  };

  static defaultProps = {
    autoAspect: true,
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

    renderer.setClearColor(skyColor, 1);

    let lastFrameTime;
    const animate = () => {
      this._requestAnimationFrameID = requestAnimationFrame(animate);

      const now = 0.001 * global.nativePerformanceNow();
      const dt = typeof lastFrameTime !== 'undefined'
      ? now - lastFrameTime
      : 0.16666;

      if (this.props.tick) {
        this.props.tick(dt);
      }

      if (this.props.scene && this.props.camera) {
        const camera = this.props.camera;
        if (this.props.autoAspect && camera.aspect) {
          const desiredAspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
          if (camera.aspect !== desiredAspect) {
            camera.aspect = desiredAspect;
            camera.updateProjectionMatrix();
          }
        }
        renderer.render(this.props.scene, camera);
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

  render() {
    // eslint-disable-next-line no-unused-vars
    const { scene, camera, autoAspect, tick, ...viewProps } = this.props;
    return <GLView {...viewProps} onContextCreate={this._onContextCreate} />;
  }
}


export default class App extends React.Component {
  objects = []
  mouse = new THREE.Vector2();
  raycaster = new THREE.Raycaster();
  scene = new THREE.Scene();


  state = {
    ready: false
  }

  intersectionForPoint = (x, y) => {
    const coords = this.convertCoords(x, y)
    this.mouse.set( coords.x, coords.y);
    this.raycaster.setFromCamera( this.mouse, this.camera );
    var intersects = this.raycaster.intersectObjects( this.objects );
    if ( intersects.length > 0 ) {
      var intersect = intersects[ 0 ];
      return intersect
    }
    return null
  }

  touchesBegan = (event, gestureState) => {

  }
  touchesMoved = (event, gestureState) => {
    event.preventDefault();
    const {locationX, locationY} = event.nativeEvent;
    var intersect = this.intersectionForPoint(locationX, locationY)
    if (intersect) {
      this.movePreviewBlockWithIntersect(intersect)
    }
  }
  touchesEnded = (event, gestureState) => {
    event.preventDefault();
    const {locationX, locationY} = event.nativeEvent;
    var intersect = this.intersectionForPoint(locationX, locationY)
    if (intersect) {
      this.addBlockWithIntersect(intersect)
    }
  }

  convertCoords = (x, y) => {
    return {x: ( (x / width) * 2 - 1), y: (- (y / height) * 2 + 1)};
  }

  removeBlockWithIntersect = (intersect) => {
    if (intersect.object != this.plane ) {
      this.scene.remove( intersect.object );
      this.objects.splice( this.objects.indexOf( intersect.object ), 1 );
    }
  }

  movePreviewBlockWithIntersect = (intersect) => {
    this.previewMesh.position.copy( intersect.point ).add( intersect.face.normal );
    this.previewMesh.position.divideScalar( this.blockSize ).floor().multiplyScalar( this.blockSize ).addScalar( this.blockSize/2 );
  }

  addBlockWithIntersect = (intersect) => {
    var voxel = new THREE.Mesh(
      this.cubeGeo,
      this.cubeMaterial
    );
    voxel.position.copy( intersect.point ).add( intersect.face.normal );
    voxel.position.divideScalar( this.blockSize ).floor().multiplyScalar( this.blockSize ).addScalar( this.blockSize/2 );
    this.scene.add( voxel );
    this.objects.push( voxel );
  }



  async componentWillMount() {
    let {objects, texture} = this

    const textureAsset = Expo.Asset.fromModule(
      require('../assets/images/boat.jpg'));
      await textureAsset.downloadAsync();
      texture = THREEView.textureFromAsset(textureAsset);
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearFilter;


      this.scene.fog = new THREE.Fog( skyColor, 500, 10000 );

      this.camera = new THREE.PerspectiveCamera(75, 1, 1, 10000);

      this.camera.position.set( 500, 800, 1300 );
      this.camera.lookAt( new THREE.Vector3() );
      this.blockSize = 100

      // roll-over helpers
      this.previewGeo = new THREE.BoxGeometry( this.blockSize, this.blockSize, this.blockSize );
      this.previewMaterial = new THREE.MeshBasicMaterial( { color: 0x0000dd, opacity: 0.5, transparent: true } );
      this.previewMesh = new THREE.Mesh(
        this.previewGeo,
        this.previewMaterial
      );
      this.scene.add( this.previewMesh );

      /// Gesture
      this.panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: this.touchesBegan,
        onPanResponderMove: this.touchesMoved,
        onPanResponderRelease: this.touchesEnded,
        onPanResponderTerminate: this.touchesEnded, //cancel
        onShouldBlockNativeResponder: () => false,
      });

      // cubes

      this.cubeGeo = new THREE.BoxGeometry( this.blockSize, this.blockSize, this.blockSize );
      this.cubeMaterial = new THREE.MeshLambertMaterial(
        { color: 0xfeb74c,
          map: texture } );


          // grid
          var size = 500, step = this.blockSize;
          var geometry = new THREE.Geometry();
          for ( var i = - size; i <= size; i += step ) {
            geometry.vertices.push( new THREE.Vector3( - size, 0, i ) );
            geometry.vertices.push( new THREE.Vector3(   size, 0, i ) );
            geometry.vertices.push( new THREE.Vector3( i, 0, - size ) );
            geometry.vertices.push( new THREE.Vector3( i, 0,   size ) );
          }
          var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2, transparent: true } );
          var line = new THREE.LineSegments( geometry, material );
          this.scene.add( line );
          //
          geometry = new THREE.PlaneBufferGeometry( 1000, 1000 );
          geometry.rotateX( - Math.PI / 2 );
          this.plane = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { visible: false } ) );
          this.scene.add( this.plane );
          objects.push( this.plane );


          ///Lights
          this.scene.add( new THREE.AmbientLight( 0x666666 ) );

          var light = new THREE.DirectionalLight( 0xdfebff, 1.75 );
  				light.position.set( 50, 200, 100 );
  				light.position.multiplyScalar( 1.3 );
  				light.castShadow = true;
  				light.shadow.mapSize.width = 1024;
  				light.shadow.mapSize.height = 1024;
  				var d = 300;
  				light.shadow.camera.left = - d;
  				light.shadow.camera.right = d;
  				light.shadow.camera.top = d;
  				light.shadow.camera.bottom = - d;
  				light.shadow.camera.far = 1000;
          this.scene.add( light );

          this.setState({ready: true})


        }

        tick = (dt) => {
          // this.mesh.rotation.x += 1 * dt;
          // this.mesh.rotation.y += 2 * dt;
        }

        render() {
          if (!this.state.ready) {
            return null
          }
          return (
            <THREEView
              {...this.panResponder.panHandlers}
              style={{ flex: 1 }}
              scene={this.scene}
              camera={this.camera}
              tick={this.tick}
            />
        );
      }
    }
