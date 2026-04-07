/**
 * 任务记录相关的组合式函数
 */
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchTaskRecordDetailsSimple, playTaskRecord, retryTaskRecord } from '@/api/task'
import { isStopStatus } from '@/utils/taskStatus'

/**
 * 任务记录管理
 * @param {Object} options - 配置选项
 * @param {string} options.taskId - 任务ID
 * @param {ComputedRef<string>} options.status - 查询状态
 * @param {number} options.pageSize - 每页数量
 * @param {number} options.refreshInterval - 刷新间隔（毫秒）
 * @returns {Object} 任务记录相关的状态和方法
 */
export function useTaskRecord(options = {}) {
	const {
		taskId,
		status = computed(() => ''),
		pageSize: initialPageSize = 10,
		refreshInterval: interval = 10000
	} = options

	// 响应式状态
	const isLoading = ref(false)
	const tableData = ref([])
	const pageNum = ref(1)
	const pageSize = ref(initialPageSize)
	const total = ref(0)
	const recordStatus = ref('')
	const autoRefresh = ref(false)

	let refreshTimer = null

	/**
	 * 获取任务记录详情
	 */
	async function fetchRecordDetails() {
		if (!taskId) {
			console.warn('taskId is required')
			return
		}

		try {
			const params = {
				taskId,
				pageNum: pageNum.value,
				pageSize: pageSize.value,
				status: status.value
			}

			isLoading.value = true
			const response = await fetchTaskRecordDetailsSimple(params)

			tableData.value = response.data?.list || []
			recordStatus.value = response.data?.status || ''
			total.value = response.data?.total || 0

			// 如果任务已结束，停止自动刷新
			if (isStopStatus(recordStatus.value)) {
				stopAutoRefresh()
			}
		} catch (error) {
			ElMessage.error('获取任务详情失败')
			console.error('Error fetching task details:', error)
		} finally {
			isLoading.value = false
		}
	}

	/**
	 * 设置任务优先执行
	 */
	async function setPriority(row) {
		try {
			await playTaskRecord(row.id)
			ElMessage.success('任务已设置为优先')
			await fetchRecordDetails()
		} catch (error) {
			ElMessage.error('设置优先任务失败')
			console.error('Error setting priority task:', error)
		}
	}

	/**
	 * 重试任务
	 */
	async function retryTask(row) {
		try {
			await ElMessageBox.confirm('确认要重试该任务吗？', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning',
				draggable: true
			})

			await retryTaskRecord(row.id)
			ElMessage.success('任务重试成功')
			await fetchRecordDetails()
		} catch (error) {
			if (error !== 'cancel') {
				ElMessage.error('任务重试失败')
				console.error('Error retrying task:', error)
			}
		}
	}

	/**
	 * 分页变化处理
	 */
	function handlePageChange(newPage) {
		pageNum.value = newPage
		fetchRecordDetails()
	}

	/**
	 * 启动自动刷新
	 */
	function startAutoRefresh() {
		if (refreshTimer) return

		autoRefresh.value = true
		fetchRecordDetails()

		refreshTimer = setInterval(() => {
			fetchRecordDetails()
		}, interval)
	}

	/**
	 * 停止自动刷新
	 */
	function stopAutoRefresh() {
		autoRefresh.value = false

		if (refreshTimer) {
			clearInterval(refreshTimer)
			refreshTimer = null
		}
	}

	/**
	 * 切换自动刷新
	 */
	function toggleAutoRefresh() {
		if (autoRefresh.value) {
			startAutoRefresh()
		} else {
			stopAutoRefresh()
		}
	}

	// 组件挂载时获取数据
	onMounted(() => {
		fetchRecordDetails()
	})

	// 组件卸载时清理定时器
	onBeforeUnmount(() => {
		stopAutoRefresh()
	})

	return {
		// 状态
		isLoading,
		tableData,
		pageNum,
		pageSize,
		total,
		recordStatus,
		autoRefresh,

		// 方法
		fetchRecordDetails,
		setPriority,
		retryTask,
		handlePageChange,
		startAutoRefresh,
		stopAutoRefresh,
		toggleAutoRefresh
	}
}
