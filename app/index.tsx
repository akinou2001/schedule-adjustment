import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Switch,
  Button,
} from 'react-native';
import * as Calendar from 'react-native-calendar-events';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

export default function App() {
  const [selectedDates, setSelectedDates] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [enablePriority, setEnablePriority] = useState(true);
  const [enableTime, setEnableTime] = useState(true);

  // カレンダーイベントを取得
  useEffect(() => {
    requestCalendarPermission();
  }, []);

  const requestCalendarPermission = async () => {
    try {
      const { status } = await Calendar.requestPermissionsAsync();
      if (status === 'granted') {
        fetchCalendarEvents();
      } else {
        Alert.alert('エラー', 'カレンダーアクセスが許可されていません');
      }
    } catch (error) {
      Alert.alert('エラー', '権限リクエスト中に問題が発生しました', error.message);
    }
  };
  
  const fetchCalendarEvents = async () => {
    try {
      const startDate = new Date().toISOString();
      const endDate = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString();
      const events = await Calendar.getEventsAsync([], startDate, endDate);
  
      if (events.length === 0) {
        Alert.alert('情報', '表示できるカレンダーイベントがありません');
      } else {
        setCalendarEvents(events);
      }
    } catch (error) {
      Alert.alert('エラー', 'カレンダーイベントの取得に失敗しました');
    }
  };
  

  const handleToggle = (type) => {
    if (type === 'priority') {
      setEnablePriority((prev) => !prev);
    } else if (type === 'time') {
      setEnableTime((prev) => !prev);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>日程調整アプリ</Text>

          {/* 設定スイッチ */}
          <View style={styles.switchGroup}>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>優先順位を付ける</Text>
              <Switch value={enablePriority} onValueChange={() => handleToggle('priority')} />
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>時間を追加</Text>
              <Switch value={enableTime} onValueChange={() => handleToggle('time')} />
            </View>
          </View>

          {/* カレンダーイベントをリスト表示 */}
          <Text style={styles.sectionTitle}>カレンダーイベント</Text>
          <FlatList
            data={calendarEvents}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.eventItem}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <Text style={styles.eventTime}>
                  {new Date(item.startDate).toLocaleString()} ～{' '}
                  {new Date(item.endDate).toLocaleString()}
                </Text>
              </View>
            )}
          />

          {/* 選択した日付のリスト */}
          <Text style={styles.sectionTitle}>選択した日程</Text>
          <FlatList
            data={selectedDates}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.dateItemContainer}>
                <Text style={styles.dateItem}>{item}</Text>
              </View>
            )}
          />

          {/* コピーするボタン */}
          {selectedDates.length > 0 && (
            <View style={styles.copyButtonContainer}>
              <Button title="コピーする" onPress={() => Alert.alert('コピー', '実装中')} />
            </View>
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  switchGroup: {
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  switchLabel: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  eventItem: {
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    borderRadius: 5,
    marginBottom: 10,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  eventTime: {
    fontSize: 16,
    color: '#555',
  },
  dateItemContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
  },
  dateItem: {
    fontSize: 18,
  },
  copyButtonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
