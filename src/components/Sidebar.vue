<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <div class="sidebar-header">
      <div class="header-top">
        <button class="new-chat-btn" @click="newChat">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>
          <span>新对话</span>
        </button>
                  <button class="collapse-btn" @click="toggleSidebar" :title="isSidebarCollapsed ? '展开侧边栏' : '收起侧边栏'">
            <svg v-if="!isSidebarCollapsed" class="collapse-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 10.5H40" stroke="#5f6368" stroke-width="4" stroke-linecap="butt" stroke-linejoin="round"/>
              <path d="M24 19.5H40" stroke="#5f6368" stroke-width="4" stroke-linecap="butt" stroke-linejoin="round"/>
              <path d="M24 28.5H40" stroke="#5f6368" stroke-width="4" stroke-linecap="butt" stroke-linejoin="round"/>
              <path d="M8 37.5H40" stroke="#5f6368" stroke-width="4" stroke-linecap="butt" stroke-linejoin="round"/>
              <path d="M8 19L16 24L8 29V19Z" fill="none" stroke="#5f6368" stroke-width="4" stroke-linejoin="round"/>
            </svg>
            <svg v-else class="collapse-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 10.5H40" stroke="#5f6368" stroke-width="4" stroke-linecap="butt" stroke-linejoin="round"/>
              <path d="M24 19.5H40" stroke="#5f6368" stroke-width="4" stroke-linecap="butt" stroke-linejoin="round"/>
              <path d="M24 28.5H40" stroke="#5f6368" stroke-width="4" stroke-linecap="butt" stroke-linejoin="round"/>
              <path d="M8 37.5H40" stroke="#5f6368" stroke-width="4" stroke-linecap="butt" stroke-linejoin="round"/>
              <path d="M16 19L8 24L16 29V19Z" fill="none" stroke="#5f6368" stroke-width="4" stroke-linejoin="round"/>
            </svg>
          </button>
      </div>
    </div>

    <div class="sidebar-section">
      <div class="section-title">智能体</div>
      <div class="agent-list">
        <div
          class="agent-item"
          :class="{ active: currentAgent === 'qa' }"
          @click="switchAgent('qa')"
        >
          <div class="agent-icon">问</div>
          <div class="agent-name">智能知识问答</div>
        </div>
        <!-- <div
          class="agent-item"
          :class="{ active: currentAgent === 'compare' }"
          @click="switchAgent('compare')"
        >
          <div class="agent-icon">比</div>
          <div class="agent-name">制度对比</div>
        </div> -->
      </div>
    </div>

    <div class="sidebar-section history-section">
      <div class="section-title">历史记录</div>
      <div class="search-box">
        <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input type="text" placeholder="搜索历史对话..." class="search-input" />
      </div>
      <div class="history-list">
        <div class="history-item" v-for="(item, index) in historyItems" :key="index" @click="loadHistory(index)">
          <div class="history-title">{{ item.title }}</div>
          <div class="history-time">{{ item.time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'Sidebar',
  props: {
    currentAgent: String
  },
  emits: ['switchAgent', 'newChat', 'loadHistory', 'toggleSidebar'],
  setup(props, { emit }) {
    // 侧边栏折叠状态
    const isSidebarCollapsed = ref(false);

    const historyItems = ref([
      { title: '公司请假制度咨询', time: '今天 10:23' },
      { title: '薪酬结构问题', time: '昨天 15:47' },
      { title: '安东和斯伦贝谢QHSE原则差异', time: '昨天 09:12' },
      { title: '差旅费报销标准', time: '3天前' },
      { title: '员工晋升制度', time: '3天前' },
      { title: '员工轮岗制度', time: '3天前' }
    ]);

    const switchAgent = (agent) => {
      emit('switchAgent', agent);
    };

    const newChat = () => {
      emit('newChat');
    };

    const loadHistory = (index) => {
      emit('loadHistory', index);
    };

    const toggleSidebar = () => {
      // 直接触发隐藏侧边栏事件，不使用内部折叠状态
      emit('toggleSidebar');
    };

    return {
      historyItems,
      switchAgent,
      newChat,
      loadHistory,
      toggleSidebar,
      isSidebarCollapsed
    };
  }
};
</script>

<style scoped>
.sidebar {
  --primary-color: #4A89E8;
  --primary-color-light: #e9f2ff;
  --widget-bg-color: #ffffff;
  --text-color-primary: #1a1a1a;
  --text-color-secondary: #5f6368;
  --border-color: #e6ebf1;
  width: 240px;
  height: 100%;
  background-color: #f9fafc;
  border-right: 1px solid #e6ebf1;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.02);
  color: #213547;
  transition: width 0.3s ease;
}

.sidebar.sidebar-collapsed {
  width: 64px;
}

.sidebar.sidebar-collapsed .agent-name,
.sidebar.sidebar-collapsed .section-title,
.sidebar.sidebar-collapsed .history-title,
.sidebar.sidebar-collapsed .history-time,
.sidebar.sidebar-collapsed .search-box,
.sidebar.sidebar-collapsed .new-chat-btn span {
  display: none;
}

.sidebar.sidebar-collapsed .header-top {
  flex-direction: column;
  gap: 12px;
  position: relative;
}

.sidebar.sidebar-collapsed .new-chat-btn {
  justify-content: center;
  padding: 10px 8px;
  width: 48px;
  height: 48px;
}

.sidebar.sidebar-collapsed .agent-item {
  justify-content: center;
  padding: 10px 8px;
  margin: 0 8px;
}

.sidebar.sidebar-collapsed .history-item {
  display: none;
}

.sidebar.sidebar-collapsed .history-section {
  display: none;
}

.sidebar.sidebar-collapsed .collapse-btn {
  width: 48px;
  height: 48px;
  padding: 12px;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.header-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 10px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  gap: 8px;
  transition: background-color 0.2s;
}

.collapse-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.collapse-btn:hover {
  background-color: #f0f2f5;
}

.collapse-icon {
  width: 20px;
  height: 20px;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.collapse-btn:hover .collapse-icon {
  opacity: 1;
}

.new-chat-btn:hover {
  background-color: #3a79d8;
}

.new-chat-btn svg {
  width: 16px;
  height: 16px;
}

.sidebar-section {
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.sidebar-section.history-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-bottom: none;
  overflow: hidden;
}

.section-title {
  font-size: 12px;
  color: var(--text-color-secondary);
  margin-bottom: 12px;
  font-weight: 500;
}

.agent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.agent-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.agent-item:hover {
  background-color: #f5f6f8;
}

.agent-item.active {
  background-color: #e9f2ff;
  color: var(--primary-color);
}

.agent-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6B73FF, #4F5BFF);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  color: white;
  font-size: 16px;
  margin-right: 10px;
}

.agent-name {
  font-size: 14px;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 12px;
  gap: 8px;
}

.search-icon {
  width: 16px;
  height: 16px;
  color: var(--text-color-secondary);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: var(--text-color-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-color-secondary);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
}

/* 自定义滚动条样式 */
.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-track {
  background: transparent;
}

.history-list::-webkit-scrollbar-thumb {
  background-color: var(--primary-color);
  border-radius: 3px;
  opacity: 0.6;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background-color: #3a79d8;
}

.history-item {
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  border: 1px solid transparent;
}

.history-item:hover {
  background-color: #f5f6f8;
  border-color: var(--border-color);
}

.history-title {
  font-size: 14px;
  color: var(--text-color-primary);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-time {
  font-size: 12px;
  color: var(--text-color-secondary);
}
</style>