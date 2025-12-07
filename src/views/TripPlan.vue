<template>
  <div id="trip-plan-content">

    <div class="trip-header-placeholder">
      <v-container>
        <div class="header-top">
          <div class="header-titles">
            <div class="d-flex align-center">
              <h1>{{ tripTitle || '行程規劃' }}</h1>
              <v-btn v-if="isEditMode" icon="mdi-pencil" variant="text" size="small" color="primary" class="ml-2"
                @click="openTripMetaModal(false)" />
            </div>
            <p class="subtitle">{{ tripCity ? tripCity + ' | ' : '' }}{{ tripDateRange }}</p>
          </div>

          <div class="header-controls">
            <v-tooltip text="切換行程">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon color="secondary" variant="text" @click="openTitleSelectionModal">
                  <v-icon size="24">mdi-format-list-bulleted</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip text="開啟地圖">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" icon color="primary" variant="text" :href="mapBookmarkUrl" target="_blank">
                  <v-icon size="24">mdi-map-marker-multiple</v-icon>
                </v-btn>
              </template>
            </v-tooltip>

            <v-tooltip :text="isEditMode ? '完成編輯' : '編輯行程'">
              <template v-slot:activator="{ props }">
                <v-btn v-if="canEdit" v-bind="props" :color="isEditMode ? 'success' : 'primary'" icon variant="text"
                  @click="toggleEditMode">
                  <v-icon>{{ isEditMode ? 'mdi-check' : 'mdi-pencil' }}</v-icon>
                </v-btn>
              </template>
            </v-tooltip>
          </div>
        </div>
      </v-container>
    </div>

    <nav v-if="!isLoading" class="day-nav" :class="{ hide: !navIsVisible }" style="top: 64px;">
      <div class="nav-container" ref="navContainerRef">
        <v-btn v-if="isEditMode && appData.days.length > 0" icon="mdi-minus-circle-outline" size="small" variant="text" color="error" class="mr-1" @click="deleteFirstDay" title="移除第一天" />
        
        <button v-for="(day, index) in appData.days" :key="index"
          :class="['nav-btn', { active: index === currentDayIndex }]" @click="changeDay(index)">
          {{ day.day }} <span style="font-size: 0.8em; opacity: 0.8;">({{ formatDayDate(day.fullDate) }})</span>
        </button>
        
        <div v-if="isEditMode" class="d-flex align-center">
            <v-btn v-if="appData.days.length > 0" icon="mdi-minus-circle-outline" size="small" variant="text" color="error" class="ml-1" @click="deleteLastDay" title="移除最後一天" />
            <v-btn icon="mdi-plus" size="small" variant="text" class="ml-1" @click="startAddDay" title="新增天數" />
        </div>
      </div>
    </nav>

    <div class="schedule-container">
      <div v-if="!isLoading && appData.days && appData.days.length > 0">
        <div class="text-center position-relative">
          <h2 class="day-theme">
            {{ currentDay.theme }}
            <v-btn v-if="isEditMode" icon="mdi-pencil" variant="text" size="small" color="primary"
              class="position-absolute" @click="startEditDay" />
          </h2>
        </div>

        <div class="timeline">
          <div v-for="(event, eventIndex) in currentDay.events" :key="eventIndex"
            :id="`card-${currentDayIndex}-${eventIndex}`" class="event-card">

            <div class="event-header">
              <span class="event-time">{{ event.time }}</span>
              <div v-if="isEditMode">
                <v-btn icon="mdi-pencil" size="x-small" variant="text" color="primary"
                  @click="startEditEvent(eventIndex)" />
                <v-btn icon="mdi-delete" size="x-small" variant="text" color="error" @click="deleteEvent(eventIndex)" />
              </div>
            </div>

            <div class="event-location-group">
              <div class="event-location">
                {{ event.location }}
                <a v-if="event.mapURL" :href="event.mapURL" target="_blank" class="text-secondary ml-2">
                  <v-icon size="18">mdi-map-marker</v-icon>
                </a>
                <a v-if="event.noteURL" :href="event.noteURL" target="_blank" class="text-secondary ml-2"
                  style="text-decoration: none;">
                  🚀
                </a>
              </div>
            </div>

            <div class="mb-3">
              <span :class="['badge', getTransportClass(event.transportType)]">
                {{ getTransportIcon(event.transportType) }}
                <span>{{ event.transport }}</span>
              </span>
            </div>

            <div v-if="event.notes" class="event-notes">
              <div :style="{ maxHeight: expandedNotes[eventIndex] ? 'none' : '60px', overflow: 'hidden' }"
                v-html="formatNotes(event.notes)" />
              <v-btn variant="text" density="compact" size="small" color="secondary" class="mt-2 px-0"
                @click="expandedNotes[eventIndex] = !expandedNotes[eventIndex]">
                {{ expandedNotes[eventIndex] ? '收起' : '展開更多' }}
              </v-btn>
            </div>
          </div>
        </div>

        <v-btn v-if="isEditMode" block color="secondary" variant="tonal" class="mt-4" @click="startAddEvent">
          <v-icon start>mdi-plus</v-icon> 新增行程
        </v-btn>

      </div>
      <div v-else class="text-center py-12">
        <v-progress-circular v-if="isLoading" indeterminate color="primary" />
        <h3 v-else class="text-muted">暫無行程資料，請選擇或新增行程。</h3>
        <v-btn v-if="!isLoading && isEditMode" color="primary" variant="flat" class="mt-4" @click="startAddDay">
            <v-icon start>mdi-plus</v-icon> 新增天數
        </v-btn>
      </div>
    </div>

    <v-dialog v-model="titleSelectionModalVisible" max-width="600px">
      <v-card class="pa-4 rounded-xl">
        <v-card-title class="d-flex justify-space-between align-center font-weight-bold">
          選擇行程
          <v-btn v-if="canEdit" color="primary" variant="flat" size="small" @click="createNewTrip">
            <v-icon start>mdi-plus</v-icon> 建立新行程
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-table hover>
            <thead>
              <tr>
                <th class="text-left">城市</th>
                <th class="text-left">標題</th>
                <th class="text-left">日期</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="trip in tripList" :key="trip.id" @click="selectTrip(trip)" style="cursor: pointer;"
                :class="{ 'bg-grey-lighten-4': appData.id === trip.id }">
                <td>{{ trip.city }}</td>
                <td class="font-weight-bold">{{ trip.title }}</td>
                <td class="text-caption">{{ trip.start_date }} ~ {{ trip.end_date }}</td>
              </tr>
              <tr v-if="tripList.length === 0 && !isLoadingTitles">
                <td colspan="3" class="text-center text-muted">無資料</td>
              </tr>
            </tbody>
          </v-table>
          <v-progress-circular v-if="isLoadingTitles" indeterminate color="primary" class="d-block mx-auto mt-4" />
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="tripMetaModalVisible" persistent max-width="400px">
      <v-card class="pa-4 rounded-xl">
        <v-card-title class="text-center font-weight-bold">
          {{ appData.id ? '編輯行程資訊' : '建立新行程' }}
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="saveTripMeta">
            <v-text-field label="標題" v-model="tripMetaData.title" variant="outlined" density="compact" class="mb-2"
              required />
            <v-text-field label="城市" v-model="tripMetaData.city" variant="outlined" density="compact" class="mb-2" />
            <div class="d-flex justify-end gap-2 mt-4">
              <v-btn v-if="appData.id" variant="text" color="error" @click="deleteTripHandler">
                      刪除行程
                  </v-btn>
                  <div v-else></div> <div class="d-flex gap-2">
                      <v-btn variant="text" @click="tripMetaModalVisible = false">取消</v-btn>
                      <v-btn color="primary" type="submit">確認</v-btn>
                  </div>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dayModalVisible" max-width="400px">
      <v-card class="pa-4 rounded-xl">
        <v-card-title class="text-center font-weight-bold">
          {{ isNewDay ? '新增天數' : '編輯天數' }}
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleSaveDay">
            <v-text-field type="date" label="日期" v-model="dayModalData.fullDate" variant="outlined" density="compact"
              class="mb-2" required :disabled="true" />
            <v-text-field label="主題" v-model="dayModalData.theme" variant="outlined" density="compact" class="mb-2" />
            <v-alert v-if="dayError" type="error" density="compact" variant="tonal" class="mb-2">
              {{ dayError }}
            </v-alert>
            <div class="d-flex justify-end gap-2 mt-4">
              <v-btn variant="text" @click="dayModalVisible = false">取消</v-btn>
              <v-btn color="secondary" type="submit">儲存</v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="dateRangeModalVisible" max-width="400px">
        <v-card class="pa-4 rounded-xl">
            <v-card-title class="text-center font-weight-bold">
                快速新增天數區間
            </v-card-title>
            <v-card-text>
                <v-form @submit.prevent="handleSaveDateRange">
                    <v-text-field type="date" label="開始日期" v-model="dateRangeData.startDate" variant="outlined" density="compact" class="mb-2" required />
                    <v-text-field type="date" label="結束日期" v-model="dateRangeData.endDate" variant="outlined" density="compact" class="mb-2" required />
                    <v-alert v-if="dateRangeError" type="error" density="compact" variant="tonal" class="mb-2">
                        {{ dateRangeError }}
                    </v-alert>
                    <div class="d-flex justify-end gap-2 mt-4">
                        <v-btn variant="text" @click="dateRangeModalVisible = false">取消</v-btn>
                        <v-btn color="primary" type="submit">確認新增</v-btn>
                    </div>
                </v-form>
            </v-card-text>
        </v-card>
    </v-dialog>

    <v-dialog v-model="modalVisible" max-width="500px">
      <v-card class="modal-content pa-4 rounded-xl">
        <v-card-title class="text-center font-weight-bold">
          {{ isNewEvent ? '新增行程' : '編輯行程' }}
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleSaveEvent">
            <v-row dense>
              <v-col cols="12">
                <v-text-field label="時間" v-model="modalEventData.time" variant="outlined" density="compact"
                  hint="格式: HH:MM" />
              </v-col>
              <v-col cols="12">
                <v-text-field label="地點/活動" v-model="modalEventData.location" variant="outlined" density="compact" />
              </v-col>
              <v-col cols="12">
                <v-select label="交通方式類型" v-model="modalEventData.transportType"
                  :items="['飛機', '大眾運輸', '汽車', '步行', '船']" variant="outlined" density="compact" />
              </v-col>
              <v-col cols="12">
                <v-text-field label="交通方式 (自由輸入)" v-model="modalEventData.transport" variant="outlined" density="compact" />
              </v-col>
              <v-col cols="12">
                <v-text-field label="地圖連結" v-model="modalEventData.mapURL" variant="outlined" density="compact"
                  prepend-inner-icon="mdi-map-marker" />
              </v-col>
              <v-col cols="12">
                <v-text-field label="備註連結" v-model="modalEventData.noteURL" variant="outlined" density="compact"
                  prepend-inner-icon="mdi-link" />
              </v-col>
              <v-col cols="12">
                <v-textarea label="詳細備註" v-model="modalEventData.notes" variant="outlined" density="compact" rows="3" />
              </v-col>
            </v-row>
            <div class="d-flex justify-end gap-2 mt-4">
              <v-btn variant="text" @click="modalVisible = false">取消</v-btn>
              <v-btn color="secondary" type="submit">儲存</v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="toast.visible" :color="toast.color" location="top" timeout="2000">
      {{ toast.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { fetchTripData, fetchAllTripTitle, saveTripData, deleteTrip } from '../lib/supabaseTrips';
import { useAuthStore } from '../stores/useAuthStore';

const mapBookmarkUrl = "https://www.google.com/maps/d/u/0/edit?mid=1pJlG73WanZkVkTSFvt3GLpMCDVU8heQ&ll=13.798196927110428%2C100.54907266665649&z=17";

const authStore = useAuthStore();

const appData = ref({ id: null, days: [] });
const tripTitle = ref('');
const tripCity = ref('');

const currentDayIndex = ref(0);
const isEditMode = ref(false);
const modalVisible = ref(false);
const isNewEvent = ref(false);
const isLoading = ref(true);
const navIsVisible = ref(true);

const lastScrollY = ref(0);
const expandedNotes = reactive({});

const modalEventData = reactive({
  dayIndex: -1,
  eventIndex: -1,
  time: '',
  location: '',
  mapURL: '',
  noteURL: '',
  transportType: '步行',
  transport: '',
  notes: '',
});

const toast = reactive({
  visible: false,
  message: '',
  color: 'success',
});

const titleSelectionModalVisible = ref(false);
const tripList = ref([]);
const isLoadingTitles = ref(true);

const tripMetaModalVisible = ref(false);
const tripMetaData = reactive({ title: '', city: '' });

const dayModalVisible = ref(false);
const isNewDay = ref(false);
const dayError = ref('');
const dayModalData = reactive({
  fullDate: '',
  theme: '',
});

const dateRangeModalVisible = ref(false);
const dateRangeError = ref('');
const dateRangeData = reactive({
    startDate: '',
    endDate: '',
});

const canEdit = computed(() => {
  const role = authStore.role;
  return role === 'admin' || role === 'editor';
});

const currentDay = computed(() => {
  return appData.value.days[currentDayIndex.value] || { events: [], theme: '' };
});

const tripDateRange = computed(() => {
  if (!appData.value.days || appData.value.days.length === 0) return '未設定日期';
  const firstDay = appData.value.days[0].fullDate;
  const lastDay = appData.value.days[appData.value.days.length - 1].fullDate;
  const start = firstDay.replace(/-/g, '/');
  const end = lastDay.replace(/-/g, '/');
  return `${start} - ${end}`;
});

const showToast = (message, color = 'info') => {
  toast.message = message;
  toast.color = color;
  toast.visible = true;
};

const formatDayDate = (fullDate) => {
  if (!fullDate) return '';
  const dateObj = new Date(fullDate);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const month = dateObj.getMonth() + 1;
  const date = dateObj.getDate();
  const weekday = weekdays[dateObj.getDay()];
  return `${month}/${date} ${weekday}`;
};

const getTransportIcon = (transportType) => {
  const t = (transportType || '').toLowerCase();
  if (t.includes('飛機')) return '✈️';
  if (t.includes('大眾運輸')) return '🚆';
  if (t.includes('汽車')) return '🚗';
  if (t.includes('船')) return '⛴️';
  return '🚶';
};

const getTransportClass = (transportType) => {
  const t = (transportType || '').toLowerCase();
  if (t.includes('飛機')) return 'trans-plane';
  if (t.includes('大眾運輸')) return 'trans-public';
  if (t.includes('汽車')) return 'trans-car';
  if (t.includes('船')) return 'trans-boat';
  return 'trans-walk';
};

const getSortableTime = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return '99:99';
  const parts = timeStr.split('-');
  return parts[0].trim();
};

const sortEventsByTime = (events) => {
  events.sort((a, b) => {
    const timeA = getSortableTime(a.time);
    const timeB = getSortableTime(b.time);
    return timeA.localeCompare(timeB);
  });
};

const formatNotes = (text) => {
  if (!text) return "";
  const lines = text.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);
  let html = '<ul style="padding-left: 20px; margin: 0;">';
  lines.forEach(line => {
    html += `<li style="margin-bottom: 4px;">${line}</li>`;
  });
  html += '</ul>';
  return html;
};

const loadTripList = async () => {
  isLoadingTitles.value = true;
  const trips = await fetchAllTripTitle();
  isLoadingTitles.value = false;
  if (trips) {
    tripList.value = trips;
  }
};

const loadData = async (id) => {
  isLoading.value = true;
  const result = await fetchTripData(id);

  if (result.success) {
    appData.value = { id: id, days: result.data.days || [] };
    tripTitle.value = result.data.title || '';
    tripCity.value = result.data.city || '';
    initApp();
  } else {
    showToast(`載入失敗: ${result.message}`, 'error');
    appData.value = { id: null, days: [] };
    tripTitle.value = '';
    tripCity.value = '';
    isLoading.value = false;
  }
};

const saveData = async () => {
  const daysToSave = appData.value.days.map(day => ({
    ...day,
    events: day.events.map(event => {
      const { transportType, ...rest } = event;
      return transportType ? event : rest;
    })
  }));

  const dataToSave = { id: appData.value.id, days: daysToSave };
  const result = await saveTripData(dataToSave, tripCity.value, tripTitle.value);
  if (result.success) {
    showToast(result.message, 'success');
    if (result.newId) {
      appData.value.id = result.newId;
    }
    await loadTripList();
  } else {
    showToast(result.message, 'error');
  }
};

const determineInitialDay = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  if (!appData.value.days || appData.value.days.length === 0) {
    currentDayIndex.value = 0;
    return;
  }

  const foundIndex = appData.value.days.findIndex(d => d.fullDate === todayStr);
  if (foundIndex !== -1) {
    currentDayIndex.value = foundIndex;
  } else {
    currentDayIndex.value = 0;
  }
};

const initApp = () => {
  determineInitialDay();
  updateNavState();
  isLoading.value = false;
};

const changeDay = (index) => {
  currentDayIndex.value = index;
  updateNavState();
  Object.keys(expandedNotes).forEach(key => expandedNotes[key] = false);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const updateNavState = () => {
  nextTick(() => {
    const navContainer = document.querySelector('.nav-container');
    const activeBtn = navContainer?.querySelector('.nav-btn.active');
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });
};

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value;
};

const startAddEvent = () => {
  isNewEvent.value = true;
  modalEventData.dayIndex = currentDayIndex.value;
  modalEventData.eventIndex = -1;
  modalEventData.time = '';
  modalEventData.location = '';
  modalEventData.mapURL = '';
  modalEventData.noteURL = '';
  modalEventData.transportType = '步行';
  modalEventData.transport = '';
  modalEventData.notes = '';
  modalVisible.value = true;
};

const startEditEvent = (eventIndex) => {
  isNewEvent.value = false;
  const event = currentDay.value.events[eventIndex];
  modalEventData.dayIndex = currentDayIndex.value;
  modalEventData.eventIndex = eventIndex;
  modalEventData.time = event.time;
  modalEventData.location = event.location;
  modalEventData.mapURL = event.mapURL || '';
  modalEventData.noteURL = event.noteURL || '';
  modalEventData.transportType = event.transportType;
  modalEventData.transport = event.transport || '';
  modalEventData.notes = event.notes;
  modalVisible.value = true;
};

const handleSaveEvent = () => {
  const dayIndex = modalEventData.dayIndex;
  const eventIndex = modalEventData.eventIndex;

  const newEvent = {
    time: modalEventData.time,
    location: modalEventData.location,
    mapURL: modalEventData.mapURL.trim(),
    noteURL: modalEventData.noteURL.trim(),
    transportType: modalEventData.transportType,
    transport: modalEventData.transport,
    notes: modalEventData.notes,
  };

  if (eventIndex === -1) {
    appData.value.days[dayIndex].events.push(newEvent);
  } else {
    appData.value.days[dayIndex].events[eventIndex] = newEvent;
  }

  sortEventsByTime(appData.value.days[dayIndex].events);
  saveData();
  modalVisible.value = false;
};

const deleteEvent = (eventIndex) => {
  if (!confirm("確定要刪除此行程嗎？")) return;
  const dayIndex = currentDayIndex.value;
  appData.value.days[dayIndex].events.splice(eventIndex, 1);
  saveData();
  sortEventsByTime(appData.value.days[dayIndex].events);
};

const openTitleSelectionModal = () => {
  loadTripList();
  titleSelectionModalVisible.value = true;
};

const selectTrip = async (trip) => {
  titleSelectionModalVisible.value = false;
  isLoading.value = true;
  await loadData(trip.id);
};

const createNewTrip = () => {
  titleSelectionModalVisible.value = false;
  appData.value = { id: null, days: [] };
  tripTitle.value = '';
  tripCity.value = '';
  isLoading.value = false;
  openTripMetaModal(true);
};

const openTripMetaModal = (isNew) => {
  tripMetaData.title = tripTitle.value;
  tripMetaData.city = tripCity.value;
  tripMetaModalVisible.value = true;
};

const saveTripMeta = () => {
  tripTitle.value = tripMetaData.title;
  tripCity.value = tripMetaData.city;
  tripMetaModalVisible.value = false;
  if (appData.value.days.length > 0) {
    saveData();
  }
};

const reindexDays = () => {
  appData.value.days.forEach((day, index) => {
    day.day = `Day ${index + 1}`;
  });
};

const deleteFirstDay = () => {
    if (!appData.value.days || appData.value.days.length === 0) return;
    if (!confirm('確定要移除第一天嗎？')) return;
    
    appData.value.days.shift();
    reindexDays();
    if (currentDayIndex.value >= appData.value.days.length) {
        currentDayIndex.value = Math.max(0, appData.value.days.length - 1);
    }
    saveData();
};

const deleteLastDay = () => {
    if (!appData.value.days || appData.value.days.length === 0) return;
    if (!confirm('確定要移除最後一天嗎？')) return;

    appData.value.days.pop();
    if (currentDayIndex.value >= appData.value.days.length) {
        currentDayIndex.value = Math.max(0, appData.value.days.length - 1);
    }
    saveData();
};

const startAddDay = () => {
  dayError.value = '';
  dateRangeError.value = '';

  if (appData.value.days.length === 0) {
    const today = new Date().toISOString().substring(0, 10);
    dateRangeData.startDate = today;
    dateRangeData.endDate = today;
    dateRangeModalVisible.value = true;
    return;
  }

  isNewDay.value = true;
  let nextDate = new Date();
  if (appData.value.days.length > 0) {
    const lastDay = appData.value.days[appData.value.days.length - 1].fullDate;
    nextDate = new Date(lastDay);
    nextDate.setDate(nextDate.getDate() + 1);
  }
  const y = nextDate.getFullYear();
  const m = String(nextDate.getMonth() + 1).padStart(2, '0');
  const d = String(nextDate.getDate()).padStart(2, '0');

  dayModalData.fullDate = `${y}-${m}-${d}`;
  dayModalData.theme = '';
  dayModalVisible.value = true;
};

const startEditDay = () => {
  isNewDay.value = false;
  dayError.value = '';
  const day = appData.value.days[currentDayIndex.value];
  dayModalData.fullDate = day.fullDate;
  dayModalData.theme = day.theme;
  dayModalVisible.value = true;
};

const handleSaveDay = () => {
  dayError.value = '';
  const newFullDate = dayModalData.fullDate;
  const newDateObj = new Date(newFullDate);
  const m = newDateObj.getMonth() + 1;
  const d = newDateObj.getDate();
  const shortDate = `${m}/${d}`;

  if (isNewDay.value) {
    appData.value.days.push({
      date: shortDate,
      day: '',
      fullDate: newFullDate,
      theme: dayModalData.theme,
      events: []
    });
  } else {
    const dayToEdit = appData.value.days[currentDayIndex.value];
    dayToEdit.theme = dayModalData.theme;
  }

  appData.value.days.sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

  for (let i = 0; i < appData.value.days.length - 1; i++) {
    const curr = new Date(appData.value.days[i].fullDate);
    const next = new Date(appData.value.days[i + 1].fullDate);
    const diffTime = Math.abs(next - curr);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      if (isNewDay.value) {
        appData.value.days = appData.value.days.filter(d => d.fullDate !== newFullDate);
      }
      dayError.value = '日期必須連續，不可有中斷的天數。';
      return;
    }
  }

  reindexDays();

  if (isNewDay.value) {
    const idx = appData.value.days.findIndex(d => d.fullDate === newFullDate);
    currentDayIndex.value = idx;
  }

  dayModalVisible.value = false;
  saveData();
};

const handleSaveDateRange = () => {
    dateRangeError.value = '';
    const start = new Date(dateRangeData.startDate);
    const end = new Date(dateRangeData.endDate);

    if (start > end) {
        dateRangeError.value = '結束日期必須晚於或等於開始日期。';
        return;
    }

    const newDays = [];
    let currentDate = start;
    
    while (currentDate <= end) {
        const y = currentDate.getFullYear();
        const m = String(currentDate.getMonth() + 1).padStart(2, '0');
        const d = String(currentDate.getDate()).padStart(2, '0');
        const fullDate = `${y}-${m}-${d}`;
        const shortDate = `${m}/${d}`;

        newDays.push({
            date: shortDate,
            day: '',
            fullDate: fullDate,
            theme: '',
            events: []
        });

        currentDate.setDate(currentDate.getDate() + 1);
    }

    appData.value.days = newDays;
    reindexDays();
    currentDayIndex.value = 0;

    dateRangeModalVisible.value = false;
    saveData();
};

const deleteTripHandler = async () => {
  if (!appData.value.id) return;

  if (confirm(`確定要刪除行程「${tripTitle.value}」嗎？此操作無法復原。`)) {
    const tripIdToDelete = appData.value.id;
    tripMetaModalVisible.value = false;
    isLoading.value = true;

    const result = await deleteTrip(tripIdToDelete);

    if (result.success) {
      showToast('行程已刪除', 'success');

      await loadTripList();

      if (tripList.value.length > 0) {
        openTitleSelectionModal();
      } else {
        appData.value = { id: null, days: [] };
        tripTitle.value = '';
        tripCity.value = '';
        isLoading.value = false;
        isEditMode.value = true;
      }
    } else {
      showToast(`刪除失敗: ${result.message}`, 'error');
      isLoading.value = false;
    }
  }
};

const handleScroll = () => {
  const currentScrollY = window.scrollY;
  if (currentScrollY > lastScrollY.value && currentScrollY > 100) {
    navIsVisible.value = false;
  } else if (currentScrollY < lastScrollY.value) {
    navIsVisible.value = true;
  }
  lastScrollY.value = currentScrollY;
};

onMounted(async () => {
  await loadTripList();
  if (tripList.value.length > 0) {
    openTitleSelectionModal();
  } else {
    appData.value = { id: null, days: [] };
    tripTitle.value = '';
    tripCity.value = '';
    initApp();
  }
  window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>