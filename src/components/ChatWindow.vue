<template>
  <div class="chat-widget">
    <header class="chat-header">
      <div class="header-title-container">
        <div class="header-icon">智</div>
        <div class="header-title"><h3>智能助手</h3></div>
      </div>
      <div class="header-actions">
        <div class="assistant-switch">
          <button
            class="switch-btn"
            :class="{ active: currentAssistant === 'qa' }"
            @click="currentAssistant = 'qa'"
            title="知识问答助手"
          >知识问答</button>
          <button
            class="switch-btn"
            :class="{ active: currentAssistant === 'compare' }"
            @click="currentAssistant = 'compare'"
            title="制度对比助手"
          >制度对比</button>
        </div>
        <svg title="关闭" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" @click="closeChat"><path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41z"></path></svg>
      </div>
    </header>

    <div class="assistant-container">
      <KnowledgeAssistant2 v-if="currentAssistant === 'qa'" />
      <CompareAssistant v-else />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import KnowledgeAssistant2 from './KnowledgeAssistant2.vue';
import CompareAssistant from './CompareAssistant.vue';

export default {
  name: 'ChatWindow',
  components: { KnowledgeAssistant2, CompareAssistant },
  emits: ['close'],
  setup(props, { emit }) {
    const currentAssistant = ref('qa');
    const closeChat = () => emit('close');
    return { currentAssistant, closeChat };
  }
};
</script>

<style scoped>
.chat-widget {
  --primary-color: #4A89E8;
  --primary-color-light: #e9f2ff;
  --widget-bg-color: #ffffff;
  --text-color-primary: #1a1a1a;
  --text-color-secondary: #5f6368;
  --border-color: #e0e4e8;
}

.chat-widget {
  width: 750px;
  height: 900px;
  max-height: calc(100vh - 40px);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  background-color: var(--widget-bg-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.2s ease;
}

.chat-header {
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

.header-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6B73FF, #4F5BFF);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  color: white;
  font-size: 20px;
}

.header-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color-primary);
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

.assistant-switch {
  display: inline-flex;
  background: #f3f5f8;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  padding: 2px;
}

.switch-btn {
  border: none;
  background: transparent;
  padding: 6px 10px;
  font-size: 12px;
  color: var(--text-color-secondary);
  border-radius: 999px;
  cursor: pointer;
}

.switch-btn.active {
  background: #ffffff;
  color: var(--text-color-primary);
  border: 1px solid var(--border-color);
}

.assistant-container {
  flex: 1;
  display: flex;
  min-height: 0;
}
</style>