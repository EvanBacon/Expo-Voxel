import { createRouter } from '@expo/ex-navigation';

import HomeScreen from '../screens/HomeScreen';
import RootNavigation from './RootNavigation';

export default createRouter(() => ({
  home: () => HomeScreen,
  rootNavigation: () => RootNavigation,
}));
