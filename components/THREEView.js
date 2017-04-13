import Expo, {GLView} from 'expo';
import React, { PropTypes } from 'react';
import {View, Dimensions} from 'react-native'
const {width, height} = Dimensions.get('window')
import * as THREE from 'three';

const skyColor = 0xb2d0ff

export default class THREEView extends React.Component {
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
