import React from 'react';
import { View } from 'react-native';

import ControlButtons from './Controls/ControlButtons';
import Controls from './Controls/Controls';
import VoxelView from './VoxelView';

export default class App extends React.Component {
  render() {
    return (
      <View style={{ flex: 1 }}>
        <Controls
          update={event => this.gameView.updateJoystick(event)}
          updateDrag={event => this.gameView.updateWithDrag(event)}
        >
          <VoxelView ref={ref => (this.gameView = ref)} />
        </Controls>
        <ControlButtons />
      </View>
    );
  }
}
