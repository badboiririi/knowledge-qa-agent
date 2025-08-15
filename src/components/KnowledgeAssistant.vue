<template>
  <div class="assistant-root">
    <div class="chat-body" ref="chatBody">
      <div class="message bot-message" id="initial-welcome">
        <div class="avatar">智</div>
        <div class="message-container">
          <div class="message-content">您好，我是您知识问答助手，很高兴为您解答OA知识库相关问题</div>
        </div>
      </div>

      <div class="question-list-container" v-if="showGuess">
        <div class="question-list-title">———— 猜你想问 ————</div>
        <div class="question-list">
          <div
            class="question-item"
            v-for="q in initialQuestions"
            :key="q"
            @click="selectQuestion(q)"
          >
            <div class="question-item-icon"></div>
            <div>{{ q }}</div>
          </div>
        </div>
      </div>
    </div>

    <footer class="chat-input-area">
      <div class="input-wrapper">
        <textarea
          ref="chatInput"
          class="chat-input"
          placeholder="输入您的问题..."
          rows="1"
          v-model="userInput"
          @keydown="handleKeydown"
        ></textarea>
        <div class="input-actions">
          <button class="action-button" title="语音输入">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
          </button>
          <button class="action-button" title="上传附件">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          </button>
          <button class="send-button" title="发送" @click="sendMessage">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12L2.01 3L2 10l15 2l-15 2z"></path></svg>
          </button>
        </div>
      </div>
      <p class="disclaimer">部分内容由AI大模型智能生成，不代表厂商的观点</p>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'KnowledgeAssistant',
  setup() {
    const chatBody = ref(null);
    const chatInput = ref(null);
    const userInput = ref('');
    const showGuess = ref(true);

    const initialQuestions = [
      '公司的请假制度是怎样的？',
      '薪酬结构包括哪些部分？',
      '差旅费报销标准是什么？',
      '员工晋升制度有哪些要求？'
    ];

    const botResponses = {
      '公司的请假制度是怎样的？': '公司请假制度规定：员工请假需提前提交申请，事假需至少提前1个工作日，病假需提供正规医疗机构证明。年假、婚假、产假等按国家规定执行。',
      '薪酬结构包括哪些部分？': '公司薪酬结构主要包括：基本工资、绩效奖金、岗位津贴、交通补贴、餐饮补贴、年终奖等。',
      '差旅费报销标准是什么？': '差旅费报销标准：一线城市住宿400元/天，二线300元/天，三线200元/天；交通按公司差旅制度执行。',
      '员工晋升制度有哪些要求？': '员工晋升需满足：在岗满1年，绩效良好及以上，满足岗位任职资格，并通过评审。',
      'default': '感谢您的提问！请具体说明您想了解的内容，比如请假、薪酬、差旅、晋升等，我会为您详细解答。'
    };

    const scrollToBottom = () => {
      if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight;
    };

    const appendMessage = (sender, text) => {
      const messageEl = document.createElement('div');
      messageEl.className = `message ${sender}-message`;
      const content = `<div class="message-content">${text}</div>`;
      messageEl.innerHTML = sender === 'bot'
        ? `<div class="avatar">智</div><div class="message-container">${content}</div>`
        : `<div class="message-container">${content}</div>`;
      chatBody.value.appendChild(messageEl);
      scrollToBottom();
    };

    const sendMessage = () => {
      const text = userInput.value.trim();
      if (!text) return;
      if (showGuess.value) showGuess.value = false;
      appendMessage('user', text);
      userInput.value = '';
      setTimeout(() => {
        const resp = botResponses[text] || botResponses.default;
        appendMessage('bot', resp);
      }, 600);
    };

    const handleKeydown = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    };

    const selectQuestion = (q) => {
      userInput.value = q;
      sendMessage();
    };

    onMounted(() => {
      scrollToBottom();
    });

    return {
      chatBody,
      chatInput,
      userInput,
      showGuess,
      initialQuestions,
      sendMessage,
      handleKeydown,
      selectQuestion
    };
  }
};
</script>

<style scoped>
.assistant-root {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.chat-body {
  flex-grow: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 10px;
  gap: 0;
  color: var(--text-color-primary);
  background-color: #ffffff;
}

:deep(.message) {
  display: flex;
  margin-bottom: 16px;
  max-width: 80%;
  animation: fadeInUp 0.5s ease;
}

:deep(.message-container) {
  display: flex;
  flex-direction: column;
}

:deep(.message-content) {
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 15px;
  line-height: 1.6;
  word-wrap: break-word;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  color: var(--text-color-primary);
}

:deep(.bot-message .message-content) {
  background-color: #f8f9fb;
  border-top-left-radius: 4px;
  border: 1px solid var(--border-color);
}

:deep(.user-message) {
  align-self: flex-end;
}
:deep(.user-message .message-content) {
  background-color: var(--primary-color-light);
  color: #1a2a44;
  border-top-right-radius: 4px;
}

:deep(.bot-message) { align-self: flex-start; gap: 12px; }
:deep(.bot-message .avatar) {
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
  flex-shrink: 0;
}

.question-list-container {
  padding: 8px;
  animation: fadeIn 0.5s ease;
  background-color: #ffffff;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  margin: 0 16px;
}
.question-list-title {
  color: var(--text-color-secondary);
  font-size: 13px;
  margin-bottom: 8px;
  text-align: center;
  font-weight: 500;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border-color);
}
.question-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
  font-size: 14px;
  color: var(--text-color-primary);
  background-color: #f9fafc;
  border: 1px solid transparent;
}
.question-item:last-child { margin-bottom: 0; }
.question-item:hover {
  background-color: #f1f3f5;
  transform: translateY(-1px);
  border-color: var(--border-color);
}
.question-item-icon {
  width: 6px;
  height: 6px;
  background-color: #ffe5e7;
  border: 1px solid #e57373;
  border-radius: 50%;
  margin-right: 10px;
  flex-shrink: 0;
}

.chat-input-area {
  border-top: 1px solid var(--border-color);
  padding: 10px 24px;
  background-color: var(--widget-bg-color);
  flex-shrink: 0;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.03);
}
.input-wrapper {
  width: 95%;
  max-width: 600px;
  margin: 0 auto;
  min-height: 48px;
  display: flex;
  align-items: center;
  background-color: #f5f6f8;
  border-radius: 24px;
  padding: 0 16px;
  gap: 12px;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}
.input-wrapper:focus-within {
  border-color: var(--primary-color);
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(74, 137, 232, 0.2);
}
.chat-input {
  flex-grow: 1;
  border: none;
  background: transparent;
  padding: 0;
  font-size: 15px;
  color: var(--text-color-primary);
  resize: none;
  height: auto;
  max-height: 120px;
  line-height: 48px;
}
.chat-input:focus { outline: none; }
.input-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-button {
  background: none;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  color: var(--text-color-secondary);
}

.action-button:hover {
  background-color: rgba(74, 137, 232, 0.1);
  color: var(--primary-color);
}

.action-button svg {
  width: 20px;
  height: 20px;
}

.send-button {
  background-color: var(--primary-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 10px rgba(74, 137, 232, 0.3);
}
.send-button:hover { transform: scale(1.05); background-color: #3a79d8; box-shadow: 0 6px 14px rgba(74, 137, 232, 0.4); }
.send-button svg { color: white; width: 20px; height: 20px; }
.disclaimer { font-size: 11px; color: #b0b4b8; text-align: center; margin-top: 10px; }

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>


