import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

class ControlButton extends React.Component {
  render() {
    const { size, name, id, margin, color } = this.props;
    return (
      <View
        style={{
          aspectRatio: 1,
          minWidth: size,
          maxWidth: size,
          minHeight: size,
          maxHeight: size,
          overflow: 'hidden',
          borderTopLeftRadius: size / 2,
          borderBottomLeftRadius: size / 2,
          backgroundColor: color,
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPressIn={() => {
            global.buttonupdate &&
              global.buttonupdate({ name: id, active: true });
          }}
          onPressOut={() =>
            global.buttonupdate &&
            global.buttonupdate({ name: id, active: false })
          }
        >
          <Text style={{ color: 'white' }}>{name}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
export default ControlButton;
