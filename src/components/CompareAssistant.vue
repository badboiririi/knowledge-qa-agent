<template>
  <div class="assistant-root">
    <div class="chat-body" ref="chatBody">
      <div class="message bot-message" id="initial-welcome">
        <div class="avatar">智</div>
        <div class="message-container">
          <div class="message-content">您好，我是您的制度解答助手，请问有什么可以帮您？</div>
        </div>
      </div>
      <div class="question-list-container">
        <div class="question-list-title">———— 猜你想问 ————</div>
        <div class="question-list">
          <div class="question-item" @click="selectQuestion('总结安东和斯伦贝谢QHSE原则的差异')">
            <div class="question-item-icon"></div>
            <div>总结安东和斯伦贝谢QHSE原则的差异</div>
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
        <button class="send-button" title="发送" @click="sendMessage">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12L2.01 3L2 10l15 2l-15 2z"></path></svg>
        </button>
      </div>
      <p class="disclaimer">部分内容由AI大模型智能生成，不代表厂商的观点</p>
    </footer>

    <div ref="modal" class="source-modal">
      <div class="modal-content">
        <button class="close-modal" @click="closeModal">&times;</button>
        <div class="image-container">
          <h3 class="image-title">{{ leftTitle }}</h3>
          <div id="anton-docx-container" style="width: 100%; height: 80vh; overflow-y: auto;"></div>
        </div>
        <div class="image-container">
          <h3 class="image-title">{{ rightTitle }}</h3>
          <div id="schlumberger-docx-container" style="width: 100%; height: 80vh; overflow-y: auto;"></div>
        </div>
        <div class="nav-toolbar">
          <button class="nav-btn" :class="{ disabled: !hasPrevDiff }" title="上一处差异" @click="goPrevDiff" aria-label="上一处">▲</button>
          <button class="nav-btn" :class="{ disabled: !hasNextDiff }" title="下一处差异" @click="goNextDiff" aria-label="下一处">▼</button>
          <button class="nav-btn" :class="{ disabled: !hasPrevPair }" title="切换上一组文件" @click="goPrevPair" aria-label="上一组">◀</button>
          <button class="nav-btn" :class="{ disabled: !hasNextPair }" title="切换下一组文件" @click="goNextPair" aria-label="下一组">▶</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import * as docx from 'docx-preview';

export default {
  name: 'CompareAssistant',
  setup() {
    const chatBody = ref(null);
    const chatInput = ref(null);
    const modal = ref(null);
    const userInput = ref('');

    // 文件组合与差异位置（演示用两个组合，路径先沿用一组）
    const filePairs = ref([
      {
        leftTitle: '安东-安东石油QHSE（安全生产）管理规定(ZD-ZH-016V0-2021)',
        leftUrl: 'https://static-host-vsu1427n-test.sealoshzh.site/document/anton.docx',
        rightTitle: '斯伦贝谢-HSE_to_Go_Handbook',
        rightUrl: 'https://static-host-vsu1427n-test.sealoshzh.site/document/斯伦贝谢.docx',
        diffs: [ { left: 2, right: 5 }, { left: 3, right: 7 } ]
      },
      {
        leftTitle: '安东-安东石油QHSE（安全生产）管理规定(ZD-ZH-016V0-2021)',
        leftUrl: 'https://static-host-vsu1427n-test.sealoshzh.site/document/anton.docx',
        rightTitle: '斯伦贝谢-HSE_to_Go_Handbook',
        rightUrl: 'https://static-host-vsu1427n-test.sealoshzh.site/document/斯伦贝谢.docx',
        diffs: [ { left: 2, right: 5 }, { left: 3, right: 7 } ]
      }
    ]);
    const currentPairIndex = ref(0);
    const currentDiffIndex = ref(0);

    const currentPair = computed(() => filePairs.value[currentPairIndex.value]);
    const leftTitle = computed(() => currentPair.value?.leftTitle || '左侧文档');
    const rightTitle = computed(() => currentPair.value?.rightTitle || '右侧文档');
    const hasPrevPair = computed(() => currentPairIndex.value > 0);
    const hasNextPair = computed(() => currentPairIndex.value < filePairs.value.length - 1);
    const hasPrevDiff = computed(() => currentDiffIndex.value > 0);
    const hasNextDiff = computed(() => currentPair.value && currentDiffIndex.value < (currentPair.value.diffs?.length || 0) - 1);

    const scrollToBottom = () => {
      if (chatBody.value) chatBody.value.scrollTop = chatBody.value.scrollHeight;
    };

    const appendMessage = (sender, text) => {
      const messageEl = document.createElement('div');
      messageEl.className = `message ${sender}-message`;
      const content = `<div class=\"message-content\">${text}</div>`;
      messageEl.innerHTML = sender === 'bot'
        ? `<div class=\"avatar\">智</div><div class=\"message-container\">${content}</div>`
        : `<div class=\"message-container\">${content}</div>`;
      chatBody.value.appendChild(messageEl);
      scrollToBottom();
    };

    const appendBotMessageWithSource = (responseObj) => {
      const messageEl = document.createElement('div');
      messageEl.className = 'message bot-message';
      const sourceLink = responseObj.hasSource
        ? `<div style=\"margin-top: 8px; font-size: 13px; color: #5f6368;\"><a href=\"javascript:void(0)\" class=\"source-link\" style=\"color: #4A89E8; text-decoration: none;\">🔍 查看参考来源</a></div>`
        : '';

      messageEl.innerHTML = `
        <div class=\"avatar\">智</div>
        <div class=\"message-container\">
          <div class=\"message-content\">${responseObj.summary}</div>
          ${sourceLink}
        </div>
      `;
      chatBody.value.appendChild(messageEl);

      if (responseObj.hasSource) {
        messageEl.querySelector('.source-link').addEventListener('click', showSourceModal);
      }
      scrollToBottom();
    };

    const sendMessage = () => {
      const text = userInput.value.trim();
      if (!text) return;
      appendMessage('user', text);
      userInput.value = '';

      setTimeout(() => {
        let response;
        if (text.includes('总结安东和斯伦贝谢QHSE原则的差异')) {
          response = {
            summary: `以下是<strong>安东石油</strong>与<strong>斯伦贝谢（Schlumberger）</strong>在QHSE（质量、健康、安全、环境）管理原则方面的<strong>差异总结</strong>，基于双方公开政策文件内容整理：<br>
<h3>❗ <strong>不同点（差异分析）</strong></h3>
<table border=\"1\" cellpadding=\"5\" cellspacing=\"0\">
<thead>
<tr>
<th>维度</th>
<th>安东石油</th>
<th>斯伦贝谢（Schlumberger）</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>核心价值观</strong></td>
<td>“<strong>先有QHSE，后有安东</strong>”——将QHSE作为企业存在的前提条件。</td>
<td>“<strong>Lead by example</strong>”——领导以身作则，文化驱动行为。</td>
</tr>
<tr>
<td><strong>愿景目标</strong></td>
<td>“零伤亡、零污染、零损失、零投诉”</td>
<td>未明确提出“四零”，但强调“<strong>持续改进</strong>”和“<strong>卓越绩效</strong>”。</td>
</tr>
<tr>
<td><strong>组织机制</strong></td>
<td>建立<strong>安委会</strong>统一领导，分级签订责任书，<strong>属地管理+责任制</strong>明确。</td>
</tr>
<tr>
<td><strong>斯伦贝谢（Schlumberger）</strong></td>
<td>强调<strong>Line Management（直线经理）负责制</strong>，HSE职能为支持与监督。</td>
</tr>
</tbody>
</table>
<br>
---<br><br>
<h3>✅ 总结一句话</h3>
<p>安东石油以“制度+文化+问责”三位一体，强调<strong>责任到人、属地严管</strong>；</p>
<p>斯伦贝谢则以“领导示范+体系标准+数据驱动”为核心，强调<strong>文化引领、持续改进</strong>。</p>`,
            hasSource: true
          };
        } else {
          response = { summary: '抱歉，此演示仅支持查看“总结安东和斯伦贝谢QHSE原则的差异”问题。', hasSource: false };
        }
        appendBotMessageWithSource(response);
      }, 800);
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
      if (!modal.value) return;
      // 打开即默认第一个组合第一处差异
      currentPairIndex.value = 0;
      currentDiffIndex.value = 0;
      modal.value.style.display = 'flex';
      renderWordDocuments();
    };
    const closeModal = () => { if (modal.value) modal.value.style.display = 'none'; };

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

    const clearContainers = () => {
      const left = document.getElementById('anton-docx-container');
      const right = document.getElementById('schlumberger-docx-container');
      if (left) left.innerHTML = '';
      if (right) right.innerHTML = '';
    };

    const scrollToCurrentDiff = () => {
      const pair = currentPair.value;
      if (!pair || !pair.diffs || pair.diffs.length === 0) return;
      const diff = pair.diffs[currentDiffIndex.value] || pair.diffs[0];
      ensureScrollToPage('anton-docx-container', diff.left);
      ensureScrollToPage('schlumberger-docx-container', diff.right);
    };

    const renderWordDocuments = async () => {
      try {
        clearContainers();
        const pair = currentPair.value;
        const cacheToken = Date.now();
        const leftUrl = pair.leftUrl + (pair.leftUrl.includes('?') ? '&' : '?') + 'v=' + cacheToken;
        const antonResp = await fetch(leftUrl, { cache: 'no-store' });
        const antonBuffer = await antonResp.arrayBuffer();
        const antonContainer = document.getElementById('anton-docx-container');
        await docx.renderAsync(antonBuffer, antonContainer, null, { inWrapper: true, ignoreWidth: false, ignoreHeight: false });
        setTimeout(() => { scrollToCurrentDiff(); }, 120);
      } catch (e) {
        console.error('加载安东石油文档失败:', e);
        document.getElementById('anton-docx-container').innerHTML = '<p>文档加载失败，请检查文件路径或网络连接。</p>';
      }
      try {
        const pair = currentPair.value;
        const cacheToken = Date.now();
        const rightUrl = pair.rightUrl + (pair.rightUrl.includes('?') ? '&' : '?') + 'v=' + cacheToken;
        const schResp = await fetch(rightUrl, { cache: 'no-store' });
        const schBuffer = await schResp.arrayBuffer();
        const schContainer = document.getElementById('schlumberger-docx-container');
        await docx.renderAsync(schBuffer, schContainer, null, { inWrapper: true, ignoreWidth: false, ignoreHeight: false });
        setTimeout(() => { scrollToCurrentDiff(); }, 120);
      } catch (e) {
        console.error('加载斯伦贝谢文档失败:', e);
        document.getElementById('schlumberger-docx-container').innerHTML = '<p>文档加载失败，请检查文件路径或网络连接。</p>';
      }
    };

    // 导航行为
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
      renderWordDocuments();
    };
    const goNextPair = () => {
      if (!hasNextPair.value) return;
      currentPairIndex.value += 1;
      currentDiffIndex.value = 0;
      renderWordDocuments();
    };

    onMounted(() => {
      scrollToBottom();
      if (modal.value) {
        modal.value.addEventListener('click', (e) => { if (e.target === modal.value) closeModal(); });
      }
    });

    return {
      chatBody,
      chatInput,
      modal,
      userInput,
      leftTitle,
      rightTitle,
      sendMessage,
      handleKeydown,
      selectQuestion,
      closeModal,
      hasPrevPair,
      hasNextPair,
      hasPrevDiff,
      hasNextDiff,
      goPrevDiff,
      goNextDiff,
      goPrevPair,
      goNextPair
    };
  }
};
</script>

<style scoped>
.assistant-root { display: flex; flex-direction: column; width: 100%; }
.chat-body { flex-grow: 1; overflow-y: auto; display: flex; flex-direction: column; padding: 10px; gap: 0; }
:deep(.message) { display: flex; margin-bottom: 16px; max-width: 80%; animation: fadeInUp 0.5s ease; }
:deep(.message-container) { display: flex; flex-direction: column; }
:deep(.message-content) { padding: 14px 18px; border-radius: 16px; font-size: 15px; line-height: 1.6; word-wrap: break-word; box-shadow: 0 2px 8px rgba(0,0,0,0.08); color: var(--text-color-primary); }
:deep(.bot-message .message-content) { background-color: var(--bot-message-bg); border-top-left-radius: 4px; border: 1px solid var(--border-color); }
:deep(.user-message .message-content) { background-color: var(--user-message-bg); color: #1a2a44; border-top-right-radius: 4px; }
:deep(.bot-message) { align-self: flex-start; gap: 12px; }
:deep(.bot-message .avatar) { width: 40px; height: 40px; background: linear-gradient(135deg, #6B73FF, #4F5BFF); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-weight: 700; color: white; font-size: 20px; flex-shrink: 0; }
:deep(.user-message) { align-self: flex-end; }
.question-list-container { padding: 8px; animation: fadeIn 0.5s ease; background-color: #ffffff; border: 1px solid var(--border-color); border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.08); margin: 0 16px; }
.question-list-title { color: var(--text-color-secondary); font-size: 13px; margin-bottom: 8px; text-align: center; font-weight: 500; padding-bottom: 6px; border-bottom: 1px solid var(--border-color); }
.question-item { display: flex; align-items: center; padding: 8px 12px; margin-bottom: 4px; border-radius: 6px; cursor: pointer; transition: background-color 0.2s, transform 0.2s; font-size: 14px; color: var(--text-color-primary); background-color: #f9fafc; border: 1px solid transparent; }
.question-item:last-child { margin-bottom: 0; }
.question-item:hover { background-color: #f1f3f5; transform: translateY(-1px); border-color: var(--border-color); }
.question-item-icon { width: 6px; height: 6px; background-color: #ffe5e7; border: 1px solid #e57373; border-radius: 50%; margin-right: 10px; flex-shrink: 0; }
.chat-input-area { border-top: 1px solid var(--border-color); padding: 10px 24px; background-color: var(--widget-bg-color); flex-shrink: 0; box-shadow: 0 -2px 10px rgba(0,0,0,0.03); }
.input-wrapper { width: 90%; max-width: 400px; margin: 0 auto; height: 48px; display: flex; align-items: center; background-color: #f5f6f8; border-radius: 24px; padding: 0 16px; gap: 12px; border: 2px solid transparent; transition: all 0.2s ease; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.input-wrapper:focus-within { border-color: var(--primary-color); background-color: #fff; box-shadow: 0 0 0 3px rgba(74,137,232,0.2); }
.chat-input { flex-grow: 1; border: none; background: transparent; padding: 0; font-size: 15px; color: var(--text-color-primary); resize: none; height: auto; max-height: 120px; line-height: 48px; }
.chat-input:focus { outline: none; }
.send-button { background-color: var(--primary-color); border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: transform 0.2s, background-color 0.2s, box-shadow 0.2s; box-shadow: 0 4px 10px rgba(74,137,232,0.3); }
.send-button:hover { transform: scale(1.05); background-color: #3a79d8; box-shadow: 0 6px 14px rgba(74,137,232,0.4); }
.send-button svg { color: white; width: 22px; height: 22px; }
.disclaimer { font-size: 11px; color: #b0b4b8; text-align: center; margin-top: 10px; }

/* 弹窗样式 */
.source-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); justify-content: center; align-items: center; z-index: 3000; }
.modal-content { display: flex; flex-direction: row; width: 95%; max-width: 1400px; height: auto; min-height: 90vh; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); position: relative; }
.close-modal { position: absolute; top: 15px; right: 15px; background: white; color: #5f6368; border: none; width: 30px; height: 30px; border-radius: 50%; font-size: 18px; line-height: 30px; text-align: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); z-index: 1001; }
.image-container { flex: 1; display: flex; flex-direction: column; padding: 15px; border-right: 1px solid #ddd; overflow-y: auto; }
.image-container:last-child { border-right: none; }
.image-title { color: #1a1a1a; margin: 0 0 10px; font-size: 16px; text-align: center; }
.docx-preview { width: 100% !important; max-width: 100%; height: auto; box-sizing: border-box; }

/* 导航工具条样式 */
.nav-toolbar { position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; background: rgba(255,255,255,0.95); padding: 8px 10px; border-radius: 24px; box-shadow: 0 6px 20px rgba(0,0,0,0.15); z-index: 1001; }
.nav-btn { width: 36px; height: 36px; border-radius: 50%; border: 1px solid #e3e5e8; background: #ffffff; color: #3b3f45; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease; }
.nav-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 10px rgba(0,0,0,0.12); background: #f7f9fc; }
.nav-btn.disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; transform: none; }

@keyframes fadeInUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>


