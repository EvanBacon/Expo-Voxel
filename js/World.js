// Author: Three.js - https://threejs.org/examples/?q=mine#webgl_geometry_minecraft_ao

import Expo from 'expo';
import React from 'react';
import {View, Dimensions} from 'react-native'
const {width, height} = Dimensions.get('window')
import * as THREE from 'three';
import ImprovedNoise from './ImprovedNoise'
const THREEView = Expo.createTHREEViewClass(THREE);

export default class World {
  width;
  height;
  data;
  mesh;

  constructor(width, depth) {
    this.width = width;
    this.depth = depth;
    this.data = this.generateHeight( width, depth );
  }

  isValidBlock = (x,y,z) => {
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      return false
    }

    return (x >= 0 && x < this.width &&
  			y >= 0 && y < this.width &&
  			z >= 0 && z < this.depth);
  }
  getBlock = (x,y,z) => {
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      return null
    }
    // x = Math.round(x)
    // y = Math.round(y)
    // z = Math.round(z)
    let key = `${x|0},${y|0},${z|0}`
    // console.log("VOXEL:: get block", this.blocks[key], key)
    return this.blocks[key];

    // return y > (( this.data[ x + z * this.width ] * 0.2 ) | 0) ? null : 1;

    // return blocks[(z*MAP_BLOCK_WIDTH*MAP_BLOCK_HEIGHT)+(y*MAP_BLOCK_WIDTH)+x];
    //
    // return null
  }

  getGeometry = async () => {
    if (this.mesh) {
      return this.mesh
    }

    await this.buildTerrain()

    return this.mesh
  }

  generateHeight( width, height ) {
    var data = [], perlin = new ImprovedNoise(),
    size = width * height, quality = 2, z = Math.random() * 100;
    for ( var j = 0; j < 4; j ++ ) {
      if ( j == 0 ) for ( var i = 0; i < size; i ++ ) data[ i ] = 0;
      for ( var i = 0; i < size; i ++ ) {
        var x = i % width, y = ( i / width ) | 0;
        data[ i ] += Math.max(0, perlin.noise( x / quality, y / quality, z + 64 ) * quality);
      }
      quality *= 4
    }
    return data;
  }
  blocks = {}

  getY = ( x, z ) => {
    return ( this.data[ x + z * this.width ] * 0.2 ) | 0;
  }

  _buildTerrain = (texture) => {
    // // sides
    const size = 1
    const half = size * 0.5
    var light = new THREE.Color( 0xffffff );
    var shadow = new THREE.Color( 0x505050 );
    var matrix = new THREE.Matrix4();


    var pxGeometry = new THREE.PlaneGeometry( size, size );
    pxGeometry.faces[ 0 ].vertexColors = [ light, shadow, light ];
    pxGeometry.faces[ 1 ].vertexColors = [ shadow, shadow, light ];
    pxGeometry.faceVertexUvs[ 0 ][ 0 ][ 0 ].y = 0.5;
    pxGeometry.faceVertexUvs[ 0 ][ 0 ][ 2 ].y = 0.5;
    pxGeometry.faceVertexUvs[ 0 ][ 1 ][ 2 ].y = 0.5;
    pxGeometry.rotateY( Math.PI / 2 );
    pxGeometry.translate( half, 0, 0 );

    var nxGeometry = new THREE.PlaneGeometry( size, size );
    nxGeometry.faces[ 0 ].vertexColors = [ light, shadow, light ];
    nxGeometry.faces[ 1 ].vertexColors = [ shadow, shadow, light ];
    nxGeometry.faceVertexUvs[ 0 ][ 0 ][ 0 ].y = 0.5;
    nxGeometry.faceVertexUvs[ 0 ][ 0 ][ 2 ].y = 0.5;
    nxGeometry.faceVertexUvs[ 0 ][ 1 ][ 2 ].y = 0.5;
    nxGeometry.rotateY( - Math.PI / 2 );
    nxGeometry.translate( - half, 0, 0 );

    var pyGeometry = new THREE.PlaneGeometry( size, size );
    pyGeometry.faces[ 0 ].vertexColors = [ light, light, light ];
    pyGeometry.faces[ 1 ].vertexColors = [ light, light, light ];
    pyGeometry.faceVertexUvs[ 0 ][ 0 ][ 1 ].y = 0.5;
    pyGeometry.faceVertexUvs[ 0 ][ 1 ][ 0 ].y = 0.5;
    pyGeometry.faceVertexUvs[ 0 ][ 1 ][ 1 ].y = 0.5;
    pyGeometry.rotateX( - Math.PI / 2 );
    pyGeometry.translate( 0, half, 0 );

    var py2Geometry = new THREE.PlaneGeometry( size, size );
    py2Geometry.faces[ 0 ].vertexColors = [ light, light, light ];
    py2Geometry.faces[ 1 ].vertexColors = [ light, light, light ];
    py2Geometry.faceVertexUvs[ 0 ][ 0 ][ 1 ].y = 0.5;
    py2Geometry.faceVertexUvs[ 0 ][ 1 ][ 0 ].y = 0.5;
    py2Geometry.faceVertexUvs[ 0 ][ 1 ][ 1 ].y = 0.5;
    py2Geometry.rotateX( - Math.PI / 2 );
    py2Geometry.rotateY( Math.PI / 2 );
    py2Geometry.translate( 0, half, 0 );

    var pzGeometry = new THREE.PlaneGeometry( size, size );
    pzGeometry.faces[ 0 ].vertexColors = [ light, shadow, light ];
    pzGeometry.faces[ 1 ].vertexColors = [ shadow, shadow, light ];
    pzGeometry.faceVertexUvs[ 0 ][ 0 ][ 0 ].y = 0.5;
    pzGeometry.faceVertexUvs[ 0 ][ 0 ][ 2 ].y = 0.5;
    pzGeometry.faceVertexUvs[ 0 ][ 1 ][ 2 ].y = 0.5;
    pzGeometry.translate( 0, 0, half );

    var nzGeometry = new THREE.PlaneGeometry( size, size );
    nzGeometry.faces[ 0 ].vertexColors = [ light, shadow, light ];
    nzGeometry.faces[ 1 ].vertexColors = [ shadow, shadow, light ];
    nzGeometry.faceVertexUvs[ 0 ][ 0 ][ 0 ].y = 0.5;
    nzGeometry.faceVertexUvs[ 0 ][ 0 ][ 2 ].y = 0.5;
    nzGeometry.faceVertexUvs[ 0 ][ 1 ][ 2 ].y = 0.5;
    nzGeometry.rotateY( Math.PI );
    nzGeometry.translate( 0, 0, -half );

    const worldHalfWidth = this.width / 2
    const worldHalfDepth = this.depth / 2
    const { getY } = this
    var geometry = new THREE.Geometry();
    for ( var z = 0; z < this.depth; z ++ ) {
      for ( var x = 0; x < this.width; x ++ ) {
        var h = getY( x, z );
        // console.log("VOXEL:: build env",h, {x,z})
        for ( var y = 0; y < this.width; y ++ ) {
          this.blocks[`${x},${y},${z}`] = (h < y ? 0 : 1)
        }

        matrix.makeTranslation(
          x,
          h,
          z
        );

        var px = getY( x + 1, z );
        var nx = getY( x - 1, z );
        var pz = getY( x, z + 1 );
        var nz = getY( x, z - 1 );

        var pxpz = getY( x + 1, z + 1 );
        var nxpz = getY( x - 1, z + 1 );
        var pxnz = getY( x + 1, z - 1 );
        var nxnz = getY( x - 1, z - 1 );

        var a = nx > h || nz > h || nxnz > h ? 0 : 1;
        var b = nx > h || pz > h || nxpz > h ? 0 : 1;
        var c = px > h || pz > h || pxpz > h ? 0 : 1;
        var d = px > h || nz > h || pxnz > h ? 0 : 1;

        if ( a + c > b + d ) {
          var colors = py2Geometry.faces[ 0 ].vertexColors;
          colors[ 0 ] = b === 0 ? shadow : light;
          colors[ 1 ] = c === 0 ? shadow : light;
          colors[ 2 ] = a === 0 ? shadow : light;
          var colors = py2Geometry.faces[ 1 ].vertexColors;
          colors[ 0 ] = c === 0 ? shadow : light;
          colors[ 1 ] = d === 0 ? shadow : light;
          colors[ 2 ] = a === 0 ? shadow : light;
          geometry.merge( py2Geometry, matrix );
        } else {
          var colors = pyGeometry.faces[ 0 ].vertexColors;
          colors[ 0 ] = a === 0 ? shadow : light;
          colors[ 1 ] = b === 0 ? shadow : light;
          colors[ 2 ] = d === 0 ? shadow : light;
          var colors = pyGeometry.faces[ 1 ].vertexColors;
          colors[ 0 ] = b === 0 ? shadow : light;
          colors[ 1 ] = c === 0 ? shadow : light;
          colors[ 2 ] = d === 0 ? shadow : light;
          geometry.merge( pyGeometry, matrix );
        }
        if ( ( px != h && px != h + 1 ) || x == 0 ) {
          var colors = pxGeometry.faces[ 0 ].vertexColors;
          colors[ 0 ] = pxpz > px && x > 0 ? shadow : light;
          colors[ 2 ] = pxnz > px && x > 0 ? shadow : light;
          var colors = pxGeometry.faces[ 1 ].vertexColors;
          colors[ 2 ] = pxnz > px && x > 0 ? shadow : light;
          geometry.merge( pxGeometry, matrix );
        }
        if ( ( nx != h && nx != h + 1 ) || x == this.width - 1 ) {
          var colors = nxGeometry.faces[ 0 ].vertexColors;
          colors[ 0 ] = nxnz > nx && x < this.width - 1 ? shadow : light;
          colors[ 2 ] = nxpz > nx && x < this.width - 1 ? shadow : light;
          var colors = nxGeometry.faces[ 1 ].vertexColors;
          colors[ 2 ] = nxpz > nx && x < this.width - 1 ? shadow : light;
          geometry.merge( nxGeometry, matrix );
        }
        if ( ( pz != h && pz != h + 1 ) || z == this.depth - 1 ) {
          var colors = pzGeometry.faces[ 0 ].vertexColors;
          colors[ 0 ] = nxpz > pz && z < this.depth - 1 ? shadow : light;
          colors[ 2 ] = pxpz > pz && z < this.depth - 1 ? shadow : light;
          var colors = pzGeometry.faces[ 1 ].vertexColors;
          colors[ 2 ] = pxpz > pz && z < this.depth - 1 ? shadow : light;
          geometry.merge( pzGeometry, matrix );
        }
        if ( ( nz != h && nz != h + 1 ) || z == 0 ) {
          var colors = nzGeometry.faces[ 0 ].vertexColors;
          colors[ 0 ] = pxnz > nz && z > 0 ? shadow : light;
          colors[ 2 ] = nxnz > nz && z > 0 ? shadow : light;
          var colors = nzGeometry.faces[ 1 ].vertexColors;
          colors[ 2 ] = nxnz > nz && z > 0 ? shadow : light;
          geometry.merge( nzGeometry, matrix );
        }
      }
    }

    return this.buildMesh(geometry, texture)
  }

  buildMesh = (geometry, image) => {
    this.mesh = new THREE.Mesh( geometry, this.buildTexture(image) );
    return this.mesh
  }

  buildTexture = (image) => {
    return new THREE.MeshLambertMaterial( { map: image, vertexColors: THREE.VertexColors } )
  }

  async buildTerrain() {
    const textureAsset = Expo.Asset.fromModule(require('../assets/images/material.png'));
    await textureAsset.downloadAsync();

    this.texture = THREEView.textureFromAsset(textureAsset);
    this.texture.magFilter = THREE.NearestFilter;
    this.texture.minFilter = THREE.LinearMipMapLinearFilter;

    return this._buildTerrain(this.texture)
  }
}
