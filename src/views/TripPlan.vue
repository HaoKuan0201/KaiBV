<template>
  <v-app :data-theme="theme" id="trip-plan-app">
    <v-app-bar class="app-header" :elevation="4" :style="{ top: 0, position: 'sticky', zIndex: 100 }">
      <div class="header-top">
        <div class="header-titles">
          <h1>{{ appData.title || '行程規劃' }}</h1>
          <p class="subtitle">{{ tripDateRange }}</p>
        </div>

        <div class="header-controls">
          <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" icon class="icon-btn" variant="flat" aria-label="更多選項">
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>

            <v-list class="more-menu-dropdown">

              <v-list-item @click="toggleTheme">
                <v-list-item-title class="theme-toggle-btn">
                  <v-icon size="20">{{ theme === 'dark' ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}</v-icon>
                  切換主題
                </v-list-item-title>
              </v-list-item>

            </v-list>
          </v-menu>

          <a :href="mapBookmarkUrl" target="_blank" class="icon-btn map-bookmark-btn" aria-label="開啟地圖書籤">
            <v-icon>mdi-map-marker-multiple</v-icon>
          </a>

          <v-btn v-if="canEdit" class="icon-btn edit-toggle-btn" :class="{ active: isEditMode }" @click="toggleEditMode"
            variant="flat" :title="isEditMode ? '結束編輯模式' : '切換編輯模式'" aria-label="切換編輯模式">
            <v-icon v-if="isEditMode">mdi-check</v-icon>
            <v-icon v-else>mdi-pencil</v-icon>
          </v-btn>
        </div>
      </div>
    </v-app-bar>

    <nav class="day-nav" :class="{ hide: !navIsVisible, show: navIsVisible }">
      <div class="nav-container" ref="navContainerRef">
        <button v-for="(day, index) in appData.days" :key="index"
          :class="{ 'nav-btn': true, active: index === currentDayIndex }" @click="changeDay(index)" aria-label="切換日期">
          {{ day.day }} ({{ formatDayDate(day.fullDate) }})
        </button>
        <v-btn v-if="isEditMode" icon size="small" variant="flat" class="add-day-btn" @click="startAddDay">
          <v-icon>mdi-plus</v-icon>
        </v-btn>
      </div>
    </nav>

    <v-main id="swipe-container" class="schedule-container">
      <v-container fluid class="pa-0">
        <div v-if="appData.days && appData.days.length > 0">
          <div style="text-align: center; padding-top: 20px;">
            <h2 class="day-theme">{{ currentDay.theme }}</h2>
          </div>

          <div class="timeline">
            <div v-for="(event, eventIndex) in currentDay.events" :key="eventIndex"
              :id="`card-${currentDayIndex}-${eventIndex}`" :class="['event-card']">
              <div class="event-header">
                <span class="event-time">{{ event.time }}</span>
                <div v-if="isEditMode" class="edit-controls">
                  <v-btn icon size="small" variant="text" @click="startEditEvent(eventIndex)" class="edit-icon">
                    ✏️
                  </v-btn>
                  <v-btn icon size="small" variant="text" @click="deleteEvent(eventIndex)" class="delete-icon">
                    🗑️
                  </v-btn>
                </div>
              </div>

              <div class="event-location-group">
                <div class="event-location">{{ event.location }}</div>
                <a v-if="event.mapURL" :href="event.mapURL" target="_blank" class="map-icon" aria-label="地圖連結">
                  <v-icon size="20">mdi-map-marker</v-icon>
                </a>
                <a v-if="event.noteURL" :href="event.noteURL" target="_blank" class="note-icon" aria-label="備註連結">
                  🚀
                </a>
              </div>

              <div class="event-details">
                <span :class="['badge', getTransportClass(event.transport)]">
                  {{ getTransportIcon(event.transport) }} {{ event.transport }}
                </span>
              </div>

              <div v-if="event.notes" class="notes-container">
                <div :class="['event-notes', { collapsed: !expandedNotes[eventIndex] }]"
                  :ref="el => setNoteRef(el, eventIndex)">
                  <div v-html="formatNotes(event.notes)"></div>
                </div>
                <button class="toggle-notes-btn" @click="toggleNotes(eventIndex)">
                  {{ expandedNotes[eventIndex] ? '收起備註 🔼' : '展開備註 🔽' }}
                </button>
              </div>
            </div>
          </div>

          <v-btn v-if="isEditMode" block class="add-event-btn" @click="startAddEvent">
            + 新增行程
          </v-btn>

        </div>
        <div v-else style="text-align: center; padding: 50px;">
          <v-progress-circular v-if="isLoading" indeterminate color="primary"></v-progress-circular>
          <h2 v-else>載入中... 或資料為空</h2>
        </div>
      </v-container>
    </v-main>

    <v-dialog v-model="modalVisible" max-width="450px" persistent>
      <v-card class="modal-content">
        <v-card-title class="text-center">
          <h3 id="modal-title">{{ isNewEvent ? '新增行程' : '編輯行程' }}</h3>
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleSaveEvent">
            <input type="hidden" v-model="modalEventData.dayIndex">
            <input type="hidden" v-model="modalEventData.eventIndex">

            <div class="form-group">
              <label for="event-time-input">時間 (格式: HH:MM 或 HH:MM-HH:MM)</label>
              <v-text-field v-model="modalEventData.time" id="event-time-input" density="compact" required
                hide-details></v-text-field>
            </div>

            <div class="form-group">
              <label for="event-location-input">地點/活動</label>
              <v-text-field v-model="modalEventData.location" id="event-location-input" density="compact" required
                hide-details></v-text-field>
            </div>

            <div class="form-group">
              <label for="event-map-url-input">地圖連結 (可選)</label>
              <v-text-field v-model="modalEventData.mapURL" id="event-map-url-input" type="url" density="compact"
                hide-details></v-text-field>
            </div>

            <div class="form-group">
              <label for="event-note-url-input">備註連結 (可選，例如預訂網址)</label>
              <v-text-field v-model="modalEventData.noteURL" id="event-note-url-input" type="url" density="compact"
                hide-details></v-text-field>
            </div>

            <div class="form-group">
              <label for="event-transport-input">交通方式 (例如: 步行, BTS, Bolt)</label>
              <v-text-field v-model="modalEventData.transport" id="event-transport-input" density="compact" required
                hide-details></v-text-field>
            </div>

            <div class="form-group">
              <label for="event-notes-input">備註 (可選)</label>
              <v-textarea v-model="modalEventData.notes" id="event-notes-input" rows="3" density="compact"
                hide-details></v-textarea>
            </div>

            <div class="button-group">
              <v-btn class="cancel-btn" @click="closeEditModal" variant="flat">取消</v-btn>
              <v-btn type="submit" class="save-btn" variant="flat">儲存</v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="toast.visible" :timeout="3000" :color="toast.color" location="top right" multi-line>
      {{ toast.message }}
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { fetchTripData, saveTripData } from '../lib/supabaseTrips';
import { supabase } from '../lib/supabaseClient';

const TARGET_TITLE = '曼谷五日自由行 (11/27 - 12/1)';
const mapBookmarkUrl = "https://www.google.com/maps/d/u/0/edit?mid=1pJlG73WanZkVkTSFvt3GLpMCDVU8heQ&ll=13.798196927110428%2C100.54907266665649&z=17";

const appData = ref({ title: '曼谷五日自由行', days: [] });
const currentDayIndex = ref(0);
const isEditMode = ref(false);
const modalVisible = ref(false);
const isNewEvent = ref(false);
const isLoading = ref(true);
const theme = ref(localStorage.getItem('theme') || 'dark');
const navIsVisible = ref(true);

const userRole = ref('');

const lastScrollY = ref(0);
const expandedNotes = reactive({});

const noteRefs = ref([]);

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

const fetchUserRole = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    userRole.value = 'guest';
    return;
  }

  const userId = user.id;

  const { data, error } = await supabase
    .from('T_KaiGO_Users')
    .select('role')
    .eq('user_uuid', userId)
    .limit(1);

  if (error) {
    userRole.value = 'viewer';
    return;
  }

  if (data && data.length > 0) {
    userRole.value = data[0].role;
  } else {
    userRole.value = 'viewer';
  }
};

const canEdit = computed(() => {
  const role = userRole.value;
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

const setNoteRef = (el, index) => {
  if (el) {
    noteRefs.value[index] = el;
  }
};

const formatNotes = (text) => {
  if (!text) return "";

  const lines = text.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);
  let html = '<ul>';

  const applyHighlighting = (item) => {
    let itemHtml = item;

    itemHtml = itemHtml.replace(/(\([^)]+\))/g, (match) => {
      return `<span class="highlight-parentheses">${match}</span>`;
    });

    itemHtml = itemHtml.replace(/(\b\d+[\s%個]*)/g, (match) => {
      return `<span class="price-info">${match}</span>`;
    });

    return itemHtml;
  };

  lines.forEach(line => {
    const separatorIndex = line.indexOf('-');

    if (separatorIndex !== -1 && (separatorIndex > 0 || separatorIndex < line.length - 1)) {
      const floorTitle = applyHighlighting(line.substring(0, separatorIndex).trim());
      const content = line.substring(separatorIndex + 1).trim();

      html += `<li class="floor-section"><h3 class="floor-title">✨ ${floorTitle}</h3><ul class="floor-content-list">`;
      const contentItems = content.split(/\s*(?:、|,)\s*(?![^(]*\))/).map(item => item.trim()).filter(item => item.length > 0);

      contentItems.forEach(item => {
        const itemHtml = applyHighlighting(item);
        html += `<li>${itemHtml}</li>`;
      });

      html += `</ul></li>`;

    } else if (line.length > 0) {
      const lineHtml = applyHighlighting(line);
      html += `<li class="floor-section"><h3>✨${lineHtml}</h3></li>`;
    }
  });

  html += '</ul>';
  return html;
};

const loadData = async () => {
  const result = await fetchTripData(TARGET_TITLE);

  if (result.success) {
    return result.data;
  } else {
    showToast(`載入失敗: ${result.message}`, 'error');
    return { title: '曼谷五日自由行', days: [] };
  }
};

const saveData = () => {
  saveTripData(appData.value);
  showToast('✅ 行程已成功儲存至雲端！', 'success');
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

const toggleTheme = () => {
  const newTheme = theme.value === 'dark' ? 'light' : 'dark';
  theme.value = newTheme;
  localStorage.setItem('theme', newTheme);
};

const changeDay = (index) => {
  currentDayIndex.value = index;
  updateNavState();
  Object.keys(expandedNotes).forEach(key => expandedNotes[key] = false);

  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
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
  modalEventData.transport = event.transport;
  modalEventData.notes = event.notes;
  modalVisible.value = true;
};

const closeEditModal = () => {
  modalVisible.value = false;
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
  closeEditModal();
};

const deleteEvent = (eventIndex) => {
  if (!confirm("確定要刪除此行程嗎？")) return;

  const dayIndex = currentDayIndex.value;
  appData.value.days[dayIndex].events.splice(eventIndex, 1);
  saveData();

  sortEventsByTime(appData.value.days[dayIndex].events);
  showToast('🗑️ 行程已刪除並儲存！', 'info');
};

const toggleNotes = (eventIndex) => {
  const isExpanded = expandedNotes[eventIndex];
  expandedNotes[eventIndex] = !isExpanded;

  nextTick(() => {
    const notesElement = noteRefs.value[eventIndex];
    if (notesElement) {
      notesElement.style.maxHeight = expandedNotes[eventIndex] ? notesElement.scrollHeight + "px" : '100px';
    }
  });
};

const handleScroll = () => {
  const currentScrollY = window.scrollY;
  const dayNav = document.querySelector('.day-nav');

  if (currentScrollY > lastScrollY.value && currentScrollY > 150) {
    dayNav?.classList.remove('show');
    dayNav?.classList.add('hide');
    navIsVisible.value = false;
  } else if (currentScrollY < lastScrollY.value) {
    dayNav?.classList.remove('hide');
    dayNav?.classList.add('show');
    navIsVisible.value = true;
  }

  lastScrollY.value = currentScrollY;
};

const startAddDay = () => {
  showToast('尚未實作新增日期的邏輯。', 'warning');
};

onMounted(async () => {
  document.body.setAttribute('data-theme', theme.value);

  await fetchUserRole();

  const data = await loadData();
  appData.value = data;

  initApp();

  window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});

</script>