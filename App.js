import '@expo/browser-polyfill';

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Game from './components/Game';
import AssetUtils from 'expo-asset-utils';
import Assets from './Assets';
import { THREE } from 'expo-three';
export default class App extends React.Component {
  state = {
    loading: true,
  };

  componentWillMount() {
    THREE.suppressExpoWarnings(true);
    this.preloadAssets();
  }
  componentWillUnmount() {
    THREE.suppressExpoWarnings(false);
  }

  get fonts() {
    let items = {};
    const keys = Object.keys(Assets.fonts || {});
    for (let key of keys) {
      const item = Assets.fonts[key];
      const name = key.substr(0, key.lastIndexOf('.'));
      items[name] = item;
    }
    return [items];
  }

  get files() {
    return [
      ...AssetUtils.arrayFromObject(Assets.images || {}),
      // ...AssetUtils.arrayFromObject(Assets.models || {})
    ];
  }

  get audio() {
    return AssetUtils.arrayFromObject(Assets.audio);
  }

  async preloadAssets() {
    await AssetUtils.cacheAssetsAsync({
      // fonts: this.fonts,
      files: this.files,
      // audio: this.audio,
    });
    this.setState({ loading: false });
  }

  get loading() {
    return <View />;
  }
  get screen() {
    return <Game />;
  }

  render() {
    return this.state.loading ? this.loading : this.screen;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
