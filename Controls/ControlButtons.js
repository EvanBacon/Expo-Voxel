import React from 'react';
import { View } from 'react-native';

import ControlButton from './ControlButton';

const buttonSize = 64;

class ControlButtons extends React.Component {
  render() {
    return (
      <View
        style={{
          position: 'absolute',
          top: '30%',
          bottom: 0,
          right: 0,
          justifyContent: 'space-around',
        }}>
        <ControlButton
          size={buttonSize}
          color={'rgba(255,0,255,0.6)'}
          id="A"
          name="Jump"
        />
      </View>
    );
  }
}

export default ControlButtons;
