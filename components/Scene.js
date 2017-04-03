// var createGame = require('voxel-engine')
var voxel = require('voxel')

var Mesh = require('voxel-mesh')
var voxelData = voxel.generator['Hilly Terrain']

var mesh = new Mesh(voxelData)
mesh.createSurfaceMesh()


import Expo from 'expo';
import React from 'react';

import * as THREE from 'three';
const THREEView = Expo.createTHREEViewClass(THREE);


export default class Scene extends React.Component {
  componentWillMount() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(75, 1, 1, 10000);
    this.camera.position.z = 1000;

    this.geometry = new THREE.BoxGeometry(200, 200, 200);
    this.material = new THREE.MeshBasicMaterial({
      color: 0xff0000,
    });

    // this.mesh = new THREE.Mesh(this.geometry, this.material);
    // this.scene.add(this.mesh);
    this.scene.add(mesh)

  }

  tick = (dt) => {
    this.mesh.rotation.x += 1 * dt;
    this.mesh.rotation.y += 2 * dt;
  }

  render() {
    return (
      <THREEView
        style={{ flex: 1 }}
        scene={this.scene}
        camera={this.camera}
        tick={this.tick}
      />
    );
  }
}
