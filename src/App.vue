<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import ChatWindow from './components/ChatWindow.vue';

const showChat = ref(false);
const isDragging = ref(false);
const offsetX = ref(0);
const offsetY = ref(0);
const scale = ref(1);
const widgetPosition = ref({ top: 100, right: 20 });

const toggleChat = () => {
  showChat.value = !showChat.value;
};

const closeChat = () => {
  showChat.value = false;
};

const handleMouseDown = (e) => {
  isDragging.value = true;
  offsetX.value = e.clientX - e.target.getBoundingClientRect().left;
  offsetY.value = e.clientY - e.target.getBoundingClientRect().top;
  e.target.style.cursor = 'grabbing';
};

const handleMouseMove = (e) => {
  if (!isDragging.value) return;
  const y = e.clientY - offsetY.value;
  widgetPosition.value.top = y;
  // 保持元素在右侧，不设置left值
  // widgetPosition.value.left = undefined; // Vue 3 中不需要这样做
};

const handleMouseUp = (e) => {
  isDragging.value = false;
  e.target.style.cursor = 'move';
};

const handleWheel = (e) => {
  e.preventDefault();
  const scaleAmount = 0.1;
  if (e.deltaY < 0) {
    // 放大
    scale.value += scaleAmount;
  } else {
    // 缩小
    scale.value -= scaleAmount;
  }
  // 限制缩放范围
  scale.value = Math.max(0.5, Math.min(2, scale.value));
};

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
});
</script>

<template>
  <div class="background-container">
    <!-- 背景图 -->
    <div class="background-image"></div>
    
    <!-- 浮动可拖拽的“知识问答助手”按钮 -->
    <div 
      class="draggable-widget" 
      :style="{ top: widgetPosition.top + 'px', right: widgetPosition.right + 'px', transform: `scale(${scale})` }"
      @mousedown="handleMouseDown"
      @wheel="handleWheel"
    >
      <a href="javascript:void(0)" @click="toggleChat" style="text-decoration: none; color: inherit;">
        <div class="icon-container">
          <svg t="1755072262028" class="icon" viewBox="0 0 1123 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7619">
            <path d="M346.078968 556.164129c-17.903484 0-29.828129 11.924645-29.828129 29.828129s11.924645 29.828129 29.828129 29.828129 29.828129-11.891613 29.828129-29.828129c0-17.903484-11.924645-29.828129-29.828129-29.828129M781.675355 556.164129c-17.903484 0-29.828129 11.924645-29.828129 29.828129s11.891613 29.828129 29.828129 29.828129c17.903484 0 29.828129-11.891613 29.828129-29.828129 0-17.903484-11.924645-29.828129-29.828129-29.828129" fill="#74ACD6" p-id="7620"></path>
            <path d="M996.484129 753.069419v-184.980645c41.752774 11.957677 65.635097 47.731613 65.635097 95.463226 5.945806 41.785806-23.882323 77.592774-65.635097 89.517419z m-214.808774-77.559742c-47.731613 0-89.517419-41.785806-89.51742-89.517419s41.785806-89.517419 89.51742-89.517419 89.517419 41.785806 89.517419 89.517419-41.785806 89.517419-89.517419 89.517419z m-137.249032 149.173678h-161.098323c-17.903484 0-29.828129-11.957677-29.828129-29.828129 0-17.903484 11.891613-29.861161 29.828129-29.861161h161.098323c17.903484 0 29.828129 17.903484 29.828129 29.861161 0 17.870452-11.924645 29.828129-29.828129 29.828129z m-298.347355-149.173678c-47.731613 0-89.517419-41.785806-89.51742-89.517419s41.785806-89.517419 89.51742-89.517419 89.517419 41.785806 89.517419 89.517419-41.785806 89.517419-89.517419 89.517419z m161.098322-554.941935c0-29.828129 23.882323-59.656258 59.689291-59.656258 29.828129 0 59.656258 23.84929 59.656258 59.656258s-23.84929 59.68929-59.656258 59.68929c-35.806968-5.978839-59.68929-29.861161-59.689291-59.68929zM125.324387 753.069419c-35.806968-11.924645-65.668129-47.731613-65.668129-89.517419 0-41.752774 29.861161-77.559742 65.635097-95.463226v184.980645z m871.159742-244.636903v-11.924645c0-101.442065-83.571613-184.980645-184.980645-184.980645h-220.787613V233.934452c47.731613-11.891613 89.517419-59.656258 89.517419-113.36671A119.675871 119.675871 0 0 0 560.887742 1.222194a119.675871 119.675871 0 0 0-119.345548 119.345548c0 53.710452 35.806968 101.442065 89.517419 113.36671v77.592774H316.250839c-101.442065 0-184.980645 83.538581-184.980645 184.980645v11.891613C53.710452 520.390194 0 586.058323 0 663.618065c0 77.559742 53.710452 137.216 125.291355 155.119483a183.758452 183.758452 0 0 0 184.980645 173.056h501.231484c101.409032 0 179.034839-77.592774 184.980645-173.056 71.580903-11.924645 125.291355-77.559742 125.291355-155.119483 5.945806-77.592774-47.731613-143.227871-125.291355-155.152517z" fill="#74ACD6" p-id="7621"></path>
          </svg>
        </div>
        <div class="label">知识问答助手</div>
      </a>
    </div>
    
    <!-- 聊天窗口 -->
    <div v-if="showChat" class="chat-overlay">
      <ChatWindow @close="closeChat" />
    </div>
  </div>
</template>

<style scoped>
.background-container {
  position: relative;
  width: 100%;
  height: 100vh;
  /* overflow: hidden; 移除此属性以确保背景图能正确显示 */
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("https://objectstorageapi.hzh.sealos.run/vsu1427n-test/test/OA页面2.png");
  background-size: 100% 100%;
  background-position: center;
  background-attachment: fixed;
}

.draggable-widget {
  position: fixed;
  top: 100px;
  right: 20px;
  cursor: move;
  text-align: center;
  user-select: none;
  z-index: 1000;
  left: auto !important;
  transition: transform 0.3s ease;
}

.draggable-widget .icon-container {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin: 0 auto;
}

.draggable-widget .icon-container svg {
  width: 100%;
  height: 100%;
  transition: transform 0.3s ease;
}

.draggable-widget .icon-container:hover svg {
  transform: scale(1.1);
}

.draggable-widget .label {
  margin-top: 5px;
  font-size: 10px;
  color: #000;
  font-weight: bold;
  transition: color 0.3s ease;
}

.draggable-widget:hover .label {
  color: #4A89E8;
}

.chat-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: flex-end; /* 靠右显示 */
  background-color: rgba(0, 0, 0, 0.35);
  padding: 20px; /* 右侧保留20px 间距 */
  box-sizing: border-box;
  overflow: auto;
}
</style>
