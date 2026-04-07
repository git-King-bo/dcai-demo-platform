<template>
  <div :class="['operator-workflow', { 'canvas-fullscreen': isFullscreen, 'panel-expanded': panelOpen || templatePanelOpen }]" @click="closeMenu">
    <!-- Floating Header Toolbar -->
    <header class="workflow-header">
      <div class="header-left" @click.stop="handleHistoryClick">
        <!-- <img class="w-4 h-4" src="@/assets/images/history_icon.jpg" alt=""> -->
        <el-icon><clock /></el-icon>
        <span class="header-left-text">历史对话</span>
        <button class="new-conversation-btn" @click.stop="handleNewConversation">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
        </button>
      </div>
        <div class="line-sty"></div>
      <div class="header-center">
        <button
          :class="['action-button', 'resource', {
            'agent-active': getAgentStore().isOpen,
            'agent-thinking': getAgentStore().isThinking
          }]"
          @click="toggleAgentPanel"
          title="DataFlow-Agent"
        >
          <img class="button-icon agent-icon" :src="agentIcon" width="20" height="20" />
          管线编排 Agent
        </button>
        <!-- kps/sz: 任务列表按钮可见; adp: 隐藏 -->
        <button v-if="props.appVariant === 'isShow'" class="action-button resource" @click="goToTaskList">
          <svg class="button-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1L9 7V9C9 10.1 9.9 11 11 11V16L7.5 17.5C7.09 17.66 6.84 18.08 6.84 18.5S7.09 19.34 7.5 19.5L11 21V22H13V21L16.5 19.5C16.91 19.34 17.16 18.92 17.16 18.5S16.91 17.66 16.5 17.5L13 16V11C14.1 11 15 10.1 15 9ZM12 8C12.55 8 13 7.55 13 7S12.55 6 12 6 11 6.45 11 7 11.45 8 12 8Z"/>
          </svg>
          任务列表
        </button>
        <button class="action-button resource" @click="addDatasetNode">
          <svg class="button-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3C7.58 3 4 4.79 4 7C4 9.21 7.58 11 12 11S20 9.21 20 7C20 4.79 16.42 3 12 3ZM4 9V12C4 14.21 7.58 16 12 16S20 14.21 20 12V9C20 11.21 16.42 13 12 13S4 11.21 4 9ZM4 14V17C4 19.21 7.58 21 12 21S20 19.21 20 17V14C20 16.21 16.42 18 12 18S4 16.21 4 14Z"/>
          </svg>
          数据集
        </button>
        <button class="action-button resource" @click.stop="togglePanel" title="算子库">
          <svg :class="['button-icon drawer-icon', { 'drawer-icon-open': panelOpen }]" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 6H21V8H3V6ZM3 11H21V13H3V11ZM3 16H21V18H3V16Z"/>
          </svg>
          算子库
        </button>
        <button class="action-button resource" @click.stop="toggleTemplatePanel" title="常用Pipeline">
          <svg :class="['button-icon drawer-icon', { 'drawer-icon-open': templatePanelOpen }]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 20H16.8C15.1198 20 14.2798 20 13.638 19.673C13.0735 19.3854 12.6146 18.9265 12.327 18.362C12 17.7202 12 16.8802 12 15.2V8.8C12 7.11984 12 6.27976 12.327 5.63803C12.6146 5.07354 13.0735 4.6146 13.638 4.32698C14.2798 4 15.1198 4 16.8 4H17M17 20C17 21.1046 17.8954 22 19 22C20.1046 22 21 21.1046 21 20C21 18.8954 20.1046 18 19 18C17.8954 18 17 18.8954 17 20ZM17 4C17 5.10457 17.8954 6 19 6C20.1046 6 21 5.10457 21 4C21 2.89543 20.1046 2 19 2C17.8954 2 17 2.89543 17 4ZM7 12L17 12M7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12ZM17 12C17 13.1046 17.8954 14 19 14C20.1046 14 21 13.1046 21 12C21 10.8954 20.1046 10 19 10C17.8954 10 17 10.8954 17 12Z"/>
          </svg>
          Pipeline库
        </button>
        <!-- adp: savePipeline 在中间工具栏 -->
        <button v-if="props.appVariant !== 'isShow'" class="action-button resource" @click="savePipeline">
          <svg class="button-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3ZM19 19H5V5H16.17L19 7.83V19ZM12 12C10.34 12 9 13.34 9 15S10.34 18 12 18 15 16.66 15 15 13.66 12 12 12ZM6 6V10H15V6H6Z"/>
          </svg>
          保存Pipeline
        </button>
      </div>

      <div class="header-right">
        <!-- Canvas Controls - Desktop -->
        <div v-if="!isMobile" class="canvas-controls">
          <!-- kps/sz: savePipeline 在右侧工具栏 -->
          <button v-if="props.appVariant === 'isShow'" class="action-button button-line" @click="savePipeline">
            <svg class="button-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3ZM19 19H5V5H16.17L19 7.83V19ZM12 12C10.34 12 9 13.34 9 15S10.34 18 12 18 15 16.66 15 15 13.66 12 12 12ZM6 6V10H15V6H6Z"/>
            </svg>
            保存Pipeline
          </button>
        <button class="action-button button-line" @click="clearCanvas" title="清空画布">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"/>
            </svg>
            <!-- 清空画布 -->
          </button>
           <button v-if="props.appVariant !== 'isShow'" class="action-button button-line" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏'">
            <svg v-if="!isFullscreen" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 5H10V7H7V10H5V5ZM14 5H19V10H17V7H14V5ZM17 14H19V19H14V17H17V14ZM10 17V19H5V14H7V17H10Z"/>
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 14H19V16H16V19H14V14ZM5 14H10V19H8V16H5V14ZM8 5H10V10H5V8H8V5ZM19 8V10H14V5H16V8H19Z"/>
            </svg>
          </button>
        <button style="border-radius: 4px;" :class="['action-button', 'primary']" @click="handleExecute()" :disabled="!canExecute">
          <svg class="button-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <!-- <path v-if="['STARTED', 'RUNNING'].includes(taskStatus)" d="M6 6H18V18H6V6Z"/> -->
            <path d="M8 5V19L19 12L8 5Z"/>
          </svg>
          执行任务
          <!-- {{ ['STARTED', 'RUNNING'].includes(taskStatus) ? '停止任务' : '执行任务' }} -->
        </button>

        </div>

        <!-- Menu Button - Mobile -->
        <button v-if="isMobile" class="action-button menu-button" @click.stop="toggleMenu" title="菜单">
          <svg class="button-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path v-if="isMenuOpen" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            <path v-else d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>

        <!-- Mobile Menu -->
        <div v-if="isMobile" class="navbar-menu" :class="{ 'is-active': isMenuOpen }" @click="isMenuOpen=false">
          <div class="mobile-menu-items">
            <template v-if="props.appVariant !== 'isShow'">
              <button v-if="isFullscreen" class="action-button button-line" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 5H10V7H7V10H5V5ZM14 5H19V10H17V7H14V5ZM17 14H19V19H14V17H17V14ZM10 17V19H5V14H7V17H10Z"/>
                </svg>
                退出全屏
              </button>
              <button v-else class="action-button button-line" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 14H19V16H16V19H14V14ZM5 14H10V19H8V16H5V14ZM8 5H10V10H5V8H8V5ZM19 8V10H14V5H16V8H19Z"/>
                </svg>
                全屏模式
              </button>
            </template>
            <button v-if="props.appVariant === 'isShow'" class="action-button button-line" @click="savePipeline">
              <svg class="button-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V7L17 3ZM19 19H5V5H16.17L19 7.83V19ZM12 12C10.34 12 9 13.34 9 15S10.34 18 12 18 15 16.66 15 15 13.66 12 12 12ZM6 6V10H15V6H6Z"/>
              </svg>
              保存Pipeline
            </button>
            <button class="action-button button-line" @click="clearCanvas" title="清空画布">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM19 4H15.5L14.5 3H9.5L8.5 4H5V6H19V4Z"/>
              </svg>
              清空画布
            </button>
            <button style="border-radius: 4px;" :class="['action-button', 'primary']" @click="handleExecute(); isMenuOpen=false" :disabled="!canExecute">
              <svg class="button-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <!-- <path v-if="['STARTED', 'RUNNING'].includes(taskStatus)" d="M6 6H18V18H6V6Z"/> -->
                <path  d="M8 5V19L19 12L8 5Z"/>
              </svg>
              执行任务
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Canvas Area (Full Page) -->
    <main class="canvas-container">
      <div class="canvas-wrapper">
        <VueFlow
          v-model:nodes="nodes"
          v-model:edges="edges"
          :node-types="nodeTypes"
          :delete-key-code="['Backspace', 'Delete']"
          :default-zoom="0.6"
          :min-zoom="0.1"
          :max-zoom="2"
          :snap-to-grid="true"
          :snap-grid="[20, 20]"
          :pan-on-drag="isPanMode"
          :selection-key-code="isPanMode ? null : 'Shift'"
          class="workflow-canvas"
          @node-click="onNodeClick"
          @connect="handleConnect"
          @edges-change="handleEdgesChange"
          @drop="onDrop"
          @dragover="onDragOver"
          @pane-click="onPaneClick"
          ref="vueFlowRef"
        >
          <Background pattern="dots" :gap="20" size="2" color="#D1D1D6" />

          <!-- DataFlow Watermark -->
          <div class="dataflow-watermark">
            {{ props.canvasText}}
          </div>
        </VueFlow>
      </div>
    </main>

    <!-- Operator Panel (Overlay) -->
    <!-- 算子库面板 -->
    <OperatorPanel
      :open="panelOpen"
      :operators="operators"
      :loading="operatorsLoading"
      @refresh="loadOperators"
    />

    <!-- Template Panel -->
    <TemplatePanel
      :is-open="templatePanelOpen"
      @close="templatePanelOpen = false"
      @apply-template="handleApplyTemplate"
    />

    <!-- History Sidebar -->
    <HistorySidebar
      v-model:showHistory="showHistory"
      @close="showHistory = false"
    />

    <!-- Agent Panel -->
    <AgentPanel
      :canvas-context="canvasContext"
      :isSidebar="isSidebar"
      @focus-node="handleFocusNode"
      @save-pipeline="savePipeline"
    />

    <!-- 保存任务对话框 -->
    <el-dialog
      v-model="saveDialogVisible"
      title="保存任务"
      width="500px"
      :close-on-click-modal="false"
      align-center
      destroy-on-close
      class="apple-dialog"
      @keydown.enter.prevent
    >
      <el-form :model="taskForm" label-position="top" :rules="taskRules" ref="taskFormRef" @submit.prevent>
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="taskForm.name" placeholder="请输入任务名称"></el-input>
        </el-form-item>
        <el-form-item label="任务描述" prop="description">
          <el-input v-model="taskForm.description" type="textarea" :rows="3" placeholder="请输入任务描述"></el-input>
        </el-form-item>
        <el-form-item label="数据集ID" prop="dataset_ids">
          <el-tag
            v-for="id in taskForm.dataset_ids"
            :key="id"
            type="info"
            style="margin-right: 4px;"
          >{{ id }}</el-tag>
          <div v-if="!taskForm.dataset_ids.length" style="color: #bbb;">请添加数据集</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="saveDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveTask" :loading="saveLoading">保存</el-button>
        </span>
      </template>
    </el-dialog>
    <!-- 保存Pipeline对话框 -->
    <el-dialog
      v-model="savePipelineDialogVisible"
      title="保存Pipeline模板"
      width="500px"
      :close-on-click-modal="false"
      align-center
      destroy-on-close
      class="apple-dialog"
      @keydown.enter.prevent
    >
      <el-form :model="pipelineForm" label-position="top" :rules="pipelineRules" ref="pipelineFormRef" @submit.prevent>
        <el-form-item label="Pipeline名称" prop="name">
          <el-input v-model="pipelineForm.name" placeholder="请输入Pipeline名称"></el-input>
        </el-form-item>
        <el-form-item label="Pipeline描述" prop="description">
          <el-input v-model="pipelineForm.description" type="textarea" :rows="3" placeholder="请输入Pipeline描述"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="savePipelineDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSavePipelineTemplate" :loading="savePipelineLoading">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 算子工作流引导组件 -->
    <OperatorWorkflowGuide
      ref="workflowGuideRef"
      @close="onGuideClose"
      @start="onGuideStart"
    />
    <!-- Agent Loading -->
    <AgentLoading
      v-model="agentLoading"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, markRaw, provide, watch, onActivated ,onDeactivated} from 'vue'

// VueFlow：可视化流程图库
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import '@vue-flow/core/dist/style.css'

// Element Plus UI组件
import { ElMessage, ElMessageBox } from 'element-plus'
import { Clock } from '@element-plus/icons-vue'

// 路由
import { useRoute, useRouter } from 'vue-router'

// 图标资源
import agentIcon from '@/assets/dataflow/agent.svg'

// 算子相关：加载、搜索、分类等
import { useOperators } from './composables/useOperators'
// 节点相关：添加、删除、更新节点
import { useNodes } from './composables/useNodes'
// 连线相关：连接、值传递等
import { useEdges } from './composables/useEdges'
// Pipeline构建：将画布数据转换为可执行配置
import { usePipeline } from './composables/usePipeline'
// 任务管理：保存、执行任务
import { useTaskManagement } from './composables/useTaskManagement'

// 节点组件：不同类型的算子节点
import OperatorNode from './components/OperatorNode.vue'
import TrainOperatorNode from './components/TrainOperatorNode.vue'
import DatasetNode from './components/DatasetNode.vue'
import ModelNode from './components/ModelNode.vue'
import MinerUNode from './components/MinerUNode.vue'
import UniParserNode from './components/UniParserNode.vue'
import PromptTemplatedGeneratorNode from './components/PromptTemplatedGeneratorNode.vue'

// UI组件：面板、侧边栏等
import OperatorPanel from './components/OperatorPanel.vue'
import TemplatePanel from './components/TemplatePanel.vue'
import AgentPanel from './components/AgentPanel.vue'
import HistorySidebar from './components/HistorySidebar.vue'
import OperatorWorkflowGuide from './components/OperatorWorkflowGuide.vue'
import AgentLoading from './components/AgentLoading.vue'

// 状态管理
import { useAgentStore } from '@/store/modules/agent'

// Agent相关Composables
import { useAgentWebSocket } from '../../composables/useAgentWebSocket'
import { useAgentQueue } from '../../composables/useAgentQueue'
import { useAgentMessages } from '../../composables/useAgentMessages'

// 工具函数和API
import { onDragOver as dragOverHandler, handleNodeDrop } from './utils/dragAndDrop'
import { fetchLibOperators } from '@/api/dataflow.js'

// 组件名称，用于 keep-alive 缓存
defineOptions({
  name: 'OperatorWorkflow'
})

// 通过路由 props 传入，用于适配不同业务逻辑
const props = defineProps({
  // 项目区分
  confirmAutoRun: {
    type: Boolean,
    default: false
  },
  canvasText:{
    type: String,
    default: 'DataFlow',
  },
  // 控制 AgentFormRequest 等组件的 UI
  appVariant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'isShow'].includes(v)
  }
})

// 基础实例
const route = useRoute()
const router = useRouter()
let agentStore = null
function getAgentStore() {
  if (!agentStore) {
    agentStore = useAgentStore()
  }
  return agentStore
}
const { vueFlowInstance, setTransform, fitView } = useVueFlow()

// 不同的算子类型对应不同的Vue组件
const nodeTypes = {
  operator: markRaw(OperatorNode),                    // 通用算子
  trainOperator: markRaw(TrainOperatorNode),          // 训练算子
  mineruOperator: markRaw(MinerUNode),                // MinerU解析器
  uniParserOperator: markRaw(UniParserNode),          // UniParser解析器
  promptTemplatedGeneratorOperator: markRaw(PromptTemplatedGeneratorNode),  // Prompt生成器
  dataset: markRaw(DatasetNode),                      // 数据集节点
  model: markRaw(ModelNode)                           // 模型配置节点
}

// 算子管理：仅保留 operators/loadOperators/operatorsLoading 供 useNodes 和 OperatorPanel 共用
// 搜索、分类、拖拽等 UI 状态已内化到 OperatorPanel 组件中
const {
  operators,                    // 算子列表（与 useNodes 共用同一份 ref）
  operatorsLoading,             // 加载状态（传给 OperatorPanel 展示）
  loadOperators,                // 加载方法（onMounted + 刷新按钮触发）
  loadLibOperators,             // 加载第三方算子库
} = useOperators()

// 节点管理：创建、更新、删除节点和验证
const {
  nodes,                        // 画布上的所有节点
  selectedNodeId,               // 当前选中的节点ID
  nodeIdCounter,                // 节点ID生成器
  nodeCount,                    // 节点总数
  canExecute,                   // 是否可以执行（至少有一个节点）
  isOperatorNode,               // 判断是否为算子节点
  addNode,                      // 添加节点
  onNodeUpdate,                 // 更新节点数据
  onNodeDelete,                 // 删除节点
  onNodeClick,                  // 点击节点
  onPaneClick,                  // 点击画布空白处
  addDatasetNode,               // 快速添加数据集节点
  clearNodes,                   // 清空所有节点
  validateRequiredFields,       // 验证必填字段
  getSourceFieldValue,          // 获取源节点字段值
} = useNodes(operators, (nodeId, updates) => {
  // 节点更新时自动传播数据到下游节点
  propagateDisplayValues(nodeId, updates, getSourceFieldValue)
})

// 连线管理：节点之间的连接关系和数据流转
const {
  edges,                        // 画布上的所有连线
  onConnect: edgeConnect,       // 创建新连线
  onEdgesChange: edgeChanges,   // 连线变化（删除等）
  clearEdges,                   // 清空所有连线
  getMergedValueForTargetPort,  // 获取目标端口的合并值
  propagateDisplayValues,       // 传播显示值
  determineFieldCategory,       // 判断字段分类
} = useEdges(nodes, onNodeUpdate)

// Pipeline构建：将可视化的节点和连线转换为后端可执行的配置
const {
  buildPipelineData,            // 构建Pipeline配置数据
} = usePipeline(nodes, edges, isOperatorNode)

// 任务管理：保存和执行工作流任务
const {
  saveDialogVisible,            // 保存任务对话框显示状态
  savePipelineDialogVisible,    // 保存Pipeline对话框显示状态
  saveLoading,                  // 保存任务加载状态
  savePipelineLoading,          // 保存Pipeline加载状态
  taskForm,                     // 任务表单数据
  pipelineForm,                 // Pipeline表单数据
  taskRules,                    // 任务表单验证规则
  pipelineRules,                // Pipeline表单验证规则
  saveTask,                     // 保存任务
  savePipeline,                 // 保存Pipeline模板
  savePipelineTemplate,         // 保存Pipeline模板（另一种方式）
  handleExecutePipeline,        // 执行Pipeline
} = useTaskManagement(buildPipelineData, nodes, edges)

const panelOpen = ref(false)                    // 算子面板是否打开
const templatePanelOpen = ref(false)            // 模板面板是否打开
const showHistory = ref(false)                  // 历史记录是否显示
const isFullscreen = ref(false)                  // 画布是否全屏
const isPanMode = ref(true)                     // 是否为拖动模式（true=拖动画布，false=选择节点）
const agentLoading = ref(false)                 // Agent加载动画
const isMenuOpen = ref(false)                   // 移动端菜单是否打开
const isMobile = ref(false)                     // 是否为移动端
const workflowGuideRef = ref(null)              // 新手引导组件引用
const taskFormRef = ref(null)                   // 任务表单引用
const pipelineFormRef = ref(null)               // Pipeline表单引用
const vueFlowRef = ref(null)                    // VueFlow实例引用


const {
  clearQueue: clearAgentQueue,                  // 清空Agent任务队列
} = useAgentQueue()

const {
  clearMessages,                                // 清空聊天消息
} = useAgentMessages()

// autoConnect: false 表示手动控制连接时机，避免不必要的连接
const socketByWorkflow = useAgentWebSocket({ autoConnect: false })
const { setMessageHandlers, stopCurrentTask, startNewConversation, loadConversation } = socketByWorkflow

// 通过provide/inject向子组件传递socket实例，避免多次创建
provide('socketByWorkflow', socketByWorkflow)

// 重置画布视图：回到默认位置和缩放比例
const resetTransform = () => {
  if (setTransform) {
    setTransform({ x: 0, y: 0, zoom: 0.6 })
  }
}

// 清空画布：删除所有节点、连线，并重置视图
const resetCanvas = () => {
  console.log('清空画布')
  clearNodes()
  clearEdges()
  clearAgentQueue()
  resetTransform()
  ElMessage.success('画布已清空,正在重新规划方案...')
}

// Provide数据给子组件

provide('onNodeUpdate', onNodeUpdate)
provide('onNodeDelete', onNodeDelete)
provide('addDatasetNode', addDatasetNode)
provide('resetCanvas', resetCanvas)
provide('saveTask', (taskAuto) => saveTask(taskFormRef.value, taskAuto))
// 向 MessageConfirm 传递：确认后是否自动执行任务（kps/sz=true, adp=false）
provide('confirmAutoRun', props.confirmAutoRun)
// 向 AgentFormRequest 等传递 UI 变体标识
provide('appVariant', props.appVariant)

// 判断是否有侧边栏打开（用于调整布局）
const isSidebar = computed(() => {
  return showHistory.value || templatePanelOpen.value || panelOpen.value
})

// 给Agent传递的画布上下文信息
const canvasContext = computed(() => ({
  nodes: nodes.value,
  edges: edges.value,
  canvasState: {
    zoom: 0.6,
    isFullscreen: isFullscreen.value,
    selectedNodeId: selectedNodeId.value
  }
}))
// 跳转到任务列表页
const goToTaskList = () => {
  router.push('/task')
}
// 打开算子面板时，自动关闭其他面板
const togglePanel = () => {
  panelOpen.value = !panelOpen.value
  if (panelOpen.value) {
    templatePanelOpen.value = false
    showHistory.value = false
  }
}

// 切换模板面板
const toggleTemplatePanel = () => {
  templatePanelOpen.value = !templatePanelOpen.value
  if (templatePanelOpen.value) {
    panelOpen.value = false
    showHistory.value = false
  }
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

// 用户点击画布空白处时会触发，关闭所有菜单和面板
const closeMenu = () => {
  isMenuOpen.value = false
  templatePanelOpen.value = false
  panelOpen.value = false
  showHistory.value = false
}

// 打开历史对话侧边栏
const handleHistoryClick = () => {
  showHistory.value = true
}

// 开始新的Agent对话，会停止当前任务，清空之前的对话历史
const handleNewConversation = async () => {
  getAgentStore().openPanel()
  await stopCurrentTask()
  startNewConversation()
  panelOpen.value = false
  templatePanelOpen.value = false
  showHistory.value = false
  ElMessage.success('已开始新会话')
}

// 切换Agent面板
const toggleAgentPanel = () => {
  getAgentStore().togglePanel()
  if (getAgentStore().isOpen) {
    // 打开Agent时关闭其他面板
    panelOpen.value = false
    templatePanelOpen.value = false
    // 确保画布处于全屏状态，给Agent更多空间
    if (!isFullscreen.value) {
      isFullscreen.value = true
    }
  }
}
// Agent会用这个方法来高亮显示新创建的节点
const handleFocusNode = (nodeId) => {
  if (vueFlowInstance) {
    vueFlowInstance.fitView({
      nodes: [nodeId],
      duration: 600,      // 600ms的平滑动画
      padding: 100        // 节点周围留100px的空白
    })
    selectedNodeId.value = nodeId
  }
}

// 用户主动清空和Agent自动清空是两个不同的方法
const clearCanvas = () => {
  ElMessageBox.confirm(
    '确定要清空整个画布吗？此操作将删除所有节点和连线，且无法撤销。',
    '清空画布',
    {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    clearNodes()
    clearEdges()
    ElMessage.success('画布已清空')
  }).catch(() => {
    console.log('取消清空画布')
  })
}

// 拖拽经过画布时触发
const onDragOver = (event) => {
  dragOverHandler(event)
}

// 支持两种拖拽：算子节点 和 Pipeline模板
const onDrop = async (event) => {
  const result = await handleNodeDrop(event, nodes.value, operators.value, nodeIdCounter, addNode)

  if (result.type === 'node') {
    ElMessage.success(`已添加算子: ${result.data.data.operator.name}`)
  } else if (result.type === 'template') {
    await handleApplyTemplate(result.data.template)
  } else if (result.type === 'error') {
    ElMessage.error('添加失败')
  }
}

// Agent会调用这个方法将生成的Pipeline应用到画布上
const buildPipelineTemplate= async (template) => {
  try{
  // 合并不同类型的pipeline配置（支持多模态：文本、音频、视频）
  const pipeline_config_all = {
      edges:[
        ...(template?.pipeline_config.edges ||[]),
        ...(template?.pipeline_config_a?.edges || []),
        ...(template?.pipeline_config_v?.edges|| [])
      ],
      nodes:[
        ...(template?.pipeline_config.nodes ||[]),
        ...(template?.pipeline_config_a?.nodes || []),
        ...(template?.pipeline_config_v?.nodes|| [])
      ]
    }
    const templateNodes = pipeline_config_all.nodes || []
    const newNodes = []
    const LAYOUT_CONFIG = {
      NODES_PER_ROW: 1000,           // 每行4个节点
      NODE_WIDTH: 280,            // 节点宽度
      NODE_HEIGHT: 350,           // 节点高度
      HORIZONTAL_SPACING: 380,    // 水平间距：节点宽度 + 80px间隙
      VERTICAL_SPACING: 480,      // 垂直间距：节点高度 + 60px间隙
      START_X: 560,               // 起始X坐标
      START_Y: 400                // 起始Y坐标
    }

    const startPosition = {
      x: LAYOUT_CONFIG.START_X,
      y: LAYOUT_CONFIG.START_Y
    }

    // 预加载算子库
    try {
      const response = await fetchLibOperators()
      if (response.code === 0 && response.data && response.data.list) {
        const libOperators = response.data.list

        // 将第三方算子添加到operators中（如果还没有的话）
        libOperators.forEach(op => {
          const category = categorizeOperator(op.type || op.name)
          const existingIndex = operators.value.findIndex(item => item.id === op.id)
          if (existingIndex >= 0) {
            operators.value[existingIndex] = {
              ...op,
              category: category
            }
          } else {
            operators.value.push({
              ...op,
              category: category
            })
          }
        })

      }
    } catch (error) {
      console.error('预加载第三方算子失败:', error)
    }

    // 因为画布上可能已经有节点了，避免ID冲突
    const oldIdToNewIdMap = new Map()
    let X_PADDING= 0
    // 遍历模板中的每个节点，创建新节点
    templateNodes.forEach((templateNode, index) => {
      // 计算节点在网格中的位置
      const row = Math.floor(index / LAYOUT_CONFIG.NODES_PER_ROW)
      const col = index % LAYOUT_CONFIG.NODES_PER_ROW

      console.log(X_PADDING,'X_PADDING')
      // 标准网格布局：从左到右，从上到下排列
      const position = {
        x: (startPosition.x+X_PADDING)+ (col * LAYOUT_CONFIG.HORIZONTAL_SPACING),
        y: startPosition.y + (row * LAYOUT_CONFIG.VERTICAL_SPACING)
      }
      if (templateNode.name === 'UniParser') {
          X_PADDING += 560
      }
      // 根据节点类型创建不同的节点
      let newNode
      if (templateNode.name === 'dataset' || templateNode.type === 'dataset') {
        // 数据集节点
        newNode = {
          id: `dataset${nodeIdCounter.value++}`,
          type: 'dataset',
          position:templateNode.position,
          data: {
            type: 'dataset',
            label: '数据集',
            config: templateNode.config || {
              selectedDataset: '',
              datasets: []
            }
          }
        }
      } else if (templateNode.type === 'model') {
        // 模型配置节点
        newNode = {
          id: `model${nodeIdCounter.value++}`,
          type: 'model',
          position,
          data: {
            type: 'model',
            label: '模型配置',
            config: templateNode.config || {
              name: '',
              baseUrl: '',
              apiKey: ''
            }
          }
        }
      } else {
        // 算子节点：需要从算子库中找到完整定义
        const operatorName = templateNode.name || templateNode.operator?.name

        // 不区分大小写匹配算子名称
        const fullOperator = operators.value.find(op => op.name.toLowerCase() === operatorName.toLowerCase())

        if (!fullOperator) {
          ElMessage.error(`模版中的算子 "${operatorName}" 在算子库中未找到，请检查算子库`)
          return
        }

        // 根据算子的特征选择合适的节点组件
        let nodeType
        if (fullOperator.id === 'parser_mineru_parser_mineruparser') {
          nodeType = 'mineruOperator'          // MinerU解析器专用组件
        } else if (fullOperator.id === 'parser_uniparser_uniparser') {
          nodeType = 'uniParserOperator'       // UniParser专用组件
        } else if (fullOperator.type === 'train') {
          nodeType = 'trainOperator'           // 训练算子专用组件
        } else {
          nodeType = 'operator'                // 通用算子组件
        }

        // run: 运行时参数, init: 初始化参数
        const savedRunConfig = templateNode.config?.run || {}
        const savedInitConfig = templateNode.config?.init || {}

        newNode = {
          id: templateNode.id || `node${nodeIdCounter.value++}`,
          type: nodeType,
          position:position || position,
          data: {
            operator: fullOperator,              // 算子完整定义（包含schema）
            runConfig: savedRunConfig,           // 恢复运行时配置
            initConfig: savedInitConfig,         // 恢复初始化配置
            config: {}                           // 兼容性字段
          }
        }
      }

      // 记录ID映射关系，后面创建连线时需要用
      if (templateNode.id) {
        oldIdToNewIdMap.set(templateNode.id, newNode.id)
      } else {
        // 后备方案：如果模板没有ID，用序号
        oldIdToNewIdMap.set(`node${index + 1}`, newNode.id)
      }
      newNodes.push(newNode)
    })

    console.log('🗺️ 旧ID到新ID的映射表:', Array.from(oldIdToNewIdMap.entries()))

    // 把所有新节点添加到画布
    nodes.value.push(...newNodes)

    console.log('新创建的算子节点端口信息:')
    newNodes.forEach(node => {
      if (isOperatorNode(node)) {
        const operator = node.data?.operator
        if (operator) {
          console.log(`节点 ${node.id} (${operator.name}):`)
          if (operator.config?.run) {
            console.log('  run字段:', Object.keys(operator.config.run))
          }
          if (operator.config?.init) {
            console.log('  init字段:', Object.keys(operator.config.init))
          }
        }
      }
    })

    // 处理连线：将节点按照模板配置连接起来
    const newEdges = []
    const templateEdges = pipeline_config_all?.edges || []

    if (templateEdges.length > 0) {
      console.log('开始处理连线配置...')
      console.log('模板边列表:', templateEdges)

      // 根据模板的连线配置创建连线
      templateEdges.forEach((templateEdge, index) => {

        console.log(`处理边 ${index}:`, {
          source: templateEdge.source,
          target: templateEdge.target,
          source_port: templateEdge.source_port,
          target_port: templateEdge.target_port
        })

        // 把模板中的旧节点ID转换为新创建的节点ID
        const sourceNodeId = oldIdToNewIdMap.get(templateEdge.source)
        const targetNodeId = oldIdToNewIdMap.get(templateEdge.target)
        console.log(`节点映射结果: sourceNodeId=${sourceNodeId}, targetNodeId=${targetNodeId}`)
        console.log(`端口信息: source_port=${templateEdge.source_port}, target_port=${templateEdge.target_port}`)

        if (sourceNodeId && targetNodeId) {
          let edge

            // 端口级连线：直接连接算子的输入输出端口
            edge = {
              id: `template-edge-${sourceNodeId}-${targetNodeId}-${index}`,
              source: sourceNodeId,
              target: targetNodeId,
              sourceHandle: templateEdge.source_port || "output_file",  // 源端口
              targetHandle: templateEdge.target_port || "input_file",   // 目标端口
              type: 'default',
              animated: true,               // 动画效果
              style: {
                strokeWidth: 6,
                stroke: '#FF6B35'           // 橙色连线
              }
            }
            console.log(`创建端口级连线:`, edge)


          newEdges.push(edge)
        } else {
          console.warn(`跳过无效连线: 源节点 ${templateEdge.source} -> 目标节点 ${templateEdge.target}，映射后: ${sourceNodeId} -> ${targetNodeId}`)
        }
      })
    } else {
      // 后备方案：如果模板没指定连线，就按顺序把节点连起来
      console.log('模板不包含edges配置，使用顺序连接作为后备方案')

      const operatorNodes = newNodes.filter(node => isOperatorNode(node))

      for (let i = 0; i < operatorNodes.length - 1; i++) {
        const sourceNode = operatorNodes[i]
        const targetNode = operatorNodes[i + 1]

        let edge

          // 使用默认端口连接
          edge = {
            id: `template-edge-${sourceNode.id}-${targetNode.id}`,
            source: sourceNode.id,
            target: targetNode.id,
            sourceHandle: "output_file",    // 默认输出端口
            targetHandle: "input_file",     // 默认输入端口
            type: 'default',
            animated: true,
            style: {
              strokeWidth: 6,
              stroke: '#FF6B35'
            }
          }


        newEdges.push(edge)
      }
    }

    // 把连线添加到画布
    if (newEdges.length > 0) {
      edges.value.push(...newEdges)
      console.log(`应用了 ${newEdges.length} 条连线`)

      // 等待Vue更新DOM，然后触发值传播
      await nextTick()
      console.log('[模板应用] Vue更新完成，开始执行连线值传播...')
      applyConnectionValues()
    }
  }catch(error){
    console.error('应用Pipeline模板失败:', error)
  }
}
const categorizeOperator = (type) => {
  const typeMap = {
    'parser': ['parser'],
    'data-process': ['filter'],
    'data-synthesis': ['generate'],
    'data-evaluation': ['eval'],
    'model_finetune': ['train']
  }

  const typeLower = type.toLowerCase()
  for (const [category, keywords] of Object.entries(typeMap)) {
    if (keywords.some(keyword => typeLower.includes(keyword))) {
      return category
    }
  }
  return 'data-process' // 默认分类
}

const applyConnectionValues = () => {
  console.log('[连线值传播] 开始应用连线值传播...')

  // 1️⃣ 收集所有目标端口的连接情况
  const targetPortConnections = new Map()

  edges.value.forEach(edge => {
    if (edge.target && edge.targetHandle) {
      const targetPortKey = `${edge.target}.${edge.targetHandle}`
      if (!targetPortConnections.has(targetPortKey)) {
        targetPortConnections.set(targetPortKey, [])
      }
      targetPortConnections.get(targetPortKey).push(edge)
    }
  })

  console.log(`[连线值传播] 找到 ${targetPortConnections.size} 个目标端口需要处理`)

  // 2️⃣ 对每个目标端口，计算合并值并更新
  let updatedCount = 0
  targetPortConnections.forEach((connections, targetPortKey) => {
    const [targetNodeId, targetField] = targetPortKey.split('.')
    console.log(` [连线值传播] 处理目标端口: ${targetPortKey}, 连接数: ${connections.length}`)
    // 获取合并值
    const mergedValue = getMergedValueForTargetPort(targetNodeId, targetField,getSourceFieldValue)
    console.log(`  计算的合并值: ${mergedValue}`)

    if (mergedValue !== undefined) {
      const targetCategory = determineFieldCategory(targetNodeId, targetField)
      console.log(`  字段类型: ${targetCategory}`)

      // 更新目标节点配置
      if (targetCategory === 'run') {
        onNodeUpdate(targetNodeId, {
          runConfig: { [targetField]: mergedValue },
          _fromConnection: true  // 标记这是来自连接的更新
        })
        updatedCount++
      } else if (targetCategory === 'init') {
        onNodeUpdate(targetNodeId, {
          initConfig: { [targetField]: mergedValue },
          _fromConnection: true  // 标记这是来自连接的更新
        })
        updatedCount++
      }

      console.log(`  已更新节点 ${targetNodeId} 的字段 ${targetField}`)
    } else {
      console.log(`  合并值为 undefined，跳过更新`)
    }
  })

  console.log(`[连线值传播] 连线值传播完成，共更新 ${updatedCount} 个字段`)
}
// 用户手动连接两个节点时触发
const handleConnect = (connection) => {
  edgeConnect(connection, getSourceFieldValue)
}

// 连线发生变化（删除、更新）时触发
const handleEdgesChange = (changes) => {
  edgeChanges(changes, getSourceFieldValue)
}

// 执行Pipeline：先验证必填字段，然后提交任务
const handleExecute = () => {
  handleExecutePipeline(validateRequiredFields)
}

// 保存任务表单
const handleSaveTask = () => {
  saveTask(taskFormRef.value)
}

// 保存Pipeline模板表单
const handleSavePipelineTemplate = () => {
  savePipelineTemplate(pipelineFormRef.value)
}

// 切换全屏/退出全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
}

// 新手引导关闭（用户跳过引导）
const onGuideClose = () => {}

// 新手引导开始（用户点击开始使用，打开算子面板引导操作）
const onGuideStart = () => {
  panelOpen.value = true
}

// 应用Pipeline模板
// 支持两种来源：从模板库选择 或 从任务详情页复用
const handleApplyTemplate = async (template) => {
  if (!template.pipeline_config?.nodes) {
      ElMessage.warning('模版数据格式不正确：缺少节点信息')
      return
    }
    // 二次确认，防止误操作清空当前工作
    const shouldApply = await ElMessageBox.confirm(
      '应用模板将清空当前工作流，是否继续？',
      '确认应用模版',
      {
        confirmButtonText: '应用',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'apple-dialog'
      }
    )
    if (shouldApply !== 'confirm') {
      return
    }
    getAgentStore().setAgentDatasetVal(template?.dataset_ids?.[0] ?? '')
    getAgentStore().closePanel()
    getAgentStore().clearHistory()
    resetCanvas()
    buildPipelineTemplate(template)
  console.log('应用模板:', template)
  ElMessage.success('模板应用成功')
}

// 检查是否从任务详情页跳转过来复用Pipeline，如果是，自动应用之前保存的配置
const checkReusePipeline = async () => {
  const { from } = route.query
  if (from === 'reuse') {
    const template = sessionStorage.getItem('reusePipelineConfig')
    if (template) {
      const templateConfig = JSON.parse(template)
      sessionStorage.removeItem('reusePipelineConfig')
      await handleApplyTemplate(templateConfig)
    } else {
      console.log('sessionStorage中未找到Pipeline配置')
    }
  }
}

// 检测屏幕尺寸，切换移动端/桌面端布局
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 1300
}

// 特殊登录场景：从URL参数获取用户信息，支持外部系统直接跳转进来
const { tenantId,uid,historyId } = route.query

if(route.query.uid) {
  agentLoading.value = true
}
const handleKeydown = (event) => {
  if(props.appVariant === 'isShow') return
  if (event.key === 'Escape' && isFullscreen.value) {
    // ESC键退出画布全屏
    isFullscreen.value = false

    // 同时关闭 Agent 面板
    if (getAgentStore().isOpen) {
      getAgentStore().closePanel()
      console.log('ESC 退出全屏，自动关闭 Agent 面板')
    }
  }

  // 处理Delete键删除选中的节点
  if (event.key === 'Delete' || event.key === 'Backspace') {
    // 这里可以扩展为删除选中的节点功能
    // 目前暂时注释掉，因为需要实现节点选中状态管理
    // 但如果将来实现了，删除逻辑应该调用onNodeDelete函数
    console.log('Delete key pressed - node deletion via keyboard not implemented yet')
  }
}
onMounted(async () => {

  // 加载算子库（含第三方算子）
  await loadOperators()
  // loadLibOperators()

  // 初始化响应式布局
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)

  // 当Agent生成Pipeline时，会调用onAction回调
  setMessageHandlers({
    onAction: (data) => {
      buildPipelineTemplate(data)
      console.log('[Agent] 收到 onAction 回调:', data)
    }
  })

  // 检查是否需要复用之前的Pipeline
  checkReusePipeline()

  // 检查是否需要加载历史会话
  const { historyId } = route.query
  if (historyId) {
    getAgentStore().isOpen = true
    loadConversation(historyId)
  }

  // 初始化画布视图
  nextTick(() => {
    if (setTransform) {
      setTransform({ x: 0, y: 0, zoom: 0.6 })
    }
  })
  document.addEventListener('keydown', handleKeydown)

})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)

  // 停止Agent任务
  stopCurrentTask()
  getAgentStore().closePanel()

  // 清理Agent相关状态
  if (getAgentStore().setAgentDatasetVal) {
    getAgentStore().setAgentDatasetVal('')
  }
  if (getAgentStore().clearHistory) {
    getAgentStore().clearHistory()
  }

  // 移除事件监听
  window.removeEventListener('resize', checkScreenSize)
})

onMounted(() => {
  console.log('[DEBUG] OperatorWorkflow 组件挂载')
})

onUnmounted(() => {
  console.log('[DEBUG] OperatorWorkflow 组件卸载')
})

onActivated(() => {
  console.log('[DEBUG] OperatorWorkflow 组件激活（从缓存恢复）')
  
  // 检查是否需要加载历史会话
  const { historyId } = route.query
  if (historyId) {
    getAgentStore().isOpen = true
    loadConversation(historyId)
  }

  // 检查是否需要复用Pipeline
  checkReusePipeline()

  // 重置任务表单，避免上次的数据残留
  taskForm.name = ''
  taskForm.description = ''
  taskForm.dataset_ids = []
  taskForm.task_id = ''
  taskForm.fromExecute = false
})

onDeactivated(() => {
  console.log('[DEBUG] OperatorWorkflow 组件停用时（进入缓存）')
})
</script>

<style scoped src="./OperatorWorkflow.scss"></style>
