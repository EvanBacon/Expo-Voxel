import { GraphicsView } from 'expo-graphics';
import ExpoTHREE, { THREE } from 'expo-three';
import React from 'react';
import { Platform } from 'react-native';

import Physics from './Physics';
import Player from './Player';
import Sky from './SkyShader';
import World from './World';
import { Asset } from 'expo-asset';

const worldSize = 32;

export default class App extends React.Component {
  componentDidMount() {
    THREE.suppressExpoWarnings(true);
  }
  componentWillUnmount() {
    THREE.suppressExpoWarnings(false);
  }
  onShouldReloadContext = () => {
    /// The Android OS loses gl context on background, so we should reload it.
    return Platform.OS === 'android';
  };

  updatePan = ({ dx, dy }) => this.player.updateRotation(dx, dy);

  render() {
    // Create an `ExpoGraphics.View` covering the whole screen, tell it to call our
    // `onContextCreate` function once it's initialized.
    return (
      <GraphicsView
        style={{ flex: 1, backgroundColor: 'orange' }}
        onContextCreate={this.onContextCreate}
        onRender={this.onRender}
        onResize={this.onResize}
        onShouldReloadContext={this.onShouldReloadContext}
      />
    );
  }

  setupSky = () => {
    // Add Sky Mesh
    let sky = new Sky();
    this.scene.add(sky);

    // Add Sun Helper
    // let sunSphere = new THREE.Mesh(
    //   new THREE.SphereBufferGeometry(2000, 16, 8),
    //   new THREE.MeshBasicMaterial({ color: 0xffffff })
    // );
    // sunSphere.position.y = -700000;
    // this.scene.add(sunSphere);

    const effectController = {
      turbidity: 10,
      rayleigh: 2,
      mieCoefficient: 0.004,
      mieDirectionalG: 0.8,
      luminance: 1,
      inclination: 0.4315, // elevation / inclination
      azimuth: 0.25, // Facing front,
      sun: true,
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
    // sunSphere.position.x = distance * Math.cos(phi);
    // sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta);
    // sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta);
    // sunSphere.visible = effectController.sun;
    // sky.uniforms.sunPosition.value.copy(sunSphere.position);
  };

  setupPlayer = (width, height) => {
    this.player = new Player(this.camera, this.physics);
    this.player.setSize(width, height);
    this.player.movementSpeed = 10;
    this.player.lookSpeed = 0.3;
    this.player.lookVertical = true;
    this.player.constrainVertical = false;
    this.player.verticalMin = 1.1;
    this.player.verticalMax = 2.2;

    const mid = worldSize / 2;
    this.player.setPosition(
      new THREE.Vector3(mid, this.world.getY(mid, mid) + 2, mid),
    );
  };

  // This is called by the `ExpoGraphics.View` once it's initialized
  onContextCreate = async ({ gl, canvas, width, height, scale }) => {
    console.log('onContextCreate', width, height, scale);
    this.renderer = new ExpoTHREE.Renderer({
      gl,
      canvas,
      width: window.innerWidth,
      height: window.innerHeight,
      scale,
    });
    // this.renderer.setPixelRatio(scale);
    // this.renderer.setSize(width, height);
    this.renderer.setClearColor(0xff0000);

    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x7394a0, 0.00015);
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 20000);

    /// General Lighting
    const ambientLight = new THREE.AmbientLight(0xcccccc);
    this.scene.add(ambientLight);
    /// Directional Lighting
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(1, 1, 0.5).normalize();
    this.scene.add(directionalLight);

    // this.setupSky();

    const asset = Asset.fromModule(require('./assets/images/material.png'));
    await asset.downloadAsync();
    const texture = await ExpoTHREE.loadTextureAsync({ asset });
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;

    this.world = new World({
      width: worldSize,
      depth: worldSize,
      texture,
    });

    this.scene.add(this.world.mesh);
    this.physics = new Physics(this.world);

    this.setupPlayer(width, height);
    global.buttonupdate = ({ name, active }) => {
      console.log('button');
      if (active) {
        this.player && this.player.jump();
      }
    };
  };

  updateJoystick = ({ speed, angle, touching, force }) => {
    this.player &&
      this.player.updateMovement({ speed, angle, touching, force });
  };

  updateWithDrag = ({ deltaX, deltaY }) => {
    this.player && this.player.updateDirection(deltaX, deltaY);
  };

  onResize = ({ width, height, scale }) => {
    console.log('onResize', width, height, scale);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
  };

  onRender = delta => {
    this.player.update(delta);
    this.renderer.render(this.scene, this.camera);
  };
}
