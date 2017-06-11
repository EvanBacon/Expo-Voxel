import Expo, {AppLoading} from 'expo';
import React from 'react';
import { Platform, StatusBar, StyleSheet, View } from 'react-native';
// import Scene from './components/Scene';
import Voxel from './components/Voxel';
import './js/FakeBrowser';
console.ignoredYellowBox = ['THREE.WebGLRenderer'];

class AppContainer extends React.Component {
  state = {
    isSetup: false
  }
  componentWillMount() {
    this.setup();

  }

  setup = async () => {
this.setState({isSetup: true})
  }
  render = () => {
    if (this.state.isSetup)
    return (
      <View style={styles.container}>
        <Voxel
        />
        {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
        {Platform.OS === 'android' && <View style={styles.statusBarUnderlay} />}
      </View>
    );

    return <AppLoading />
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBarUnderlay: {
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
});

Expo.registerRootComponent(AppContainer);
