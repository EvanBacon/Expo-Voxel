import React from 'react';
import { PanResponder, View } from 'react-native';
import { DangerZone } from 'expo';
const { DeviceMotion } = DangerZone;
/*
Alicja Warchał made the DeviceMotion API 😱 😍
https://github.com/aalices

type Measurement = {
  acceleration: {
    x: number,
    y: number,
    z: number,
  },
  accelerationIncludingGravity: {
    x: number,
    y: number,
    z: number,
  },
  rotation: {
    alpha: number,
    beta: number,
    gamma: number,
  },
  rotationRate: {
    alpha: number,
    beta: number,
    gamma: number,
  },
  orientation: number,
};
*/

const EventTypes = {
    deviceorientation: 'deviceorientation',
    orientationchange: 'orientationchange',
}

export default (WrappedComponent) => {
    return class DeviceMotion extends React.Component {
        constructor(props) {
            super(props)
        }

        componentWillMount() {
            // DeviceMotion.setUpdateInterval(16);
            this._subscription = DeviceMotion.addListener(this._onDeviceOrientationChangeEvent);
        }
        componentWillUnmount() {
            DeviceMotion.removeListener(this._subscription);
            this._subscription = null;
        }

        _onDeviceOrientationChangeEvent = (measurement) => {
            this._measurement = measurement;
            this.update();
        }

        update = () => {
            const {
                acceleration,
                accelerationIncludingGravity,
                rotation,
                rotationRate,
                orientation
            } = this._measurement;

            window.orientation = orientation;

            const measurement = {
                alpha: rotation.alpha,
                beta: rotation.beta,
                gamma: rotation.gamma
            };

            this._emit(EventTypes.deviceorientation, measurement);
            this._emit(EventTypes.orientationchange, {});

        }

        _emit = (type, props) => {
            if (window && window.emitter) {
                window.emitter.emit(type, props);
            }
        }

        render = () => (<WrappedComponent  {...this.props} />)
    }
}
