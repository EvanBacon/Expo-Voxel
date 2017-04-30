// Author: Three.js - https://threejs.org/examples/?q=mine#webgl_geometry_minecraft_ao

import Expo from 'expo';
import React from 'react';
import {View} from 'react-native'
import * as THREE from 'three';
import ImprovedNoise from './ImprovedNoise'
const THREEView = Expo.createTHREEViewClass(THREE);
import * as World from './World'
export default class Chunk {
  data;
  mesh;

  constructor(x,y,z, perlin) {
    /// TODO: Abstract Noise
    this.data = this.generateHeight(new ImprovedNoise());
  }

  isValidBlock = (x,y,z) => {
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      return false
    }

    return (
      x >= 0 && x < World.CHUNK_WIDTH &&
  			y >= 0 && y < World.CHUNK_HEIGHT &&
  			z >= 0 && z < World.CHUNK_DEPTH);
  }
  getBlock = (x,y,z) => {
    if (isNaN(x) || isNaN(y) || isNaN(z)) {
      return null
    }
    let key = `${x|0},${y|0},${z|0}`
    return this.blocks[key];
  }

  setBlock = (x,y,z, type) => {
    if (!isValidBlock(x,y,z)) {
      return null
    }

    let key = `${x|0},${y|0},${z|0}`
    this.blocks[key] = type;
  }

  hasChanged = () => {

  }

  changeBlock = (x,y,z, type) => {
    this.setBlock(x, y, z, type);

    let cx = x / World.CHUNK_WIDTH;
    let cy = y / World.CHUNK_HEIGHT;
    let cz = z / World.CHUNK_DEPTH;

  	let chunk = getChunk(cx, cy, cz);
    chunk.hasChanged();

    //x neighbors
	if( x%World.CHUNK_WIDTH == 0 && isValidChunk(cx-1, cy, cz) ){
		chunk = getChunk(cx - 1, cy, cz);
    chunk.hasChanged();
	}
	else if( x%World.CHUNK_WIDTH == World.CHUNK_WIDTH-1 && isValidChunk(cx+1, cy, cz) ){
		chunk = getChunk(cx + 1, cy, cz);
    chunk.hasChanged();
	}
	//y neighbors
	if( y%World.CHUNK_HEIGHT == 0 && isValidChunk(cx, cy-1, cz) ){
		chunk = getChunk(cx, cy - 1, cz);
    chunk.hasChanged();
	}
	else if( y%World.CHUNK_HEIGHT == World.CHUNK_HEIGHT-1 && isValidChunk(cx, cy+1, cz) ){
		chunk = getChunk(cx, cy + 1, cz);
    chunk.hasChanged();
	}
	//z neighbors
	if( z%World.CHUNK_DEPTH == 0 && isValidChunk(cx, cy, cz-1) ){
		chunk = getChunk(cx, cy, cz - 1);
    chunk.hasChanged();
	}
	else if( z%World.CHUNK_DEPTH == World.CHUNK_DEPTH-1 && isValidChunk(cx, cy, cz+1) ){
		chunk = getChunk(cx, cy, cz + 1);
    chunk.hasChanged();
	}


  }


  getGeometry = () => {
    if (this.mesh) {
      return this.mesh
    }

   this.buildTerrain()

    return this.mesh
  }

  generateHeight(perlin ) {
    var data = [],
    size = World.CHUNK_WIDTH * World.CHUNK_HEIGHT, quality = 2, z = Math.random() * 100;
    for ( var j = 0; j < 4; j ++ ) {
      if ( j == 0 ) for ( var i = 0; i < size; i ++ ) data[ i ] = 0;
      for ( var i = 0; i < size; i ++ ) {
        var x = i % World.CHUNK_WIDTH, y = ( i / World.CHUNK_WIDTH ) | 0;
        data[ i ] += Math.max(0, perlin.noise( x / quality, y / quality, z + 64 ) * quality);
      }
      quality *= 4
    }
    return data;
  }
  blocks = {}

  getY = ( x, z ) => {
    return ( this.data[ x + z * World.CHUNK_WIDTH ] * 0.2 ) | 0;
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

    const worldHalfWidth = World.CHUNK_WIDTH / 2
    const worldHalfDepth = World.CHUNK_DEPTH / 2
    const { getY } = this
    var geometry = new THREE.Geometry();
    for ( var z = 0; z < World.CHUNK_DEPTH; z ++ ) {
      for ( var x = 0; x < World.CHUNK_WIDTH; x ++ ) {
        var h = getY( x, z );
        // console.log("VOXEL:: build env",h, {x,z})
        for ( var y = 0; y < World.CHUNK_HEIGHT; y ++ ) {
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
        if ( ( nx != h && nx != h + 1 ) || x == World.CHUNK_WIDTH - 1 ) {
          var colors = nxGeometry.faces[ 0 ].vertexColors;
          colors[ 0 ] = nxnz > nx && x < World.CHUNK_WIDTH - 1 ? shadow : light;
          colors[ 2 ] = nxpz > nx && x < World.CHUNK_WIDTH - 1 ? shadow : light;
          var colors = nxGeometry.faces[ 1 ].vertexColors;
          colors[ 2 ] = nxpz > nx && x < World.CHUNK_WIDTH - 1 ? shadow : light;
          geometry.merge( nxGeometry, matrix );
        }
        if ( ( pz != h && pz != h + 1 ) || z == World.CHUNK_DEPTH - 1 ) {
          var colors = pzGeometry.faces[ 0 ].vertexColors;
          colors[ 0 ] = nxpz > pz && z < World.CHUNK_DEPTH - 1 ? shadow : light;
          colors[ 2 ] = pxpz > pz && z < World.CHUNK_DEPTH - 1 ? shadow : light;
          var colors = pzGeometry.faces[ 1 ].vertexColors;
          colors[ 2 ] = pxpz > pz && z < World.CHUNK_DEPTH - 1 ? shadow : light;
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

  buildTerrain() {
    if (!this.texture) {
      this.texture = THREEView.textureFromAsset(this.textureAsset);
      this.texture.magFilter = THREE.NearestFilter;
      this.texture.minFilter = THREE.LinearMipMapLinearFilter;
    }

    return this._buildTerrain(this.texture)
  }
}
