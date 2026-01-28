import { View } from 'react-native';
import InventoryListScreen from '../../features/superadmin/inventory/components/inventory-list-screen';

interface Props {
  route: {
    params: {
      hubId: string;
      hubName: string;
    };
  };
  navigation: any;
}

export default function InventoryScreen({ route }: Props) {
  const { hubId, hubName } = route.params;
  
  return (
    <View style={{ flex: 1 }}>
      <InventoryListScreen hubId={hubId} hubName={hubName} />
    </View>
  );
}
