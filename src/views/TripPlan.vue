<template>
  <div id="trip-plan-content">

    <div class="trip-header-placeholder">
      <v-container>
        <div class="header-top">
          <div class="header-titles">
            <h1>{{ appData.title || '行程規劃' }}</h1>
            <p class="subtitle">{{ tripDateRange }}</p>
          </div>

          <div class="header-controls">
            <a :href="mapBookmarkUrl" target="_blank" class="v-btn v-btn--icon v-theme--dark text-primary" title="開啟地圖">
              <v-icon size="24">mdi-map-marker-multiple</v-icon>
            </a>

            <v-btn v-if="canEdit" :color="isEditMode ? 'accent' : 'default'" variant="tonal" icon
              @click="toggleEditMode">
              <v-icon>{{ isEditMode ? 'mdi-check' : 'mdi-pencil' }}</v-icon>
            </v-btn>
          </div>
        </div>
      </v-container>
    </div>

    <nav class="day-nav" :class="{ hide: !navIsVisible }" style="top: 64px;">
      <div class="nav-container" ref="navContainerRef">
        <button v-for="(day, index) in appData.days" :key="index"
          :class="['nav-btn', { active: index === currentDayIndex }]" @click="changeDay(index)">
          {{ day.day }} <span style="font-size: 0.8em; opacity: 0.8;">({{ formatDayDate(day.fullDate) }})</span>
        </button>
        <v-btn v-if="isEditMode" icon="mdi-plus" size="small" variant="text" class="ml-2" @click="startAddDay" />
      </div>
    </nav>

    <div class="schedule-container">
      <div v-if="appData.days && appData.days.length > 0">
        <div class="text-center">
          <h2 class="day-theme">{{ currentDay.theme }}</h2>
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
              <span :class="['badge', getTransportClass(event.transport)]">
                {{ getTransportIcon(event.transport) }} {{ event.transport }}
              </span>
            </div>

            <div v-if="event.notes" class="event-notes">
              <div :style="{ maxHeight: expandedNotes[eventIndex] ? 'none' : '60px', overflow: 'hidden' }"
                v-html="formatNotes(event.notes)" />
              <v-btn variant="text" density="compact" size="small" color="secondary" class.mt-2.px-0
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
        <h3 v-else class="text-muted">暫無行程資料</h3>
      </div>
    </div>

    <v-dialog v-model="titleSelectionModalVisible" persistent max-width="400px">
      <v-card class="pa-4 rounded-xl">
        <v-card-title class="text-center font-weight-bold">請選擇行程</v-card-title>
        <v-card-text>
          <v-list density="compact" nav>
            <v-list-item v-for="(title, index) in tripTitles" :key="index" :title="title" @click="selectTitle(title)"
              :active="selectedTitle === title" class="rounded-lg mb-2" color="primary" />
          </v-list>
          <v-alert v-if="tripTitles.length === 0 && !isLoadingTitles" type="warning" variant="tonal" class="mt-4">
            未找到任何行程標題。
          </v-alert>
          <v-progress-circular v-if="isLoadingTitles" indeterminate color="primary" class="d-block mx-auto mt-4" />
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
                <v-select label="交通方式" v-model="modalEventData.transport"
                  :items="['步行', 'BTS', 'MRT', 'Bolt', '船', '包車', '飛機']" variant="outlined" density="compact" />
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
import { fetchTripData, fetchAllTripTitle, saveTripData } from '../lib/supabaseTrips';
import { useAuthStore } from '../stores/useAuthStore';

let TARGET_TITLE = '';
const mapBookmarkUrl = "https://www.google.com/maps/d/u/0/edit?mid=1pJlG73WanZkVkTSFvt3GLpMCDVU8heQ&ll=13.798196927110428%2C100.54907266665649&z=17";

const authStore = useAuthStore();

const appData = ref({ title: '', days: [] });
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
  transport: '',
  notes: '',
});

const toast = reactive({
  visible: false,
  message: '',
  color: 'success',
});

// 新增狀態
const titleSelectionModalVisible = ref(false);
const tripTitles = ref([]);
const selectedTitle = ref('');
const isLoadingTitles = ref(true);

const canEdit = computed(() => {
  const role = authStore.role;
  return role === 'admin' || role === 'editor';
});

const currentDay = computed(() => {
  return appData.value.days[currentDayIndex.value] || { events: [] };
});

const tripDateRange = computed(() => {
  if (appData.value.days.length === 0) return '載入中...';
  const firstDay = appData.value.days[0].fullDate;
  const lastDay = appData.value.days[appData.value.days.length - 1].fullDate;
  const start = new Date(firstDay).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }).replace('/', '/');
  const end = new Date(lastDay).toLocaleDateString('zh-TW', { month: '2-digit', day: '2-digit' }).replace('/', '/');
  return `${start} - ${end}`;
});

const showToast = (message, color = 'info') => {
  toast.message = message;
  toast.color = color;
  toast.visible = true;
};

const formatDayDate = (fullDate) => {
  const dateObj = new Date(fullDate);
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  const month = dateObj.getMonth() + 1;
  const date = dateObj.getDate();
  const weekday = weekdays[dateObj.getDay()];
  return `${month}/${date} ${weekday}`;
};

const getTransportIcon = (transport) => {
  const t = (transport || '').toLowerCase();
  if (t.includes('bts') || t.includes('mrt') || t.includes('飛機')) return '🚆';
  if (t.includes('船') || t.includes('渡輪') || t.includes('ferry')) return '⛴️';
  if (t.includes('bolt') || t.includes('包車') || t.includes('公車') || t.includes('car')) return '🚗';
  return '🚶';
};

const getTransportClass = (transport) => {
  const t = (transport || '').toLowerCase();
  if (t.includes('bts') || t.includes('mrt') || t.includes('飛機')) return 'trans-bts';
  if (t.includes('船') || t.includes('渡輪') || t.includes('ferry')) return 'trans-boat';
  if (t.includes('bolt') || t.includes('包車') || t.includes('公車') || t.includes('car')) return 'trans-car';
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

const loadData = async () => {
  isLoading.value = true;
  const result = await fetchTripData(TARGET_TITLE);

  if (result.success) {
    appData.value = result.data;
    initApp();
  } else {
    showToast(`載入失敗: ${result.message}`, 'error');
    appData.value = { title: '', days: [] };
    isLoading.value = false;
  }
};

const saveData = () => {
  saveTripData(appData.value);
  showToast('✅ 行程已成功儲存！', 'success');
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
  modalEventData.transport = '步行';
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
  modalEventData.transport = event.transport;
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

const handleScroll = () => {
  const currentScrollY = window.scrollY;
  if (currentScrollY > lastScrollY.value && currentScrollY > 100) {
    navIsVisible.value = false;
  } else if (currentScrollY < lastScrollY.value) {
    navIsVisible.value = true;
  }
  lastScrollY.value = currentScrollY;
};

const startAddDay = () => {
  showToast('尚未實作新增日期的邏輯。', 'warning');
};

// 新增功能：處理標題選擇
const selectTitle = async (title) => {
  selectedTitle.value = title;
  TARGET_TITLE = title;
  titleSelectionModalVisible.value = false;

  await loadData();
};

onMounted(async () => {
  isLoadingTitles.value = true;
  const titles = await fetchAllTripTitle();
  isLoadingTitles.value = false;

  if (titles && titles.length > 0) {
    tripTitles.value = titles;
    selectedTitle.value = titles[0];
    titleSelectionModalVisible.value = true;
  } else {
    TARGET_TITLE = '';
    showToast('未找到任何行程標題', 'warning');
    const data = await loadData();
    appData.value = data;
    initApp();
  }

  window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>