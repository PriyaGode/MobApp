import GlobalOrdersScreen from './GlobalOrdersScreen';

// Orders screen - now using the actual GlobalOrdersScreen with API integration
export default function OrdersTabScreen({ navigation, route }: any) {
  return <GlobalOrdersScreen navigation={navigation} route={route} />;
}
