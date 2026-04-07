<template>
	<el-dialog title="算子解释1" v-model="centerDialogVisible" width="50%" destroy-on-close center>
		<div class="search-select-container" ref="containerRef">
			<el-select
				ref="selectRef"
				v-model="selectedValue"
				filterable
				remote
				reserve-keyword
				:remote-method="remoteMethod"
				:loading="loading"
				:placeholder="Props.placeholderTxt"
				remote-show-suffix
				clearable
				@change="handleSelect"
				@visible-change="handleVisibleChange"
				@clear="handleClear"
				popper-class="search-select-dropdown"
			>
				<el-option v-for="item in operatorList" :key="item.id" :label="item.name" :value="item.id">
					<div class="option-item">
						<div class="option-name">{{ item.name }}</div>
					</div>
				</el-option>
				<div v-show="hasMore && !loading" class="load-more-option">
					<div ref="loadMoreRef" class="load-more-trigger">滚动加载更多</div>
				</div>
				<div v-show="!hasMore && options.length > 0" class="no-more-option">
					<div class="no-more-text">没有更多数据了</div>
				</div>
				<el-option v-show="options.length === 0 && !loading" :value="''" disabled>
					<div class="empty-text">暂无数据</div>
				</el-option>
			</el-select>
		</div>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="centerDialogVisible = false">取 消</el-button>
				<el-button type="primary" @click="confirmSelect">确 定</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted, watch, computed, watchEffect } from 'vue';
import request from '@/utils/request';
import { useAgentStore } from '@/store/modules/agent';
import { fetchLibOperators } from '@//api/dataflow.js';
import { useAgentWebSocket } from '@/composables/useAgentWebSocket'
import { ElMessage } from 'element-plus'
const Props = defineProps({
	placeholderTxt: {
		type: String,
		default: '请选择算子'
	}
});
const centerDialogVisible=defineModel('visible',{
	type: Boolean,
	default: false
})
const emit =defineEmits(['sendMessage'])
const {
  sendUserMessage,

} = useAgentWebSocket({ autoConnect: false })
const selectedValue = ref(null)
const loading = ref(false);
const options = ref([]);
const keyword = ref('');
const currentPage = ref(0);
const pageSize = ref(100);
const hasMore = ref(true);
const totalCount = ref(0);
const loadMoreRef = ref(null);
const containerRef = ref(null);
const selectRef = ref(null);
const isComposing = ref(false); // 是否正在使用中文输入法
let observer = null;
let scrollElement = null;
let inputElement = null;
let agentStore = null
function getAgentStore() {
  if (!agentStore) {
    agentStore = useAgentStore()
  }
  return agentStore
};
const operatorList = ref([]);
const operators= ref([])


const filteredOperators = computed(() => {
  let filtered = operators.value

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(op => {
      const name = (op.name || '').toLowerCase()
      const type = (op.type || '').toLowerCase()
      const description = (op.description || '').toLowerCase()
      return name.includes(query) || type.includes(query) || description.includes(query)
    })
  }

  // Filter by category (only if no search query)
  if (!searchQuery.value.trim() && activeCategory.value !== 'all') {
    filtered = filtered.filter(op => op.category === activeCategory.value)
  }

  // Sort alphabetically by name (A-Z)
  filtered = filtered.sort((a, b) => {
    const nameA = (a.name || '').toLowerCase()
    const nameB = (b.name || '').toLowerCase()
    return nameA.localeCompare(nameB)
  })

  return filtered
})
// 获取数据列表
const fetchData = async (page_num = 1, searchKeyword = '', append = false) => {
	if (loading.value) return;

	loading.value = true;
	const userInfoStr = localStorage.getItem('user_info') || sessionStorage.getItem('user_info') || '{}'
  	const info = JSON.parse(userInfoStr)
	try {
		const params = {
			keyword: searchKeyword,
			page_num,
			page_size: pageSize.value,
			uid: info.id,
			tenantId: info.tenantId
		};
		const response = await fetchLibOperators(params);
		// const response = await getList(params)
		// const response={"code":0,"msg":"","data":{"list":[{"id":"3e4d3ae1-7730-4dd7-a865-4a760b31d10a","name":"罕见病测试4","domain":"kps","record_count":0,"created_at":"2025-11-20T16:24:44.591625+08:00","updated_at":"2025-11-20T16:24:44.591633+08:00"},{"id":"71df5dae-26f5-40e3-b71d-e57b49a340e9","name":"罕见病测试2","domain":"kps","record_count":0,"created_at":"2025-11-20T16:24:44.590939+08:00","updated_at":"2025-11-20T16:24:44.590954+08:00"},{"id":"4ffe84f5-ae2f-4e25-918e-a3ecb27ccbcf","name":"罕见病测试","domain":"kps","record_count":0,"created_at":"2025-11-20T16:24:44.589693+08:00","updated_at":"2025-11-20T16:24:44.589753+08:00"},{"id":"45f599e7-4cac-479d-b74f-8ef91ba0372d","name":"罕见病测试4","domain":"kps","record_count":0,"created_at":"2025-11-19T16:11:44.940210+08:00","updated_at":"2025-11-19T16:11:44.940217+08:00"},{"id":"d7cba419-90e7-4023-882c-b788267fbe81","name":"罕见病测试2","domain":"kps","record_count":0,"created_at":"2025-11-19T16:11:44.939511+08:00","updated_at":"2025-11-19T16:11:44.939519+08:00"},{"id":"a8293bf4-3078-42fd-b160-e48b1ae30f12","name":"罕见病测试","domain":"kps","record_count":2,"created_at":"2025-11-19T16:11:44.938324+08:00","updated_at":"2025-11-19T16:11:44.938363+08:00"}],"total":6,"page_size":10,"page_num":1,"pages":1},"request_id":"20251120164119969b7129"}
		if (response.code === 0 && response.data) {
			const { list = [], total: total = 0 } = response.data;

			if (append) {
				// 追加数据
				options.value = [...options.value, ...list];
			} else {
				// 替换数据
				options.value = list;
			}

			hasMore.value = options.value.length < total;
			currentPage.value = page_num;
		} else {
			if (!append) {
				options.value = [];
			}
			hasMore.value = false;
		}
        operatorList.value = options.value;
	} catch (error) {
		console.error('获取数据失败:', error);
		if (!append) {
			options.value = [];
            operatorList.value = [];
		}
		hasMore.value = false;
	} finally {
		console.log('finally', hasMore.value);

		loading.value = false;
	}
};

// 远程搜索方法
const remoteMethod = (query) => {
    operatorList.value = options.value.filter(item => item.name.toLowerCase().indexOf(query.toLowerCase()) > -1);
	// 如果正在使用中文输入法，不触发搜索
	// if (query) {
	// 	keyword.value = query;
	// 	currentPage.value = 1;
	// 	hasMore.value = true;
	// 	fetchData(1, query, false);
	// }
};
const handleSelect = (val) => {
    selectedValue.value = val;
	// 将选择的val保存到pinia中全局使用，使用getAgentStore().setDatasetVal(val)
	console.log('val = ', val, typeof val);
};
const confirmSelect = async () => {
	if (!selectedValue.value) {
		ElMessage.error('请先选择一个算子节点')
		return
	}
	// getAgentStore().setThinking(true)
    const text = '请解释当前选中的节点';
    const operatorName = operatorList.value.find(item => item.id === selectedValue.value)?.name || '';
    const context ={
       
            operator_names: [operatorName]
        
    }
	emit('sendMessage', text, context)

    // await sendUserMessage(text, context)
    centerDialogVisible.value = false;
};
// 设置滚动监听
const setupScrollObserver = () => {
	nextTick(() => {
		// 尝试多种方式找到滚动容器
		const selectors = ['.search-select-dropdown .el-scrollbar__wrap', '.search-select-dropdown .el-select-dropdown__list', '.search-select-dropdown .el-scrollbar'];

		for (const selector of selectors) {
			const element = document.querySelector(selector);
			if (element) {
				scrollElement = element;
				break;
			}
		}

		
		if (loadMoreRef.value) {
			observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting && hasMore.value && !loading.value) {
							console.log('进入区域，===》〉');

							loadMore();
						}
					});
				},
				{
					root: null, // 使用视口作为 root，因为下拉框挂载在 body 上
					rootMargin: '0px',
					threshold: 0.1
				}
			);
			observer.observe(loadMoreRef.value);
		}

		
	});
};

// 清理滚动监听
const cleanupScrollObserver = () => {
	if (observer && loadMoreRef.value) {
		observer.unobserve(loadMoreRef.value);
		observer.disconnect();
		observer = null;
	}

	if (scrollElement && scrollElement._scrollHandler) {
		scrollElement.removeEventListener('scroll', scrollElement._scrollHandler);
		scrollElement._scrollHandler = null;
	}

	scrollElement = null;
};

// 设置输入法事件监听
const setupCompositionListeners = () => {
	// 如果已经设置过，先清理
	if (inputElement) {
		cleanupCompositionListeners();
	}

	nextTick(() => {
		// 优先通过 ref 查找
		if (containerRef.value) {
			inputElement = containerRef.value.querySelector('.el-input__inner');
		}

		// 如果找不到，尝试通过选择器查找
		if (!inputElement) {
			const selectors = ['.search-select-container .el-input__inner', '.el-select .el-input__inner'];

			for (const selector of selectors) {
				const element = document.querySelector(selector);
				if (element) {
					inputElement = element;
					break;
				}
			}
		}

		// 如果还是找不到，延迟重试
		if (!inputElement) {
			setTimeout(() => {
				if (containerRef.value) {
					inputElement = containerRef.value.querySelector('.el-input__inner');
					if (inputElement && !inputElement._compositionStartHandler) {
						attachCompositionListeners();
					}
				}
			}, 100);
			return;
		}

		attachCompositionListeners();
	});
};

// 附加输入法事件监听器
const attachCompositionListeners = () => {
	if (!inputElement) return;

	// 如果已经附加过，不重复附加
	if (inputElement._compositionStartHandler) {
		return;
	}

	// 监听输入法开始事件
	const handleCompositionStart = () => {
		isComposing.value = true;
	};

	// 监听输入法结束事件
	const handleCompositionEnd = (e) => {
		isComposing.value = false;
		// 输入法结束后，使用当前输入框的值触发搜索
		const query = e.target.value || '';
		if (query) {
			keyword.value = query;
			currentPage.value = 1;
			hasMore.value = true;
			fetchData(1, query, false);
		}
	};

	inputElement.addEventListener('compositionstart', handleCompositionStart);
	inputElement.addEventListener('compositionend', handleCompositionEnd);

	// 保存清理函数
	inputElement._compositionStartHandler = handleCompositionStart;
	inputElement._compositionEndHandler = handleCompositionEnd;
};

// 清理输入法事件监听
const cleanupCompositionListeners = () => {
	if (inputElement) {
		if (inputElement._compositionStartHandler) {
			inputElement.removeEventListener('compositionstart', inputElement._compositionStartHandler);
			inputElement._compositionStartHandler = null;
		}
		if (inputElement._compositionEndHandler) {
			inputElement.removeEventListener('compositionend', inputElement._compositionEndHandler);
			inputElement._compositionEndHandler = null;
		}
		inputElement = null;
	}
	isComposing.value = false;
};

// 处理下拉框显示/隐藏
const handleVisibleChange = (visible) => {
	if (visible) {
		
		setupCompositionListeners();
	} else {
		
		cleanupCompositionListeners();
	}
};

// 监听 loadMoreRef 变化，重新设置 observer
watch(loadMoreRef, (newVal) => {
	if (newVal && scrollElement) {
		cleanupScrollObserver();
		setupScrollObserver();
	}
});

// 加载更多数据
const loadMore = () => {
	if (loading.value) return;
	fetchData(currentPage.value + 1, keyword.value, true);
};

// 处理清空
const handleClear = () => {
	selectedValue.value = '';
	keyword.value = '';
	options.value = [];
	currentPage.value = 0;
	hasMore.value = true;
	setupScrollObserver();
};

// 初始化加载
onMounted(() => {

	setupScrollObserver();
	
});

// 组件卸载时清理
onUnmounted(() => {
	cleanupScrollObserver();
	cleanupCompositionListeners();
});
</script>

<style scoped lang="scss">
.search-select-container {
	width: 100%;
	// max-width: 400px;
}

.option-item {
	padding: 4px 0;

	.option-name {
		font-size: 14px;
		color: #303133;
		line-height: 1.5;
	}

	.option-desc {
		font-size: 12px;
		color: #909399;
		margin-top: 4px;
		line-height: 1.4;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
}

.load-more-trigger {
	text-align: center;
	color: #909399;
	font-size: 12px;
	padding: 8px 0;
}
::v-deep(.el-select__wrapper) {
	border-radius: 10px !important;
	border: 1px solid rgba(0, 0, 0, 0.08);
	height: 40px;
}
::v-deep(.is-focused) {
	box-shadow: none;
}
.no-more-text {
	text-align: center;
	color: #c0c4cc;
	font-size: 12px;
	padding: 8px 0;
}

.empty-text {
	text-align: center;
	color: #c0c4cc;
	font-size: 12px;
	// padding: 20px 0;
}
</style>

<style lang="scss">
.search-select-dropdown {
	.el-select-dropdown__item {
		&.load-more-option,
		&.no-more-option {
			height: auto;
			padding: 0;
			cursor: default;

			&:hover {
				background-color: transparent;
			}
		}
	}

	.el-scrollbar__wrap {
		max-height: 300px;
	}
	.is-selected > .option-name {
		color: pink;
	}
}
.el-select__input {
	width: 100% !important;
}
</style>
