import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

class Button extends React.PureComponent {
  render() {
    const size = 50 - 4
    const {style, onPress, id, onPressOut} = this.props
    return (
      <TouchableOpacity style={[style, {padding: 2}]} onPressOut={_=> onPressOut(id)} onPressIn={_=> {onPress(id)}}>
        <View style={{width: size, height: size, backgroundColor: 'rgba(128, 128, 128, 0.6)', borderRadius: 3}}>
        </View>
      </TouchableOpacity>
    )
  }
}

export default class Dpad extends React.Component {
  render() {
    const {onPress, onPressOut, style} = this.props
    return (
      <View pointerEvents={'box-none'} style={[styles.container, style]}>
        <View pointerEvents={'box-none'} style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Button onPressOut={onPressOut} onPress={onPress} id={0}
          />
        </View>
        <View pointerEvents={'box-none'} style={{flexDirection: 'row'}}>
          <Button onPressOut={onPressOut} onPress={onPress} id={1}
          />
          <Button onPressOut={onPressOut} onPress={onPress} id={2}
          />
          <Button onPressOut={onPressOut} onPress={onPress} id={3}
          />
        </View>
        <View pointerEvents={'box-none'} style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Button onPressOut={onPressOut} onPress={onPress} id={4}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    height: 50 * 3,
    width: 50 * 3
  }
});
