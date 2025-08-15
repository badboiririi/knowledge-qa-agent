<template>
  <div class="assistant-root">
    <div class="chat-body" ref="chatBody">
      <div class="message bot-message" id="initial-welcome">
        <div class="avatar">智</div>
        <div class="message-container">
          <div class="message-content">您好，我是安东知识大模型小安，关于安东人力资源相关知识，快来问我吧</div>
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
            <img :src="micIcon" alt="语音输入" />
          </button>
          <button class="action-button" title="上传附件">
            <img :src="linkIcon" alt="上传附件" />
          </button>
          <button class="send-button" title="发送" @click="sendMessage">
            <img :src="sendIcon" alt="发送" />
          </button>
        </div>
      </div>
      <p class="disclaimer">部分内容由AI大模型智能生成，不代表厂商的观点</p>
    </footer>

    <div ref="modal" class="source-modal">
      <div class="modal-content">
        <button class="close-modal" @click="closeModal">&times;</button>
        <div class="image-container">
          <h3 class="image-title">{{ currentTitle }}</h3>
          <div id="anton-docx-container" style="width: 100%; height: 80vh; overflow-y: auto;"></div>
        </div>
        <div class="nav-toolbar">
          <button class="nav-btn" :class="{ disabled: !hasPrevDiff }" title="上一处" @click="goPrevDiff" aria-label="上一处">▲</button>
          <button class="nav-btn" :class="{ disabled: !hasNextDiff }" title="下一处" @click="goNextDiff" aria-label="下一处">▼</button>
          <button class="nav-btn" :class="{ disabled: !hasPrevPair }" title="切换上一版本" @click="goPrevPair" aria-label="上一版本">◀</button>
          <button class="nav-btn" :class="{ disabled: !hasNextPair }" title="切换下一版本" @click="goNextPair" aria-label="下一版本">▶</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import sendIcon from '../assets/发送.svg';
import linkIcon from '../assets/链接.svg';
import micIcon from '../assets/录音.svg';
import * as docx from 'docx-preview';

export default {
  name: 'KnowledgeAssistant',
  setup() {
    const chatBody = ref(null);
    const chatInput = ref(null);
    const modal = ref(null);
    const userInput = ref('');
    const showGuess = ref(true);

    const initialQuestions = [
      '公司的请假制度是怎样的？',
      '薪酬结构包括哪些部分？',
      '差旅费报销标准是什么？',
      '员工晋升制度有哪些要求？'
    ];



    const botResponses = {
      '公司的请假制度是怎样的？': {
        content: '公司请假制度规定：员工请假需提前提交申请，事假需至少提前1个工作日，病假需提供正规医疗机构证明。年假、婚假、产假等按国家规定执行。',
        hasSource: true,
        sourcePage: 3
      },
      '薪酬结构包括哪些部分？': {
        content: '公司薪酬结构主要包括：基本工资、绩效奖金、岗位津贴、交通补贴、餐饮补贴、年终奖等。',
        hasSource: true,
        sourcePage: 8
      },
      '差旅费报销标准是什么？': {
        content: '差旅费报销标准：一线城市住宿400元/天，二线300元/天，三线200元/天；交通按公司差旅制度执行。',
        hasSource: true,
        sourcePage: 15
      },
      '员工晋升制度有哪些要求？': {
        content: '员工晋升需满足：在岗满1年，绩效良好及以上，满足岗位任职资格，并通过评审。',
        hasSource: true,
        sourcePage: 22
      },
      'default': '感谢您的提问！请具体说明您想了解的内容，比如请假、薪酬、差旅、晋升等，我会为您详细解答。'
    };

    const scrollToBottom = () => {
      if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight;
    };

    const appendMessage = (type, content) => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${type}-message`;
      
      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'avatar';
      avatarDiv.textContent = type === 'user' ? '' : '智';
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'message-container';
      
      // 如果是机器人消息且包含参考来源，则添加查看链接
      if (type === 'bot' && content.hasSource) {
        const sourceLink = document.createElement('div');
        sourceLink.className = 'source-link';
        sourceLink.textContent = '🔍 查看参考来源';
        sourceLink.addEventListener('click', showSourceModal);
        
        contentDiv.innerHTML = `<div class="message-content">${content.content}</div>`;
        contentDiv.appendChild(sourceLink);
      } else {
        contentDiv.innerHTML = `<div class="message-content">${content.content || content}</div>`;
      }
      
      messageDiv.appendChild(avatarDiv);
      messageDiv.appendChild(contentDiv);
      
      chatBody.value.appendChild(messageDiv);
      scrollToBottom();
    };

    const appendBotMessageWithSource = (responseObj) => {
  const messageEl = document.createElement('div');
  messageEl.className = 'message bot-message';
  const sourceLink = responseObj.hasSource
    ? `<div style="margin-top: 8px; font-size: 13px; color: #5f6368;"><a href="javascript:void(0)" class="source-link" style="color: #4A89E8; text-decoration: none;">🔍 查看参考来源</a></div>`
    : '';

  messageEl.innerHTML = `
    <div class="avatar">智</div>
    <div class="message-container">
      <div class="message-content">${responseObj.content}</div>
      ${sourceLink}
    </div>
  `;
  chatBody.value.appendChild(messageEl);

  if (responseObj.hasSource) {
    messageEl.querySelector('.source-link').addEventListener('click', () => {
      showSourceModal(responseObj.sourcePage || 1);
    });
  }
  scrollToBottom();
};

    const sendMessage = () => {
      const text = userInput.value.trim();
      if (!text) return;
      if (showGuess.value) showGuess.value = false;
      appendMessage('user', text);
      userInput.value = '';
      setTimeout(() => {
        let responseObj;
        if (botResponses[text]) {
          if (typeof botResponses[text] === 'string') {
            responseObj = {
              content: botResponses[text],
              hasSource: true,
              sourcePage: 1 // 默认跳转到第1页
            };
          } else {
            responseObj = botResponses[text];
          }
        } else {
          responseObj = {
            content: botResponses.default,
            hasSource: false
          };
        }
        appendBotMessageWithSource(responseObj);
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



    const showSourceModal = () => {
      if (modal.value) {
        // 打开即默认第一个组合第一处差异
        currentPairIndex.value = 0;
        currentDiffIndex.value = 0;
        modal.value.style.display = 'flex';
        renderWordDocument();
      }
    };

    // 关闭参考来源弹窗
    const closeModal = () => {
      if (modal.value) {
        modal.value.style.display = 'none';
      }
    };



    // 文件组合与切换
    const filePairs = ref([
      {
        title: '安东石油人力资源管理制度',
        url: 'https://static-host-vsu1427n-test.sealoshzh.site/document/anton.docx',
        diffs: [ { page: 2 }, { page: 3 } ]
      },
      {
        title: '安东石油人力资源管理制度 - 版本2',
        url: 'https://static-host-vsu1427n-test.sealoshzh.site/document/anton.docx',
        diffs: [ { page: 2 }, { page: 3 } ]
      }
    ]);
    const currentPairIndex = ref(0);
    const currentDiffIndex = ref(0);

    const currentPair = computed(() => filePairs.value[currentPairIndex.value]);
    const currentTitle = computed(() => currentPair.value?.title || '文档');
    const hasPrevPair = computed(() => currentPairIndex.value > 0);
    const hasNextPair = computed(() => currentPairIndex.value < filePairs.value.length - 1);
    const hasPrevDiff = computed(() => currentDiffIndex.value > 0);
    const hasNextDiff = computed(() => currentPair.value && currentDiffIndex.value < (currentPair.value.diffs?.length || 0) - 1);

    // 清空容器
    const clearContainer = () => {
      const container = document.getElementById('anton-docx-container');
      if (container) container.innerHTML = '';
    };

    // 获取文档页面
    const getDocxPages = (container) => {
      const selectors = ['.docx .page', '.docx-page', '.docx-wrapper .page', '.docx .docx-page', '.docx-preview .page', '.docx .document .page'];
      for (const sel of selectors) {
        const nodes = container.querySelectorAll(sel);
        if (nodes && nodes.length > 1) return Array.from(nodes);
        if (nodes && nodes.length === 1) {
          const sub = nodes[0].querySelectorAll('.page, .docx-page, section');
          if (sub && sub.length > 0) return Array.from(sub);
        }
      }
      const wrapper = container.querySelector('.docx, .docx-preview, .docx-wrapper');
      if (wrapper) {
        const directChildren = Array.from(wrapper.children || []);
        if (directChildren.length > 1) return directChildren;
        const subPages = wrapper.querySelectorAll('.page, .docx-page, section');
        if (subPages && subPages.length > 0) return Array.from(subPages);
      }
      return [];
    };

    // 滚动到指定页面
    const scrollToPageByIndex = (containerId, pageIndex) => {
      const container = document.getElementById(containerId);
      if (!container || pageIndex < 1) return;
      const doScroll = () => {
        const pages = getDocxPages(container);
        if (!pages || pages.length === 0) return false;
        const targetIndex = Math.min(pageIndex - 1, pages.length - 1);
        const target = pages[targetIndex];
        const top = target.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
        container.scrollTo({ top, behavior: 'smooth' });
        return true;
      };
      if (!doScroll()) return;
      setTimeout(doScroll, 200);
      setTimeout(doScroll, 800);
    };

    // 确保滚动到指定页面
    const ensureScrollToPage = (containerId, pageIndex, timeoutMs = 5000) => {
      const container = document.getElementById(containerId);
      if (!container) return;
      let disconnected = false;
      const observer = new MutationObserver(() => { scrollToPageByIndex(containerId, pageIndex); });
      try { observer.observe(container, { childList: true, subtree: true }); } catch (_) {}
      scrollToPageByIndex(containerId, pageIndex);
      const t1 = setTimeout(() => scrollToPageByIndex(containerId, pageIndex), 300);
      const t2 = setTimeout(() => scrollToPageByIndex(containerId, pageIndex), 1200);
      setTimeout(() => { if (!disconnected) { observer.disconnect(); disconnected = true; } clearTimeout(t1); clearTimeout(t2); }, timeoutMs);
    };

    // 滚动到当前差异位置
    const scrollToCurrentDiff = () => {
      const pair = currentPair.value;
      if (!pair || !pair.diffs || pair.diffs.length === 0) return;
      const diff = pair.diffs[currentDiffIndex.value] || pair.diffs[0];
      ensureScrollToPage('anton-docx-container', diff.page);
    };

    // 渲染 Word 文档
    const renderWordDocument = async () => {
      try {
        clearContainer();
        const pair = currentPair.value;
        const cacheToken = Date.now();
        const url = pair.url + (pair.url.includes('?') ? '&' : '?') + 'v=' + cacheToken;
        
        const response = await fetch(url, { cache: 'no-store' });
        const arrayBuffer = await response.arrayBuffer();
        const container = document.getElementById('anton-docx-container');
        
        if (container) {
          await docx.renderAsync(arrayBuffer, container, null, {
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false
          });
          
          // 渲染完成后滚动到当前差异位置
          setTimeout(() => {
            scrollToCurrentDiff();
          }, 500);
        }
      } catch (error) {
        console.error('渲染文档时出错:', error);
        const container = document.getElementById('anton-docx-container');
        if (container) {
          container.innerHTML = '<p>文档加载失败，请检查文件路径或网络连接。</p>';
        }
      }
    };

    // 导航功能
    const goPrevDiff = () => {
      if (!hasPrevDiff.value) return;
      currentDiffIndex.value -= 1;
      scrollToCurrentDiff();
    };

    const goNextDiff = () => {
      if (!hasNextDiff.value) return;
      currentDiffIndex.value += 1;
      scrollToCurrentDiff();
    };

    const goPrevPair = () => {
      if (!hasPrevPair.value) return;
      currentPairIndex.value -= 1;
      currentDiffIndex.value = 0;
      renderWordDocument();
    };

    const goNextPair = () => {
      if (!hasNextPair.value) return;
      currentPairIndex.value += 1;
      currentDiffIndex.value = 0;
      renderWordDocument();
    };

    onMounted(() => {
      scrollToBottom();
      if (modal.value) {
        modal.value.addEventListener('click', (e) => { 
          if (e.target === modal.value) closeModal(); 
        });
      }
    });

    return {
      chatBody,
      chatInput,
      userInput,
      showGuess,
      initialQuestions,
      sendMessage,
      handleKeydown,
      selectQuestion,
      sendIcon,
      linkIcon,
      micIcon,
      modal,
      closeModal,
      showSourceModal,
      hasPrevPair,
      hasNextPair,
      hasPrevDiff,
      hasNextDiff,
      goPrevDiff,
      goNextDiff,
      goPrevPair,
      goNextPair,
      currentTitle
    };
  }
};
</script>

<style scoped>
.assistant-root {
  --primary-color: #4A89E8;
  --primary-color-light: #e9f2ff;
  --widget-bg-color: #ffffff;
  --text-color-primary: #1a1a1a;
  --text-color-secondary: #5f6368;
  --border-color: #e6ebf1;
  --bot-message-bg: #f8f9fb;
  --user-message-bg: #e9f2ff;
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

/* 参考来源链接样式 */
:deep(.source-link) {
  color: #667eea;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 5px;
  display: inline-block;
  transition: color 0.2s ease;
}

:deep(.source-link:hover) {
  color: #5a67d8;
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

/* 弹窗样式 */
.source-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); justify-content: center; align-items: center; z-index: 3000; }
.modal-content { display: flex; flex-direction: column; width: 65%; max-width: 1200px; height: auto; min-height: 90vh; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); position: relative; }
.close-modal { position: absolute; top: 15px; right: 15px; background: white; color: #5f6368; border: none; width: 30px; height: 30px; border-radius: 50%; font-size: 18px; line-height: 30px; text-align: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); z-index: 1001; }
.close-modal:hover { background: #f5f5f5; color: #1a1a1a; }
.image-container { flex: 1; display: flex; flex-direction: column; padding: 15px; min-width: 0; }
.image-title { color: #1a1a1a; margin: 0 0 15px; font-size: 18px; font-weight: 600; text-align: center; padding-bottom: 10px; border-bottom: 1px solid #e9ecef; }
.nav-toolbar { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; background: white; padding: 8px; border-radius: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.15); z-index: 1000; }
.nav-btn { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; color: #495057; transition: all 0.2s; }
.nav-btn:hover:not(.disabled) { background: #e9ecef; color: #212529; transform: scale(1.1); }
.nav-btn.disabled { opacity: 0.4; cursor: not-allowed; }
</style>


