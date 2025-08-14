import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 引入 docx-preview 库
import * as docx from 'docx-preview';

// 将 docx-preview 库挂载到全局 window 对象上，以便在组件中使用
window.docx = docx;

createApp(App).mount('#app')
