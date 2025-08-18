<template>
  <div class="chat-container" :class="{ 'maximized': isMaximized }">
    <Sidebar
      v-if="sidebarVisible"
      :currentAgent="currentAssistant"
      @switchAgent="switchAgent"
      @newChat="newChat"
      @loadHistory="loadHistory"
      @toggleSidebar="toggleSidebar"
    />
    <div class="chat-widget">
      <header class="chat-header">
        <div class="header-title-container">
          <button v-if="!sidebarVisible" class="show-sidebar-btn" @click="toggleSidebar" title="显示侧边栏">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>
          <div class="header-logo">
            <img src="../assets/GPTicon.png" alt="GPT图标">
          </div>
        </div>
        <div class="header-actions">
          <svg title="最大化" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" @click="toggleMaximize" v-if="!isMaximized">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
          </svg>
          <svg title="还原" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" @click="toggleMaximize" v-else>
            <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>
          </svg>
          <svg title="关闭" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" @click="closeChat"><path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"></path></svg>
        </div>
      </header>

      <div class="assistant-container">
        <KnowledgeAssistant v-if="currentAssistant === 'qa'" />
        <CompareAssistant v-else />
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import KnowledgeAssistant from './KnowledgeAssistant.vue';
import CompareAssistant from './CompareAssistant.vue';
import Sidebar from './Sidebar.vue';

export default {
  name: 'ChatWindow',
  components: { KnowledgeAssistant, CompareAssistant, Sidebar },
  emits: ['close'],
  setup(props, { emit }) {
    const currentAssistant = ref('qa');
    const sidebarVisible = ref(true);
    const isMaximized = ref(false);

    const closeChat = () => emit('close');

    const switchAgent = (agent) => {
      currentAssistant.value = agent;
    };

    const newChat = () => {
      // 这里可以添加新建对话的逻辑
      console.log('新建对话');
    };

    const loadHistory = (index) => {
      // 这里可以添加加载历史对话的逻辑
      console.log('加载历史对话', index);
    };

    const toggleSidebar = () => {
      // 当侧边栏切换时，直接隐藏/显示整个侧边栏
      sidebarVisible.value = !sidebarVisible.value;
    };

    const toggleMaximize = () => {
      isMaximized.value = !isMaximized.value;
    };

    return {
      currentAssistant,
      sidebarVisible,
      isMaximized,
      closeChat,
      switchAgent,
      newChat,
      loadHistory,
      toggleSidebar,
      toggleMaximize
    };
  }
};
</script>

<style scoped>
.chat-container {
  display: flex;
  width: 50%;
  height: 90vh;
  max-height: 90vh;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  overflow: hidden;
  position: fixed;
  top: 5vh;
  right: 2%;
  transition: all 0.3s ease;
}

.chat-container.maximized {
  width: 100%;
  height: 100vh;
  max-height: 100vh;
  top: 0;
  right: 0;
  border-radius: 0;
}

.chat-container.sidebar-hidden {
}



.chat-widget {
  --primary-color: #4A89E8;
  --primary-color-light: #e9f2ff;
  --widget-bg-color: #ffffff;
  --text-color-primary: #1a1a1a;
  --text-color-secondary: #5f6368;
  --border-color: #e6ebf1;
}

.chat-widget {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.2s ease;
  width: 100%;
}

.chat-container.sidebar-hidden .chat-widget {
}

.chat-header {
  height: 37px;
  padding: 16px 24px;
  background-color: var(--widget-bg-color);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.header-title-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-logo {
  width: 200px;
  height: 32px;
  border-radius: 6px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
}

.header-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.show-sidebar-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.show-sidebar-btn:hover {
  background-color: #f0f2f5;
}

.show-sidebar-btn svg {
  width: 20px;
  height: 20px;
  color: var(--text-color-secondary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}



.header-actions svg {
  width: 22px;
  height: 22px;
  cursor: pointer;
  color: var(--text-color-secondary);
  transition: color 0.2s, transform 0.2s;
}

.header-actions svg:hover {
  color: var(--primary-color);
  transform: scale(1.1);
}


.assistant-container {
  flex: 1;
  display: flex;
  min-height: 0;
}
</style>