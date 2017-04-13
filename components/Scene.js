'use strict';

import React from 'react';
import Expo from 'expo'
import { GLView, AppLoading } from 'expo';


const vertSrc = `
attribute vec2 position;
varying vec2 uv;
void main() {
  gl_Position = vec4(position.x, -position.y, 0.0, 1.0);
  uv = vec2(0.5, 0.3) * (position+vec2(1.0, 1.0));
}`;

const fragSrc = `
precision highp float;
varying vec2 uv;
void main () {
  gl_FragColor = vec4(uv.x, uv.y, 0.5, 1.0);
}`;


export default class BasicScene extends React.Component {
  static meta = {
    description: 'Basic Scene',
  };

  state = {
      ready: false,
    };

    componentDidMount() {
  (async () => {
    this._textureAsset = Expo.Asset.fromModule(
      require('../assets/images/background.png'));
    await this._textureAsset.downloadAsync();

    this._texturePlayer = Expo.Asset.fromModule(
      require('../assets/images/background.png'));
    await this._texturePlayer.downloadAsync();



    // this._playerAsset = Expo.Asset.fromModule(
    //   require('../assets/images/player.png'));
    // await this._playerAsset.downloadAsync();
    // console.log("asset", this._textureAsset)

    this.setState({ ready: true });
  })();
}


  render() {
    return this.state.ready ? (
     <Expo.GLView
       style={this.props.style}
       onContextCreate={this._onContextCreate}
     />
   ) : (
     <AppLoading />
   );

    // return (
    //   <GLView
    //     style={this.props.style}
    //     onContextCreate={this._onContextCreate}/>
    // );
  }
clientX = 0
clientY = 0

  _onContextCreate = (gl) => {
    gl.enableLogging = true;

    var world = new World( 16, 16, 16 );
    world.createFlatWorld( 6 );
    // Set up renderer
    var render = new Renderer( gl, this._textureAsset );
    render.setWorld( world, 8 );
    render.setPerspective( 60, 0.01, 200 );

    var physics = new Physics();
    physics.setWorld( world );
    //
    // // Create new local player
    var player = new Player();
    player.setWorld( world );


    // Compile vertex and fragment shader
    const vert = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vert, vertSrc);
    gl.compileShader(vert);
    const frag = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(frag, fragSrc);
    gl.compileShader(frag);

    // Link together into a program
    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);


var terrainTexture = render.texPlayer = gl.createTexture();
gl.bindTexture( gl.TEXTURE_2D, terrainTexture );
gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                128, 128, 0,
                gl.RGBA, gl.UNSIGNED_BYTE,
                this._texturePlayer);


    var terrainTexture = render.texTerrain = gl.createTexture();
    gl.bindTexture( gl.TEXTURE_2D, terrainTexture );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
    gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                    128, 128, 0,
                    gl.RGBA, gl.UNSIGNED_BYTE,
                    this._textureAsset);



    // Save position attribute
    const positionAttrib = gl.getAttribLocation(program, 'position');

    // Create buffer
    const buffer = gl.createBuffer();
    player.onMouseEvent( this.clientX + 0.01, this.clientY + 0.01, 1, false )
    // Animate!
    let skip = false;
    const animate = () => {
      try {
        if (skip) {
          // return;
        }

        // // Clear
        gl.clearColor(0, 0, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Bind buffer, program and position attribute for use
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.useProgram(program);
        gl.enableVertexAttribArray(positionAttrib);
        gl.vertexAttribPointer(positionAttrib, 2, gl.FLOAT, false, 0, 0);
        //
        // // Buffer data and draw!
        // const speed = this.props.speed || 1;
        // const a = 0.48 * Math.sin(0.001 * speed * Date.now()) + 0.5;
        // const verts = new Float32Array([
        //   -a, -a, a, -a, -a,  a,
        //   -a,  a, a, -a,  a,  a,
        // ]);
        // gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
        // gl.drawArrays(gl.TRIANGLES, 0, verts.length / 2);


        player.onMouseEvent( this.clientX + 0.01, this.clientY + 0.01, 3, false )
        // Simulate physics
        physics.simulate();

        // Update local player
        player.update();

        // Build a chunk
        render.buildChunks( 1 );

        // Draw world
        render.setCamera( player.getEyePos().toArray(), player.angles );
        render.draw();


        // Submit frame
        gl.flush();
        gl.endFrameEXP();
      } finally {
        skip = !skip;
        gl.enableLogging = false;
        requestAnimationFrame(animate);
      }
    };
    animate();
  }
}


  import Renderer from '../js/render'
  import World from '../js/world'
  import Physics from '../js/physics'
  import Player from '../js/player'

  /*

  import Renderer from '../js/render'
  import World from '../js/world'
  import Physics from '../js/physics'
  import Player from '../js/player'

      var world = new World( 16, 16, 16 );
      world.createFlatWorld( 6 );

      // // Set up renderer
      var render = new Renderer( gl );
      render.setWorld( world, 8 );
      render.setPerspective( 60, 0.01, 200 );
      //
      // // Create physics simulator
      var physics = new Physics();
      physics.setWorld( world );
      //
      // // Create new local player
      var player = new Player();
      player.setWorld( world );

  */
