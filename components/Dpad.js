import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import DirectionType from '../js/DirectionType'

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
          <Button onPressOut={onPressOut} onPress={onPress} id={DirectionType.front}
          />
        </View>
        <View pointerEvents={'box-none'} style={{flexDirection: 'row'}}>
          <Button onPressOut={onPressOut} onPress={onPress} id={DirectionType.left}
          />
        <Button onPressOut={onPressOut} onPress={onPress} id={DirectionType.up}
          />
        <Button onPressOut={onPressOut} onPress={onPress} id={DirectionType.right}
          />
        </View>
        <View pointerEvents={'box-none'} style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <Button onPressOut={onPressOut} onPress={onPress} id={DirectionType.back}
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
