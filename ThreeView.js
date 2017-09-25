import Expo from 'expo';
import React from 'react';
import { findNodeHandle, NativeModules, View } from 'react-native';
import ExpoTHREE from 'expo-three';
import PropTypes from 'prop-types';
export default class ThreeView extends React.Component {
    static propTypes = {
        style: View.propTypes.style,
        onContextCreate: PropTypes.func.isRequired,
        render: PropTypes.func.isRequired,
        enableAR: PropTypes.bool,
    }
    render = () => (
        <Expo.GLView
            nativeRef_EXPERIMENTAL={this._setNativeGLView}
            style={{ flex: 1 }}
            onContextCreate={this._onGLContextCreate} />
    );

    _setNativeGLView = ref => {
        this._nativeGLView = ref;
    };

    _onGLContextCreate = async (gl) => {
        // Stubbed out methods for shadow rendering
        gl.createRenderbuffer = (() => { });
        gl.bindRenderbuffer = (() => { });
        gl.renderbufferStorage = (() => { });
        gl.framebufferRenderbuffer = (() => { });

        let arSession;
        if (this.props.enableAR) {
            // Start AR session
            arSession = await NativeModules.ExponentGLViewManager.startARSession(
                findNodeHandle(this._nativeGLView)
            );
        }

        await this.props.onContextCreate(gl, arSession);

        const render = () => {
            const now = 0.001 * global.nativePerformanceNow();
            const dt = typeof lastFrameTime !== 'undefined'
                ? now - lastFrameTime
                : 0.16666;
            requestAnimationFrame(render);

            this.props.render(dt);
            // NOTE: At the end of each frame, notify `Expo.GLView` with the below
            gl.endFrameEXP();

            lastFrameTime = now;
        }
        render();
    }
}