import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Animated, StyleSheet } from 'react-native';

const PAD_RADIUS = 64;
const THUMB_RADIUS = 24;

const radiansBetweenPoints = (p1, p2) => Math.atan2(p2.y - p1.y, p2.x - p1.x);

const vectorSize = ({ x, y }) => Math.sqrt(x * x + y * y);
const transformPosition = ({ angle, distance }) => ({
  x: Math.cos(angle) * distance,
  y: Math.sin(angle) * distance,
});

class Joystick extends Component {
  static propTypes = {
    center: PropTypes.object,
    touchPosition: PropTypes.object,
    visible: PropTypes.bool,
    force: PropTypes.number,
  };

  animatedValue = new Animated.Value(0);
  angle = 0;
  speed = 0;

  componentWillReceiveProps({ visible }) {
    const { props } = this;
    if (props.visible != visible) {
      this.visible = visible;
    }
  }

  set visible(value) {
    Animated.timing(this.animatedValue, {
      toValue: value ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();

    if (!value) {
      this.speed = 0;
    }
  }

  get positionStyle() {
    const { center } = this.props;
    return {
      top: center.y - PAD_RADIUS,
      left: center.x - PAD_RADIUS,
    };
  }

  get animatedStyle() {
    const scale = this.animatedValue;
    return {
      transform: [{ scale }],
    };
  }

  get containerStyle() {
    return [styles.container, this.positionStyle, this.animatedStyle];
  }

  get normalizedTouch() {
    const { center, touchPosition } = this.props;
    return {
      x: center.x - touchPosition.x,
      y: center.y - touchPosition.y,
    };
  }

  get thumbPositionStyle() {
    const { center, touchPosition, force } = this.props;
    const { normalizedTouch } = this;
    const distance = Math.min(PAD_RADIUS, vectorSize(normalizedTouch));
    const angle = radiansBetweenPoints(center, touchPosition);
    const position = transformPosition({ angle, distance });

    this.angle = angle;
    this.speed = distance / PAD_RADIUS;

    return {
      top: PAD_RADIUS + position.y - THUMB_RADIUS,
      left: PAD_RADIUS + position.x - THUMB_RADIUS,
      transform: [{ scale: 1 + (force || 0) * 0.5 }],
    };
  }

  get thumbStyle() {
    return [this.thumbPositionStyle, styles.thumb];
  }

  render() {
    return (
      <Animated.View style={this.containerStyle}>
        <Animated.View style={this.thumbStyle} />
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    shadowColor: 'black',
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,

    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    width: PAD_RADIUS * 2,
    borderRadius: PAD_RADIUS,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_RADIUS * 2,
    borderRadius: THUMB_RADIUS,
    backgroundColor: 'white',
    aspectRatio: 1,
  },
});

export default Joystick;
