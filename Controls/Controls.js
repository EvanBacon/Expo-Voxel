import { MultiTouchView } from 'expo-multi-touch';
import React, { Component } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

import Joystick from './Joystick';

export default class Controls extends Component {
  state = {
    touches: {},
    leftTouchId: null,
    rightTouchId: null,
  };

  static defaultProps = {
    touchProps: {},
  };

  componentWillMount() {
    const { width } = Dimensions.get('window');
    const halfWidth = width / 2;
    this.touchProps = {
      ...this.props.touchProps,
      onTouchBegan: event => {
        const { identifier } = event;
        this.setState(previous => ({
          touches: {
            ...previous.touches,
            [identifier]: event,
          },
        }));

        if (event.pageX < halfWidth) {
          if (this.state.leftTouchId == null) {
            this.setState(
              {
                leftTouchId: identifier,
              },
              () => {
                this.updateWithPad();
              },
            );
          }
        } else {
          if (this.state.rightTouchId == null) {
            this.setState(
              {
                rightTouchId: identifier,
              },
              () => {
                this.updateWithDrag(event, true);
              },
            );
          }
        }

        console.log('onTouchBegan');

        this.props.touchProps.onTouchBegan &&
          this.props.touchProps.onTouchBegan(event);
      },
      onTouchMoved: event => {
        const { identifier } = event;
        // this.setState(
        //   previous => ({
        //     touches: {
        //       ...previous.touches,
        //       [identifier]: event,
        //     },
        //   }),
        //   () => {
        if (event.pageX < halfWidth) {
          // if (this.state.leftTouchId && this.state.leftTouchId === identifier) {
          this.updateWithPad();
          // }
        } else {
          // if (
          //   // this.state.rightTouchId
          //   // && this.state.rightTouchId === identifier
          // ) {
          this.updateWithDrag(event, true);
          this.lastRightEvent;
          // }
        }
        //   },
        // );

        console.log('onTouchMoved');
        this.props.touchProps.onTouchMoved &&
          this.props.touchProps.onTouchMoved(event);
      },
      onTouchEnded: event => {
        this.onTouchEnded(event);
        console.log('onTouchEnded');

        this.props.touchProps.onTouchEnded &&
          this.props.touchProps.onTouchEnded(event);
      },
      onTouchCancelled: event => {
        this.onTouchEnded(event);
        this.props.touchProps.onTouchCancelled &&
          this.props.touchProps.onTouchCancelled(event);
      },
    };
  }

  onTouchEnded = event => {
    const { identifier } = event;
    this.setState(previous => ({
      touches: {
        ...previous.touches,
        [identifier]: null,
      },
    }));

    if (identifier === this.state.leftTouchId) {
      this.setState(
        {
          leftTouchId: null,
        },
        () => {
          this.updateWithPad(false);
        },
      );
    }
    if (identifier === this.state.rightTouchId) {
      this.setState(
        {
          rightTouchId: null,
        },
        () => {
          this.updateWithDrag(event, false);
        },
      );
    }
  };

  updateWithDrag = (event, touching) => {
    console.log('updateWithDrag:', event.pageX, event, touching);

    this.props.updateDrag(event, touching);
  };

  updateWithPad = (touching = true) => {
    if (!this.pad) {
      return;
    }
    let speed = 0;
    let angle = 0;
    if (touching) {
      speed = this.pad.speed;
      angle = this.pad.angle;
    }
    this.props.update({
      speed,
      angle,
      touching,
      force: this.leftTouchForce,
      pad: this.pad,
    });
  };

  leftTouchPosition = { x: 0, y: 0 };
  leftTouchStart = { x: 0, y: 0 };
  leftTouchForce = 0;
  render() {
    const { touches, leftTouchId } = this.state;

    const leftTouch = touches[leftTouchId];

    if (leftTouch && leftTouch.initialTouch) {
      this.leftTouchStart = {
        x: leftTouch.initialTouch.pageX,
        y: leftTouch.initialTouch.pageY,
      };
      this.leftTouchPosition = {
        x: leftTouch.pageX,
        y: leftTouch.pageY,
      };

      this.leftTouchForce = leftTouch.force || 0;
    }

    return (
      <MultiTouchView style={{ flex: 1 }} {...this.touchProps}>
        <View style={styles.container}>
          {this.props.children}

          <Joystick
            ref={ref => (this.pad = ref)}
            visible={!!leftTouchId}
            center={this.leftTouchStart}
            touchPosition={this.leftTouchPosition}
            force={this.leftTouchForce}
          />
        </View>
      </MultiTouchView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
