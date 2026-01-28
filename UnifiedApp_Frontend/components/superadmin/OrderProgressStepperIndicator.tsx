import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/**
 * Order progress stepper (library-based variant)
 * Shows 4 stages: Pending -> Processing -> In-Transit -> Delivered | Cancelled
 * If an order is cancelled, we swap the last label to "cancelled" instead of "delivered".
 * Issue flag collapses the UI to a single "Issues" indicator.
 */
/**
 * Order progress stepper (library-based variant)
 * Normal flow granular stages: pending -> processing -> in-transit -> out-for-delivery -> delivered
 * Aggregated order.status remains 'processing' for all intermediate stages; backend provides deliveryStage.
 * If cancelled, we display a shortened flow ending in 'cancelled'.
 * Issue flag collapses the UI to a single "Issues" indicator.
 */
type Props = { status?: string | null; issueFlag?: boolean };

const customStyles = {
  stepIndicatorSize: 24,
  currentStepIndicatorSize: 28,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: '#2563EB',
  stepStrokeWidth: 2,
  stepStrokeFinishedColor: '#16A34A',
  stepStrokeUnFinishedColor: '#D1D5DB',
  separatorFinishedColor: '#16A34A',
  separatorUnFinishedColor: '#D1D5DB',
  stepIndicatorFinishedColor: '#16A34A',
  stepIndicatorUnFinishedColor: '#E5E7EB',
  stepIndicatorCurrentColor: '#2563EB',
  // Use a positive font size to avoid RN runtime error on Android
  stepIndicatorLabelFontSize: 12,
  currentStepIndicatorLabelFontSize: 12,
  labelColor: '#6B7280',
  currentStepLabelColor: '#111827',
  labelSize: 12,
};

function InlineStepper({ labels, current }: { labels: string[]; current: number }) {
  return (
    <View style={styles.row}>
      {labels.map((label, i) => {
        const active = i <= current;
        return (
          <View key={label + i} style={styles.stepWrapper}>
            <View style={[styles.circle, active && styles.circleActive]}>
              <Text style={[styles.circleText, active && styles.circleTextActive]}>{i + 1}</Text>
            </View>
            <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
            {i < labels.length - 1 && <View style={[styles.separator, i < current && styles.separatorActive]} />}
          </View>
        );
      })}
    </View>
  );
}

export default function OrderProgressStepperIndicator({ status, issueFlag }: Props) {
  // We allow hyphen or underscore forms; treat incoming aggregated status or granular stage.
  const normalized = (status || '').toLowerCase().replace('-', '_');

  const isCancelled = normalized === 'cancelled';
  // Use 5 steps for normal flow, 4 for cancelled (keeps UI compact for terminated orders)
  const labels = isCancelled
    ? ['pending', 'processing', 'in-transit', 'cancelled']
    : ['pending', 'processing', 'in-transit', 'out-for-delivery', 'delivered'];

  const current = useMemo(() => {
    if (issueFlag) return 0;
    switch (normalized) {
      case 'pending':
        return 0;
      case 'processing':
        return 1; // aggregated or granular 'processing'
      case 'in_transit':
        return 2;
      case 'out_for_delivery':
        return isCancelled ? 2 : 3;
      case 'delivered':
        return isCancelled ? 3 : 4;
      case 'cancelled':
        return labels.length - 1;
      default:
        return 0;
    }
  }, [normalized, issueFlag, isCancelled, labels.length]);

  if (issueFlag) {
    return <InlineStepper labels={['issues']} current={0} />;
  }
  return <InlineStepper labels={labels} current={current} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  stepWrapper: { flexDirection: 'row', alignItems: 'center' },
  circle: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  circleActive: { backgroundColor: '#2563EB' },
  circleText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  circleTextActive: { color: '#fff' },
  label: { fontSize: 11, color: '#6B7280', marginHorizontal: 6, textTransform: 'capitalize' },
  labelActive: { color: '#111827' },
  separator: { width: 30, height: 2, backgroundColor: '#D1D5DB', marginHorizontal: 4 },
  separatorActive: { backgroundColor: '#16A34A' },
});
