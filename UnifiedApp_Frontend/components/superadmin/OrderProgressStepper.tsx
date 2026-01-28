import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  status?: string | null;
  issueFlag?: boolean;
};

function normalizeStatus(s?: string | null): string {
  if (!s) return 'pending';
  const v = s.toLowerCase().replace('_', '-');
  return v as any;
}

export default function OrderProgressStepper({ status, issueFlag }: Props) {
  const st = normalizeStatus(status);

  if (issueFlag) {
    return (
      <View style={styles.issuesContainer}>
        <View style={[styles.issuePill]}> 
          <Feather name="alert-triangle" size={14} color="#fff" />
          <Text style={styles.issueText}>Issues</Text>
        </View>
      </View>
    );
  }

  const lastStage = st === 'cancelled' ? 'cancelled' : 'delivered';
  const steps = ['pending', 'processing', 'in-transit', lastStage] as const;
  const currentIndex = Math.max(0, steps.findIndex(x => x === st));

  return (
    <View style={styles.container}>
      {steps.map((label, idx) => {
        const isCompleted = currentIndex > idx;
        const isActive = currentIndex === idx;
        const circleColor = isCompleted ? '#10B981' : isActive ? '#2563EB' : '#D1D5DB';
        const lineColor = currentIndex > idx ? '#10B981' : '#E5E7EB';
        const textColor = isCompleted || isActive ? '#111827' : '#6B7280';
        return (
          <View key={label} style={styles.stepWrap}>
            {/* line to the left (except for first) */}
            {idx !== 0 && <View style={[styles.line, { backgroundColor: lineColor }]} />}
            {/* node */}
            <View style={[styles.circle, { borderColor: circleColor }]}> 
              {isCompleted ? (
                <Feather name="check" size={12} color="#10B981" />
              ) : isActive ? (
                <View style={[styles.dot, { backgroundColor: circleColor }]} />
              ) : null}
            </View>
            {/* label */}
            <Text style={[styles.label, { color: textColor }]}> 
              {label.replace('in-transit', 'in transit')}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  stepWrap: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  line: {
    height: 2,
    flex: 1,
    marginHorizontal: 6,
    backgroundColor: '#E5E7EB',
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    position: 'absolute',
    top: 22,
    fontSize: 10,
    textTransform: 'capitalize',
  },
  issuesContainer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  issuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#DC2626',
  },
  issueText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
