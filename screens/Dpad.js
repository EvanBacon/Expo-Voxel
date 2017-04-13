import React from 'react';
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default class Dpad extends React.Component {

  button = (style, onPress, id) => {
    const size = 50 - 4
    return (
      <TouchableOpacity style={[style, {padding: 2}]} onPressOut={_=> this.props.onPressOut(id)} onPressIn={_=> {onPress(id)}}>
        <View style={{width: size, height: size, backgroundColor: 'rgba(128, 128, 128, 0.6)', borderRadius: 3}}>
        </View>
      </TouchableOpacity>
    )
  }


  render() {

    return (
      <View pointerEvents={'box-none'} style={[styles.container, this.props.style]}>

        <View pointerEvents={'box-none'} style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          {this.button({}, this.props.onPress, 0)}
        </View>
        <View pointerEvents={'box-none'} style={{flexDirection: 'row'}}>
          {this.button({}, this.props.onPress, 1)}

          {this.button({}, this.props.onPress, 2)}

          {this.button({}, this.props.onPress, 3)}
        </View>
        <View pointerEvents={'box-none'} style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          {this.button({}, this.props.onPress, 4)}
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
  },
  developmentModeText: {
    marginBottom: 20,
    color: 'rgba(0,0,0,0.4)',
    fontSize: 15,
    textAlign: 'center',
  },
});
