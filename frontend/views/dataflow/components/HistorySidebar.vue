<template>
  <aside :class="[{ 'panel-open': showHistory }, 'history-sidebar-container']">
    <transition name="history-slide">
      <div v-if="showHistory" class="history-sidebar" @click.stop>
        <!-- History Header -->
        <div class="history-header">
          <!-- <h3 class="history-title">历史对话</h3> -->
          <span class="header-text">收起侧栏</span>
          <!-- <img
            @click="showHistory = false"
            class="w-4 h-4 hover:cursor-pointer"
            src="@/assets/images/packUp.jpg"
            alt=""
          /> -->
          <el-icon
            @click="showHistory = false"
            class="w-4 h-4 hover:cursor-pointer"
            ><switch-filled />
          </el-icon>
        </div>

        <!-- New Conversation Button -->
        <button class="new-conversation-btn" @click="handleNewConversation">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>新建对话</span>
        </button>

        <!-- Search Box -->
        <div class="history-search">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            v-model="historySearchQuery"
            type="text"
            placeholder="搜索对话..."
            class="history-search-input"
          />
        </div>

        <!-- History List -->
        <div class="history-list">
          <!-- Loading -->
          <div v-if="isLoadingHistory" class="history-loading">
            <!-- <div class="loading-spinner"></div>
              <span>加载中...</span> -->
          </div>

          <!-- Empty State -->
          <div v-else-if="historyList.length === 0" class="history-empty">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              ></path>
            </svg>
            <p>暂无历史对话</p>
          </div>

          <!-- History Groups -->
          <div v-else class="history-groups">
            <!-- Today -->
            <div v-if="groupedHistory.today.length > 0" class="history-group">
              <div class="group-label">今天</div>
              <div
                v-for="item in groupedHistory.today"
                :key="item.id"
                class="history-item"
                :class="{ active: currentConversationId === item.id }"
                @click="selectHistoryItem(item)"
              >
                <div class="history-item-content">
                  <div class="history-item-title">{{ item.title }}</div>
                  <div class="history-item-time">
                    {{ formatTime(item.created_at || item.createdAt) }}
                  </div>
                </div>
                <button
                  class="history-item-delete"
                  @click="deleteHistoryItem(item, $event)"
                  title="删除"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Yesterday -->
            <div
              v-if="groupedHistory.yesterday.length > 0"
              class="history-group"
            >
              <div class="group-label">昨天</div>
              <div
                v-for="item in groupedHistory.yesterday"
                :key="item.id"
                class="history-item"
                :class="{ active: currentConversationId === item.id }"
                @click="selectHistoryItem(item)"
              >
                <div class="history-item-content">
                  <div class="history-item-title">{{ item.title }}</div>
                  <div class="history-item-time">
                    {{ formatTime(item.created_at || item.createdAt) }}
                  </div>
                </div>
                <button
                  class="history-item-delete"
                  @click="deleteHistoryItem(item, $event)"
                  title="删除"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Last Week -->
            <div
              v-if="groupedHistory.lastWeek.length > 0"
              class="history-group"
            >
              <div class="group-label">最近7天</div>
              <div
                v-for="item in groupedHistory.lastWeek"
                :key="item.id"
                class="history-item"
                :class="{ active: currentConversationId === item.id }"
                @click="selectHistoryItem(item)"
              >
                <div class="history-item-content">
                  <div class="history-item-title">{{ item.title }}</div>
                  <div class="history-item-time">
                    {{ formatTime(item.created_at || item.createdAt) }}
                  </div>
                </div>
                <button
                  class="history-item-delete"
                  @click="deleteHistoryItem(item, $event)"
                  title="删除"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Earlier -->
            <div v-if="groupedHistory.earlier.length > 0" class="history-group">
              <div class="group-label">更早</div>
              <div
                v-for="item in groupedHistory.earlier"
                :key="item.id"
                class="history-item"
                :class="{ active: currentConversationId === item.id }"
                @click="selectHistoryItem(item)"
              >
                <div class="history-item-content">
                  <div class="history-item-title">{{ item.title }}</div>
                  <div class="history-item-time">
                    {{ formatTime(item.created_at || item.createdAt) }}
                  </div>
                </div>
                <button
                  class="history-item-delete"
                  @click="deleteHistoryItem(item, $event)"
                  title="删除"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <!-- 加载更多触发器 -->
          <div v-if="hasMoreData" class="history-load-more">
            <div v-if="isLoadingMore" class="loading-more">
              <div class="loading-spinner small"></div>
              <span>加载中...</span>
            </div>
            <!-- IntersectionObserver目标元素 -->
            <div ref="observerTarget" class="observer-target"></div>
          </div>

          <!-- 没有更多数据 -->
          <div
            v-else-if="!hasMoreData && historyList.length > 0"
            class="history-no-more"
          >
            没有更多历史记录了
          </div>
        </div>
      </div>
    </transition>
  </aside>
</template>
<script setup>
import {
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
  provide,
  inject,
  defineComponent,
} from "vue";
import { useAgentStore } from "@/store/modules/agent";
import { useAgentWebSocket } from "@/composables/useAgentWebSocket";
import { useAgentMessages } from "@/composables/useAgentMessages";
import { ElMessage, ElMessageBox, ElSwitch } from "element-plus";
import { SwitchFilled } from "@element-plus/icons-vue";
import { getConversationList, deleteConversation } from "@/api/dataflow";
import { getList as getDatasetList } from "@/api/dataflow";
const props = defineProps({
  canvasContext: {
    type: Object,
    default: () => ({}),
  },
});

// Stores & Composables
let agentStore = null;
function getAgentStore() {
  if (!agentStore) {
    agentStore = useAgentStore();
  }
  return agentStore;
}
const isCenterMode = ref(true); // 默认居中模式
const socketByWorkflow = inject("socketByWorkflow");

const {
  socket,
  isConnected,
  connect,
  disconnect,
  sendUserMessage,
  sendConfirmMessage,
  sendModifyMessage,
  sendFormUpdate,
  stopCurrentTask,
  setMessageHandlers,
  currentConversationId,
  conversationTitle,
  loadConversation,
  startNewConversation,
} = socketByWorkflow;
const centerDialogVisible = ref(false);
// 提供 WebSocket 方法给子组件
const resetCanvas = inject("resetCanvas");
const switchLoading = ref(false);
const passThroughLoading = ref(false);
const passThrough = computed(() => {
  return getAgentStore().passThrough;
});
const emit = defineEmits(["close", "apply-template"]);

const beforeChange = () => {
  switchLoading.value = true;
  return new Promise((resolve) => {
    setTimeout(() => {
      getAgentStore().setDeepThinking();
      switchLoading.value = false;
      ElMessage.success(`${deepThinking.value ? "开启" : "关闭"}深度思考`);
      return resolve(true);
    }, 500);
  });
};
const beforeChangePassThrough = () => {
  passThroughLoading.value = true;
  return new Promise((resolve) => {
    setTimeout(() => {
      getAgentStore().setPassThrough();
      passThroughLoading.value = false;
      ElMessage.success(`${passThrough.value ? "开启" : "关闭"}透传`);
      return resolve(true);
    }, 500);
  });
};

const deepThinking = computed(() => {
  return getAgentStore().deepThinking;
});
// 监听画布节点数量变化，自动切换模式
watch(
  () => props.canvasContext?.nodes?.length || 0,
  (nodeCount) => {
    // 当节点数量 > 0 时，自动切换到抽屉模式
    if (nodeCount > 0 && isCenterMode.value) {
      isCenterMode.value = false;
    }
    // 当节点数量为0且AgentPanel打开时，切换到居中模式
    else if (nodeCount === 0 && getAgentStore().isOpen && !isCenterMode.value) {
      isCenterMode.value = true;
    }
  },
  { immediate: true },
);

// 监听 AgentPanel 打开状态，打开时根据画布状态设置模式
watch(
  () => getAgentStore().isOpen,
  (isOpen) => {
    if (isOpen) {
      const nodeCount = props.canvasContext?.nodes?.length || 0;
      isCenterMode.value = nodeCount === 0;
    }
  },
  { immediate: true },
);

const {
  conversationRef,
  scrollToBottom,
  handleThoughtMessage,
  handlePlanMessage,
  handleActionMessage,
  handleErrorMessage,
  handleCompleteMessage,
  handleRunStarted,
  handlePlanDecision,
  handleRunFinished,
  handleStateUpdate,
  clearMessages,
  addWelcomeMessage,
  handlePipelineDebugLog,
  handleOperatorExplanation,
  handleMessageConfirm,
  handleQuestionClosely,
} = useAgentMessages();
const showHistory = defineModel("showHistory", {
  type: Boolean,
  default: false,
});
// State
const userInput = ref("");
const inputRef = ref(null);

// 历史记录相关状态
// const showHistory = ref(false)
const historyList = ref([]);
const isLoadingHistory = ref(false);
const isLoadingMore = ref(false);
const currentPage = ref(1);
const hasMoreData = ref(true);
const pageSize = 50;
const observerTarget = ref(null);
const observer = ref(null);
const historySearchQuery = ref("");

// Example prompts
const examplePrompts = ref([
  "构建pipeline将英文文档翻译成中文",
  "分析当前 Pipeline 并优化性能",
  "解释数据清洗算子的配置参数",
]);

// Quick Actions - 使用 store 中定义的 quickActions
const quickActions = computed(() => {
  // 始终显示快捷操作，不管是否有消息历史
  return getAgentStore().quickActions;
});

// Computed
const messages = computed(() => getAgentStore().messages);
const isProcessing = computed(
  () => getAgentStore().isThinking || getAgentStore().isExecuting,
);
const canSend = computed(
  () =>
    userInput.value.trim().length > 0 &&
    !isProcessing.value &&
    isConnected.value,
);
const agentDatasets = ref([]);
const datasetVal = computed(() => getAgentStore().agentDatasetVal);
const handleSelect = (val) => {
  // 将选择的val保存到pinia中全局使用，使用getAgentStore().setDatasetVal(val)
  getAgentStore().setAgentDatasetVal(val);
  console.log("val = ", val, typeof val);
};
const loadDatasets = async () => {
  try {
    const response = await getDatasetList({ page_num: 1, page_size: 500 });

    if (
      response &&
      response.code === 0 &&
      response.data &&
      response.data.list
    ) {
      agentDatasets.value = response.data.list;
    } else {
      agentDatasets.value = [];
    }
  } catch (error) {
    datasets.value = [];
    ElMessage.error("加载数据集列表失败");
  }
};
// 思考状态文本 - 根据当前消息类型显示
const thinkingText = computed(() => {
  const msgType = getAgentStore().currentMessageType;

  // 🔍 调试日志 - 追踪思考状态
  console.log("🔍 [AgentPanel thinkingText] ========");
  console.log("  currentMessageType:", msgType);
  console.log("  isThinking:", getAgentStore().isThinking);
  console.log("  isExecuting:", getAgentStore().isExecuting);
  console.log("  currentStep:", getAgentStore().currentStep);

  // 根据消息类型返回对应的描述
  if (msgType === "plan_decision") {
    return "正在规划方案...";
  }

  if (msgType === "run_started") {
    return "正在分析您的需求...";
  }

  if (msgType === "action") {
    const step = getAgentStore().currentStep;
    if (step && step.action) {
      if (step.action === "add_node") {
        return "正在添加节点...";
      }
      if (step.action === "add_edge") {
        return "正在创建连线...";
      }
      if (step.action === "update_config") {
        return "正在更新配置...";
      }
    }
    return "正在执行任务...";
  }

  if (msgType === "thought") {
    return "正在思考...";
  }

  // 如果正在执行但没有明确的消息类型
  if (getAgentStore().isExecuting) {
    return "正在执行任务...";
  }

  // 默认（纯思考状态）
  return "正在分析您的需求...";
});

// Auto-resize textarea
const handleInputChange = () => {
  if (inputRef.value) {
    inputRef.value.style.height = "auto";
    inputRef.value.style.height =
      Math.min(inputRef.value.scrollHeight, 120) + "px";
  }
};

// Methods
const onEnter = (event) => {
  // 当中文输入法正在组词时，忽略 Enter
  if (event && (event.isComposing || event.keyCode === 229)) {
    return;
  }
  handleSend();
};
const handleSend = async (...args) => {
  if (!canSend.value) return;

  const text = userInput.value.trim();
  const context = {
    currentNodes: props.canvasContext.nodes?.length || 0,
    currentEdges: props.canvasContext.edges?.length || 0,
    canvasState: props.canvasContext.canvasState || {},
  };
  if (args.includes("explain")) {
    // props.canvasContext.node 中包含当前选中的节点信息
    const nodes = props.canvasContext.nodes || [];
    const selectId = props.canvasContext.canvasState?.selectedNodeId || "";
    const selectedNode = nodes.find((node) => node.id === selectId) || {};
    const operatorName = selectedNode?.data?.operator?.name || "";
    if (!operatorName) {
      userInput.value = "";
      centerDialogVisible.value = true;
      // ElMessage.error('请先选择一个算子节点')
      return;
    }
    context.operator_names = [operatorName];
  }
  console.log("[Agent] props.canvasContext", text, props.canvasContext);

  const success = await sendUserMessage(text, context);

  if (success) {
    getAgentStore().setThinking(true);
    userInput.value = "";
    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.style.height = "auto";
      }
    });
  }
};

const handleQuickAction = (action) => {
  const actionTexts = {
    build: "我想构建一个Pipeline",
    optimize: "我想优化Pipeline",
    explain: "请解释当前选中的节点",
    add: "我想添加新的算子节点",
  };
  userInput.value = actionTexts[action.id] || action.text;
  if (action.id === "explain") {
    handleSend("explain");
    return;
  }
  handleSend();
};

const handleConfirm = async () => {
  if (!getAgentStore().pendingConfirm) return;

  const planId = getAgentStore().pendingConfirm.planId || "";
  await sendConfirmMessage("confirm", "", planId);
};

const handleReject = async () => {
  ElMessageBox.prompt("请说明拒绝理由（可选）", "拒绝", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputType: "textarea",
  })
    .then(async ({ value }) => {
      const planId = getAgentStore().pendingConfirm?.planId || "";
      await sendConfirmMessage("reject", value || "", planId);
    })
    .catch(() => {
      // 用户取消
    });
};

const handleModify = () => {
  ElMessageBox.prompt("请描述你想如何修改", "修改计划", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    inputType: "textarea",
    inputPlaceholder: "例如：在第2步添加数据验证...",
  })
    .then(async ({ value }) => {
      if (value) {
        userInput.value = `修改计划：${value}`;
        await handleSend();
      }
    })
    .catch(() => {
      // 用户取消
    });
};

const handleSave = () => {
  // 向父组件（OperatorWorkflow）发送保存Pipeline的事件
  emit("save-pipeline");
};

const handleSuggestionAction = (suggestion) => {
  if (suggestion.type === "retry") {
    // 重试上一个操作
    ElMessage.info("正在重试...");
    // TODO: 实现重试逻辑
  } else if (suggestion.type === "alternative" && suggestion.action) {
    // 使用替代方案
    userInput.value = `使用替代方案：${suggestion.description}`;
    handleSend();
  } else if (suggestion.type === "modify") {
    // 修改配置
    userInput.value = suggestion.description;
    handleSend();
  }
};

const handleCancel = () => {
  getAgentStore().resetState();
  ElMessage.info("已取消操作");
};

const handleStop = async () => {
  await stopCurrentTask();
};

const handleViewNode = (nodeId) => {
  emit("focus-node", nodeId);
  ElMessage.success("已聚焦到节点");
};

const clearConversation = () => {
  ElMessageBox.confirm("确定要清空对话历史吗？此操作不可恢复。", "清空对话", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      await stopCurrentTask();
      clearMessages();
      startNewConversation();
      ElMessage.success("对话历史已清空");
    })
    .catch(() => {
      // 用户取消
    });
};

// ========== 历史记录管理 ==========

/**
 * 切换历史记录侧边栏
 */
const toggleHistory = () => {
  //   showHistory.value = !showHistory.value

  // 如果打开历史记录，加载列表并设置IntersectionObserver
  if (showHistory.value) {
    // loadHistoryList()
    nextTick(() => {
      setupIntersectionObserver();
    });
  } else {
    // 关闭历史记录时清除observer
    if (observer.value) {
      observer.value.disconnect();
      observer.value = null;
    }
  }
};

// 监听历史面板显示状态，重新设置observer
watch(showHistory, (newVal) => {
  if (newVal) {
    loadHistoryList();
    nextTick(() => {
      setupIntersectionObserver();
    });
  }
});

// 组件卸载时清除observer
onBeforeUnmount(() => {
  if (observer.value) {
    observer.value.disconnect();
    observer.value = null;
  }
});

/**
 * 加载历史会话列表
 */
const loadHistoryList = async (isLoadMore = false) => {
  try {
    if (isLoadMore) {
      isLoadingMore.value = true;
    } else {
      isLoadingHistory.value = true;
      currentPage.value = 1;
      hasMoreData.value = true;
    }

    const response = await getConversationList({
      page: isLoadMore ? currentPage.value : 1,
      page_size: pageSize,
    });

    if (response.data?.conversations) {
      if (isLoadMore) {
        // 追加数据
        historyList.value = [
          ...historyList.value,
          ...response.data.conversations,
        ];
        // 检查是否还有更多数据
        hasMoreData.value = response.data.conversations.length === pageSize;
      } else {
        // 替换数据
        historyList.value = response.data.conversations;
      }
      console.log("[Agent] 历史会话列表已加载:", historyList.value.length);
    }
  } catch (error) {
    hasMoreData.value = false;
    console.error("[Agent] 加载历史会话列表失败:", error);
    if (!isLoadMore) {
      ElMessage.error("加载历史记录失败");
    }
  } finally {
    isLoadingHistory.value = false;
    isLoadingMore.value = false;
  }
};

/**
 * 设置IntersectionObserver监听加载更多
 */
const setupIntersectionObserver = () => {
  // 清除已存在的observer
  if (observer.value) {
    observer.value.disconnect();
    observer.value = null;
  }

  // 如果没有更多数据或正在加载，不设置observer
  if (!hasMoreData.value || isLoadingMore.value) {
    return;
  }

  nextTick(() => {
    if (!observerTarget.value) return;

    // 创建IntersectionObserver
    observer.value = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMoreData.value && !isLoadingMore.value) {
          // 元素进入视口且可以加载更多时，加载下一页
          loadMoreHistory();
        }
      },
      {
        root: document.querySelector(".history-list"),
        rootMargin: "50px", // 提前50px触发
        threshold: 0.1,
      },
    );

    // 开始观察目标元素
    observer.value.observe(observerTarget.value);
  });
};

/**
 * 加载更多历史会话
 */
const loadMoreHistory = async () => {
  if (isLoadingMore.value || !hasMoreData.value) return;

  currentPage.value++;
  await loadHistoryList(true);

  // 加载完成后重新设置observer
  setupIntersectionObserver();
};

/**
 * 按时间分组历史会话
 */
const groupedHistory = computed(() => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const groups = {
    today: [],
    yesterday: [],
    lastWeek: [],
    earlier: [],
  };

  // 筛选搜索结果
  const filtered = historySearchQuery.value
    ? historyList.value.filter((item) =>
        item.title
          ?.toLowerCase()
          .includes(historySearchQuery.value.toLowerCase()),
      )
    : historyList.value;

  filtered.forEach((item) => {
    const itemDate = new Date(item.created_at || item.createdAt);

    if (itemDate >= today) {
      groups.today.push(item);
    } else if (itemDate >= yesterday) {
      groups.yesterday.push(item);
    } else if (itemDate >= lastWeek) {
      groups.lastWeek.push(item);
    } else {
      groups.earlier.push(item);
    }
  });

  return groups;
});

/**
 * 选择历史会话
 */
const selectHistoryItem = async (item) => {
  try {
    await stopCurrentTask();
    resetCanvas();
    // 加载历史会话
    const success = await loadConversation(item.id);

    if (success) {
      // 关闭历史记录侧边栏
      showHistory.value = false;
      getAgentStore().isOpen = true;
      getAgentStore().setThinking(false);
      // 滚动到底部
      nextTick(() => {
        scrollToBottom();
      });
    }
  } catch (error) {
    console.error("[Agent] 加载历史会话失败:", error);
  }
};
const agentScrollToBottom = () => {
  nextTick(() => {
    scrollToBottom();
  });
};
provide("agentScrollToBottom", agentScrollToBottom);
/**
 * 删除历史会话
 */
const deleteHistoryItem = async (item, event) => {
  // 阻止事件冒泡，避免触发选择
  event.stopPropagation();

  try {
    await ElMessageBox.confirm(
      `确定要删除会话"${item.title}"吗？`,
      "删除会话",
      {
        confirmButtonText: "删除",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    await deleteConversation({ id: item.id });

    // 从列表中移除
    historyList.value = historyList.value.filter((h) => h.id !== item.id);

    ElMessage.success("会话已删除");
  } catch (error) {
    if (error !== "cancel") {
      console.error("[Agent] 删除会话失败:", error);
      ElMessage.error("删除会话失败");
    }
  }
};

/**
 * 开始新会话
 */
const handleNewConversation = async () => {
  await stopCurrentTask();
  startNewConversation();
  getAgentStore().openPanel();
  showHistory.value = false;
  ElMessage.success("已开始新会话");
};

/**
 * 格式化时间
 */
const formatTime = (dateStr) => {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;

  // 小于1分钟
  if (diff < 60000) {
    return "刚刚";
  }

  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}分钟前`;
  }

  // 小于24小时
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}小时前`;
  }

  // 小于7天
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days}天前`;
  }

  // 显示日期
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

// Watchers
watch(
  () => getAgentStore().isOpen,
  (isOpen) => {
    if (isOpen) {
      if (!isConnected.value) {
        // connect()
      }

      // 聚焦输入框
      nextTick(() => {
        if (inputRef.value) {
          inputRef.value.focus();
        }
      });
    }
  },
);

watch(
  messages,
  () => {
    scrollToBottom();
  },
  { deep: true },
);

// Lifecycle
onMounted(() => {
  // loadDatasets()
  // 设置消息处理器（包括新旧格式）
  setMessageHandlers({
    // 旧格式消息处理器
    onThought: handleThoughtMessage,
    onPlan: handlePlanMessage,
    onAction: handleActionMessage,
    onError: handleErrorMessage,
    onComplete: handleCompleteMessage,
    // 新格式消息处理器
    onRunStarted: handleRunStarted,
    onPlanDecision: handlePlanDecision,
    onRunFinished: handleRunFinished,
    onStateUpdate: handleStateUpdate,
    pipelineDebugLlog: handlePipelineDebugLog,
    operatorExplanation: handleOperatorExplanation,
    onMessageConfirm: handleMessageConfirm,
    questionClosely: handleQuestionClosely,
  });

  // Focus input when panel opens
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
    }
  });
});
</script>

<style scoped lang="scss">
.history-sidebar-container {
  position: absolute;
  top: 0px;
  left: -320px;
  width: 280px;
  height: 100%;
  background: rgba(255, 255, 255, 1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 2001;
  transition: left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}
.panel-open {
  left: 0;
}
.history-sidebar {
  height: 100%;
  width: 280px;
  flex-shrink: 0;
  /* background: rgba(255, 255, 255, 0.95); */
  background: rgba(255, 255, 255, 1);

  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-right: 0.5px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow:
    2px 0 16px rgba(0, 0, 0, 0.04),
    1px 0 4px rgba(0, 0, 0, 0.02);
}

/* History Slide Animation */
.history-slide-enter-active,
.history-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.history-slide-enter-from,
.history-slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* History Header */
.history-header {
  padding: 16px 20px;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
.header-text {
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0px;
  color: rgba(34, 34, 34, 1);
}
.history-title {
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.3px;
  margin: 0;
}

.history-close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868b;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.history-close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1d1d1f;
}

.history-close-btn:active {
  background: rgba(0, 0, 0, 0.08);
  transform: scale(0.95);
}

/* New Conversation Button */
.new-conversation-btn {
  margin: 12px 16px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #007aff, #5ac8fa);
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.25);
  flex-shrink: 0;
  /* border-radius: 4px; */
  background: #164fc9ff;
}

.new-conversation-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.35);
}

.new-conversation-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(0, 122, 255, 0.2);
}

/* History Search */
.history-search {
  margin: 0 16px 12px;
  padding: 8px 12px;
  //   background: rgba(0, 0, 0, 0.04);
  border: 0.5px solid rgba(0, 0, 0, 0.06);
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.history-search svg {
  color: #86868b;
  flex-shrink: 0;
}

.history-search:focus-within {
  background: white;
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.history-search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  font-weight: 400;
  color: #1d1d1f;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
}

.history-search-input::placeholder {
  color: #86868b;
}

/* History List */
.history-list {
  height: 100%;
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px 16px;
  overscroll-behavior: contain;
}

.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-track {
  background: transparent;
}

.history-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15);
}

/* Loading State */
.history-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* padding: 40px 20px;
  gap: 12px; */
  color: #86868b;
  font-size: 13px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(0, 122, 255, 0.2);
  border-top-color: #007aff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-spinner.small {
  width: 16px;
  height: 16px;
}

.history-load-more {
  padding: 10px 0;
  text-align: center;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 12px;
  gap: 8px;
}

.history-no-more {
  padding: 10px 0;
  text-align: center;
  color: #999;
  font-size: 12px;
}

.observer-target {
  height: 1px;
  width: 100%;
  margin: 5px 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Empty State */
.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
  color: #86868b;
}

.history-empty svg {
  opacity: 0.3;
}

.history-empty p {
  font-size: 13px;
  font-weight: 400;
  margin: 0;
}

/* History Groups */
.history-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-label {
  font-size: 11px;
  font-weight: 600;
  color: #86868b;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 0 4px 4px;
  margin-bottom: 4px;
}

/* History Item */
.history-item {
  position: relative;
  padding: 12px 12px;
  /* background: rgba(0, 0, 0, 0.02); */
  border: 0.5px solid rgba(0, 0, 0, 0.04);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: flex-start;
  gap: 8px;
  /* border-radius: 4px; */
  background: #f7faffff;
}

.history-item:hover {
  background: white;
  border-color: rgba(0, 122, 255, 0.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transform: translateX(2px);
}

.history-item.active {
  background: rgba(0, 122, 255, 0.08);
  border-color: rgba(0, 122, 255, 0.3);
}

.history-item.active .history-item-title {
  color: #007aff;
  font-weight: 600;
}

.history-item:active {
  transform: scale(0.98);
}

.history-item-content {
  flex: 1;
  min-width: 0;
}

.history-item-title {
  font-size: 13px;
  font-weight: 500;
  color: #1d1d1f;
  letter-spacing: -0.1px;
  line-height: 1.4;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.history-item-time {
  font-size: 11px;
  font-weight: 400;
  color: #86868b;
  letter-spacing: -0.05px;
}

.history-item-delete {
  width: 24px;
  height: 24px;
  min-width: 24px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868b;
  opacity: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.history-item:hover .history-item-delete {
  opacity: 1;
}

.history-item-delete:hover {
  background: rgba(255, 59, 48, 0.1);
  color: #ff3b30;
}

.history-item-delete:active {
  background: rgba(255, 59, 48, 0.15);
  transform: scale(0.9);
}

/* Responsive adjustments */
@media (max-width: 750px) {
  .agent-panel {
    width: 100%;
  }

  .history-sidebar {
    width: 260px;
  }
}
</style>
