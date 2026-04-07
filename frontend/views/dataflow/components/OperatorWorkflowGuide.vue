<template>
  <teleport to="body">
    <div v-if="visible" class="operator-guide-overlay">
      <div class="operator-guide-modal">
        <!-- 关闭按钮 -->
        <button class="close-btn" @click="closeGuide">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>

        <!-- 标题 -->
        <div class="modal-header">
          <h1 class="modal-title">算子工作流操作指南</h1>
          <p class="modal-subtitle">通过拖拽算子节点，快速构建数据pipeline</p>
        </div>

        <!-- 核心操作步骤 - 只在非视频模式显示 -->
        <div v-if="!showVideo" class="content-section">
          <!-- 步骤网格 -->
          <div class="steps-grid">
            <div class="step-card">
              <div class="step-header">
                <div class="step-number">1</div>
                <h3 class="step-title">配置数据集节点</h3>
              </div>
              <p class="step-desc">点击"数据集"添加数据源，选择合适的数据集作为处理起点</p>
              <div class="step-highlight orange">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3C7.58 3 4 4.79 4 7C4 9.21 7.58 11 12 11S20 9.21 20 7C20 4.79 16.42 3 12 3Z"/>
                </svg>
                数据集是工作流的基础
              </div>
            </div>

            <div class="step-card">
              <div class="step-header">
                <div class="step-number">2</div>
                <h3 class="step-title">确认算力券额度</h3>
              </div>
              <p class="step-desc">点击"算力配置"，确认算力券额度充足</p>
              <div class="step-highlight orange">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                </svg>
                确保算力充足
              </div>
            </div>

            <div class="step-card">
              <div class="step-header">
                <div class="step-number">3</div>
                <h3 class="step-title">匹配数据集字段</h3>
              </div>
              <p class="step-desc">从算子库拖拽算子到画布，确保数据集的字段与算子的input_key严格对应（可在算子节点手动配置字段）</p>
              <div class="step-highlight orange">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                数据字段对应是关键
              </div>
            </div>

            <div class="step-card">
              <div class="step-header">
                <div class="step-number">4</div>
                <h3 class="step-title">连接节点执行任务</h3>
              </div>
              <p class="step-desc">通过拖拽连线建立节点间的数据流，点击"执行任务"填写任务信息，即可启动执行。可在"任务管理"查看任务</p>
              <div class="step-highlight orange">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                连接顺序很重要
              </div>
            </div>
          </div>
        </div>

        <!-- 重要提示区域 - 只在非视频模式显示 -->
        <div v-if="!showVideo" class="tips-section">
          <div class="important-tip">
            <div class="tip-icon-large">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
            </div>
            <div class="tip-text">
              <strong>最重要的提醒：</strong>数据集的字段名称必须与算子的 input_key 严格对应，这是算子正常运行的关键前提
            </div>
          </div>
        </div>

        <!-- 视频播放区域 -->
        <div v-if="showVideo" class="video-section">
          <div class="video-header">
            <h3 class="video-title">DataFlow - 如何拖拽算子构建数据处理pipeline</h3>
            <button class="video-close-btn" @click="hideVideoDemo">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          <div class="video-container">
            <iframe 
              :src="videoUrl"
              frameborder="0" 
              allowfullscreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              class="video-iframe">
            </iframe>
          </div>
        </div>

        <!-- 操作按钮 - 只在非视频模式显示 -->
        <div v-if="!showVideo" class="action-section">
          <button class="demo-btn" @click="showVideoDemo">
            <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            观看演示视频
          </button>
          <button class="start-btn" @click="startWorkflow">
            开始构建工作流
          </button>
        </div>
        
        <!-- 视频模式下的操作按钮 -->
        <div v-if="showVideo" class="video-action-section">
          <button class="back-btn" @click="hideVideoDemo">
            <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
            返回操作指南
          </button>
          <button class="start-btn" @click="startWorkflow">
            开始构建工作流
          </button>
        </div>

        <!-- 不再提醒选项 -->
        <div class="footer-options">
          <label class="dont-show-again">
            <input type="checkbox" v-model="dontShowAgain" class="checkbox-input">
            <span class="checkbox-text">不再提醒</span>
          </label>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'start'])

// 状态
const visible = ref(false)
const dontShowAgain = ref(false)
const showVideo = ref(false)

// 视频相关
const videoUrl = ref('')
const biliVideoId = 'BV1tkbQz2E3L'

// 检查是否应该显示引导
const shouldShowGuide = () => {
  if(true){
    return false
  }
  // 检查是否选择了不再提醒
  const isDismissed = localStorage.getItem('operator_workflow_guide_dismissed') || 'false'
  
  // 检查是否需要显示引导
  const shouldShow = localStorage.getItem('operator_workflow_guide_show') || 'false'
  
  console.log('算子工作流引导页状态：', {
    isDismissed: isDismissed,
    shouldShow: shouldShow,
    finalShow: shouldShow === 'true' && isDismissed === 'false'
  })
  
  // 只有需要显示且未被永久关闭时才显示
  return shouldShow === 'true' && isDismissed === 'false'
}

// 方法
const closeGuide = () => {
  if (dontShowAgain.value) {
    // 如果勾选了不再提醒，则永久记录
    localStorage.setItem('operator_workflow_guide_dismissed', 'true')
  }
  // 设置为已显示过引导页
  localStorage.setItem('operator_workflow_guide_show', 'false')
  visible.value = false
  emit('close')
}

const startWorkflow = () => {
  if (dontShowAgain.value) {
    // 如果勾选了不再提醒，则永久记录
    localStorage.setItem('operator_workflow_guide_dismissed', 'true')
  }
  // 设置为已显示过引导页
  localStorage.setItem('operator_workflow_guide_show', 'false')
  visible.value = false
  emit('start')
}

// 视频相关方法
const showVideoDemo = () => {
  showVideo.value = true
  // 构建B站嵌入式播放器URL
  videoUrl.value = `//player.bilibili.com/player.html?bvid=${biliVideoId}&page=1&as_wide=1&high_quality=1&danmaku=0`
}

const hideVideoDemo = () => {
  showVideo.value = false
  videoUrl.value = ''
}

// 显示引导的公共方法
const showGuide = () => {
  localStorage.setItem('operator_workflow_guide_show', 'true')
  if (shouldShowGuide()) {
    visible.value = true
  }
}

// 暴露方法给父组件
defineExpose({
  showGuide
})

// 组件挂载时检查是否显示引导
onMounted(() => {
  if (shouldShowGuide()) {
    visible.value = true
  }
})

// 监听props变化
watch(() => props.show, (newValue) => {
  if (newValue && shouldShowGuide()) {
    visible.value = newValue
  }
}, { immediate: true })
</script>

<style scoped>
/* Apple Design System Colors - 直接使用具体值避免scoped样式中的变量问题 */

/* 无遮罩层，直接定位弹框 */
.operator-guide-overlay {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000;
  animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 主弹框 */
.operator-guide-modal {
  width: 900px;
  height: 660px;
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 50%, #ddeeff 100%);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  border: none;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  color: #8E8E93;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 10;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.15);
  color: #1C1C1E;
  transform: scale(1.05);
}

/* 模态框标题 */
.modal-header {
  text-align: center;
  padding: 32px 40px 24px;
}

.modal-title {
  font-size: 28px;
  font-weight: 600;
  color: #1C1C1E;
  margin-bottom: 8px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.modal-subtitle {
  font-size: 16px;
  color: #3C3C43;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
}

/* 内容部分 */
.content-section {
  flex: 1;
  padding: 0 40px 24px;
  overflow-y: auto;
}

/* 步骤网格 */
.steps-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.step-card {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
}

.step-card:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}


.step-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background: #007AFF;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 590;
  font-size: 13px;
  flex-shrink: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  box-shadow: 0 2px 6px rgba(0, 122, 255, 0.25);
}

.step-title {
  font-size: 15px;
  font-weight: 500;
  color: #1C1C1E;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  letter-spacing: -0.008em;
  line-height: 1.2;
}

.step-desc {
  font-size: 13px;
  color: #3C3C43;
  margin: 0 0 8px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  line-height: 1.4;
  letter-spacing: -0.003em;
}

.step-highlight {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(142, 142, 147, 0.08);
  color: #8E8E93;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 0.5px solid rgba(142, 142, 147, 0.12);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
}

.step-highlight.orange {
  background: rgba(255, 149, 0, 0.08);
  color: #FF9500;
  border-color: rgba(255, 149, 0, 0.12);
}

/* 提示部分 */
.tips-section {
  padding: 0 40px 24px;
  margin-top: 16px;
}

.important-tip {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 149, 0, 0.2);
  border-radius: 16px;
  padding: 16px 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.tip-icon-large {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: #FF9500;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tip-text {
  font-size: 14px;
  color: #1C1C1E;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  line-height: 1.4;
  letter-spacing: -0.005em;
}

.tip-text strong {
  font-weight: 590;
  color: #FF9500;
}

/* 视频播放区域 */
.video-section {
  flex: 1;
  margin: 0 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.video-title {
  font-size: 16px;
  font-weight: 600;
  color: #1C1C1E;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  letter-spacing: -0.008em;
}

.video-close-btn {
  width: 28px;
  height: 28px;
  border-radius: 14px;
  border: none;
  background: rgba(0, 0, 0, 0.08);
  color: #8E8E93;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.video-close-btn:hover {
  background: rgba(0, 0, 0, 0.12);
  color: #1C1C1E;
  transform: scale(1.05);
}

.video-container {
  position: relative;
  width: 100%;
  flex: 1;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  min-height: 400px;
}

.video-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 12px;
}

/* 操作按钮 */
.action-section {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-bottom: 32px;
}

.video-action-section {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 24px 40px 32px;
}

.demo-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  border: 1.5px solid rgba(0, 122, 255, 0.3);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  background: rgba(0, 122, 255, 0.08);
  color: #007AFF;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.15);
}

.demo-btn:hover {
  background: rgba(0, 122, 255, 0.12);
  border-color: rgba(0, 122, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0, 122, 255, 0.25);
}

.btn-icon {
  flex-shrink: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  border: 1.5px solid rgba(142, 142, 147, 0.3);
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  background: rgba(142, 142, 147, 0.08);
  color: #8E8E93;
  box-shadow: 0 2px 8px rgba(142, 142, 147, 0.15);
}

.back-btn:hover {
  background: rgba(142, 142, 147, 0.12);
  border-color: rgba(142, 142, 147, 0.5);
  color: #1C1C1E;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(142, 142, 147, 0.25);
}

.start-btn {
  padding: 12px 32px;
  border-radius: 12px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  background: #007AFF;
  color: #FFFFFF;
  box-shadow: 0 4px 16px rgba(25, 118, 210, 0.3);
}

.start-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(25, 118, 210, 0.4);
  background: #40A9FF;
}

/* 底部选项 */
.footer-options {
  position: absolute;
  bottom: 16px;
  right: 20px;
}

.dont-show-again {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
  font-size: 13px;
  color: #8E8E93;
  transition: color 0.15s ease-out;
}

.dont-show-again:hover {
  color: #3C3C43;
}

.checkbox-input {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1.5px solid #C7C7CC;
  background: #FFFFFF;
  margin-right: 7px;
  appearance: none;
  cursor: pointer;
  transition: all 0.15s ease-out;
  position: relative;
  flex-shrink: 0;
}

.checkbox-input:checked {
  background: #007AFF;
  border-color: #007AFF;
}

.checkbox-input:checked::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 6px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-input:hover {
  border-color: #007AFF;
}

.checkbox-text {
  user-select: none;
  font-weight: 400;
  letter-spacing: -0.003em;
}

/* 动画关键帧 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 1000px) {
  .operator-guide-modal {
    width: 90vw;
    height: 85vh;
  }
  
  .modal-header {
    padding: 20px 24px 12px;
  }
  
  .modal-title {
    font-size: 20px;
  }
  
  .modal-subtitle {
    font-size: 14px;
  }
  
  .content-section {
    padding: 16px 24px;
  }
  
  .steps-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .step-card {
    padding: 14px;
  }
  
  .tips-section {
    padding: 0 24px 12px;
  }
  
  .action-section {
    padding: 12px 24px 16px;
    flex-direction: column;
    gap: 12px;
  }
  
  .demo-btn {
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .start-btn {
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .video-section {
    margin: 0 24px;
    padding: 16px;
  }
  
  .video-action-section {
    padding: 16px 24px 20px;
    flex-direction: column;
    gap: 12px;
  }
  
  .back-btn {
    padding: 10px 20px;
    font-size: 14px;
  }
  
  .footer-options {
    bottom: 12px;
    right: 16px;
  }
}
</style>