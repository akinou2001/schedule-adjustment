import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Switch,
  Button,
  Modal,
} from 'react-native';
import CalendarPicker from '../components/CalendarPicker';
import * as Clipboard from 'expo-clipboard';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

export default function App() {
  const [selectedDates, setSelectedDates] = useState([]);
  const [enablePriority, setEnablePriority] = useState(true);
  const [enableTime, setEnableTime] = useState(true);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState(null);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  // 時間を "hh:mm" 形式でフォーマットする関数
  const formatTime = (time) => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const updatePriorities = (dates) => {
    return dates.map((item, index) => {
      const date = new Date(item.rawDate);
      const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
      const formattedDate = `${date.getMonth() + 1}月${date.getDate()}日（${daysOfWeek[date.getDay()]}）`;
      const priority = enablePriority ? `第${index + 1}希望` : null;
  
      return {
        ...item,
        priority,
        formattedText: enablePriority
          ? `${priority}：${formattedDate} ${
              enableTime && item.startTime && item.endTime ? `${item.startTime}～${item.endTime}` : ''
            }`
          : `${formattedDate} ${
              enableTime && item.startTime && item.endTime ? `${item.startTime}～${item.endTime}` : ''
            }`,
      };
    });
  };  

  const addDateToList = (date) => {
    const formattedDate = date.toDateString();
    if (!selectedDates.some((item) => item.rawDate === formattedDate)) {
      if (enableTime) {
        setCurrentDate(formattedDate);
        setTimeModalVisible(true);
      } else {
        const newDates = [...selectedDates, { rawDate: formattedDate }];
        setSelectedDates(updatePriorities(newDates));
      }
    } else {
      Alert.alert('重複', 'この日付は既に選択されています');
    }
  };

  const confirmTimeSelection = () => {
    if (!startTime || !endTime || startTime >= endTime) {
      Alert.alert('エラー', '正しい開始時間と終了時間を選択してください');
      return;
    }

    const newDates = [
      ...selectedDates,
      {
        rawDate: currentDate,
        startTime: formatTime(startTime),
        endTime: formatTime(endTime),
      },
    ];
    setSelectedDates(updatePriorities(newDates));
    setTimeModalVisible(false);
    setStartTime(new Date());
    setEndTime(new Date());
    setCurrentDate(null);
  };

  const removeDate = (rawDate) => {
    const updatedDates = selectedDates.filter((item) => item.rawDate !== rawDate);
    setSelectedDates(updatePriorities(updatedDates));
  };

  const copyToClipboard = () => {
    const text = selectedDates.map((item) => item.formattedText).join('\n');
    Clipboard.setStringAsync(text)
      .then(() => Alert.alert('コピー完了', '選択した日付がクリップボードにコピーされました'))
      .catch(() => Alert.alert('エラー', 'クリップボードへのコピーに失敗しました'));
  };

  const renderSwipeableItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => (
        <View style={styles.swipeDeleteContainer}>
          <Button title="削除" onPress={() => removeDate(item.rawDate)} color="#fff" />
        </View>
      )}
    >
      <View style={styles.dateItemContainer}>
        <Text style={styles.dateItem}>{item.formattedText}</Text>
      </View>
    </Swipeable>
  );

  const handleToggle = (type) => {
    if (type === 'priority') {
      setEnablePriority((prev) => {
        const updated = !prev;
        setSelectedDates(updatePriorities(selectedDates));
        return updated;
      });
    } else if (type === 'time') {
      setEnableTime((prev) => {
        const updated = !prev;
        setSelectedDates(updatePriorities(selectedDates));
        return updated;
      });
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
  
          {/* カレンダー */}
          <CalendarPicker onDateSelected={(date) => addDateToList(date)} />
  
          {/* 選択した日付のリスト */}
          <FlatList
            data={selectedDates}
            keyExtractor={(item) => item.rawDate}
            renderItem={renderSwipeableItem}
            contentContainerStyle={styles.listContainer}
          />
  
          {/* コピーするボタン */}
          {selectedDates.length > 0 && (
            <View style={styles.copyButtonContainer}>
              <Button
                title="コピーする"
                onPress={copyToClipboard}
                color="blue"
              />
            </View>
          )}
        </View>
  
        {/* 時間設定モーダル */}
        {timeModalVisible && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={timeModalVisible}
            onRequestClose={() => setTimeModalVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>時間を選択</Text>
                <Text style={styles.timeLabel}>開始時間</Text>
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, date) => date && setStartTime(date)}
                />
                <Text style={styles.timeLabel}>終了時間</Text>
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  display="spinner"
                  onChange={(event, date) => date && setEndTime(date)}
                />
                <View style={styles.modalButtonContainer}>
                  <Button title="確定" onPress={confirmTimeSelection} color="#4CAF50" />
                  <Button title="キャンセル" onPress={() => setTimeModalVisible(false)} color="#F44336" />
                </View>
              </View>
            </View>
          </Modal>
        )}
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
  listContainer: {
    flexGrow: 1,
    paddingBottom: 20, // ボタンとの余白を確保
  },
  dateItemContainer: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ced4da',
  },
  swipeDeleteContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'red',
    width: 80,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  timeLabel: {
    fontSize: 16,
    marginBottom: 10,
    marginTop: 10,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
  },
  fixedButtonContainer: {
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#ced4da',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 10, // コピーするボタンとの間隔
  },
  copyButtonContainer: {
    marginTop: 10, // リストとの間隔
    alignItems: 'center',
    padding: 10,
  },
});