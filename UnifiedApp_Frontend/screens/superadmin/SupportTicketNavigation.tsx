import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateTicketScreen from './CreateTicketScreen';
import SupportDashboard from './SupportDashboard';
import SupportTicketsScreen from './SupportTicketsScreen';
import TicketDetailScreenEnhanced from './TicketDetailScreenEnhanced';

const Stack = createNativeStackNavigator();

export default function SupportTicketNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="SupportDashboard"
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name="SupportDashboard" 
        component={SupportDashboard}
        options={{ title: 'Support Dashboard' }}
      />
      <Stack.Screen 
        name="SupportTickets" 
        component={SupportTicketsScreen}
        options={{ title: 'Support Tickets' }}
      />
      <Stack.Screen 
        name="CreateTicket" 
        component={CreateTicketScreen}
        options={{ title: 'Create Ticket' }}
      />
      <Stack.Screen 
        name="TicketDetailEnhanced" 
        component={TicketDetailScreenEnhanced}
        options={{ title: 'Ticket Details' }}
      />
    </Stack.Navigator>
  );
}
