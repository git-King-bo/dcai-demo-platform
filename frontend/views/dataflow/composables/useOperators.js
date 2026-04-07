/**
 * useOperators Composable
 * 管理算子的加载、分类、搜索和筛选
 */
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchLibOperators } from '@//api/dataflow.js'

export function useOperators() {
  // State
  const operators = ref([])
  const operatorsLoading = ref(false)
  const activeCategory = ref('all')
  const searchQuery = ref('')

  // Categories configuration
  const categories = ref([
    { key: 'all', label: '全部' },
    { key: 'parser', label: '解析' },
    { key: 'data-process', label: '处理' },
    { key: 'data-synthesis', label: '合成' },
    { key: 'data-evaluation', label: '评估' },
  ])

  /**
   * 根据算子类型进行分类
   */
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
    return 'data-process'
  }

  /**
   * 格式化算子描述信息
   */
  const formatDescription = (description) => {
    if (!description || description === '暂无描述') {
      return ''
    }

    let formatted = description.replace(/\n/g, '<br>')
    formatted = formatted.replace(/输入参数：/g, '<strong>输入参数：</strong>')
    formatted = formatted.replace(/输出参数：/g, '<strong>输出参数：</strong>')
    formatted = formatted.replace(/^<br>/, '')

    return formatted
  }

  /**
   * 加载算子列表
   */
  const loadOperators = async () => {
    operatorsLoading.value = true
    try {
      const response = await fetchLibOperators()
      if (response && response.data && response.data.list) {
        operators.value = response.data.list.map(op => ({
          ...op,
          category: categorizeOperator(op.type || op.name)
        }))
      }
    } catch (error) {
      console.error('加载算子列表失败:', error)
      ElMessage.error('加载算子列表失败')
    } finally {
      operatorsLoading.value = false
    }
  }

  /**
   * 加载第三方算子库
   */
  const loadLibOperators = async () => {
    try {
      const response = await fetchLibOperators()
      if (response.code === 0 && response.data && response.data.list) {
        const libOperators = response.data.list

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
  }

  /**
   * 筛选后的算子列表
   */
  const filteredOperators = computed(() => {
    let filtered = operators.value

    // 按搜索关键词过滤
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      filtered = filtered.filter(op => {
        const name = (op.name || '').toLowerCase()
        const type = (op.type || '').toLowerCase()
        const description = (op.description || '').toLowerCase()
        return name.includes(query) || type.includes(query) || description.includes(query)
      })
    }

    // 按分类过滤(仅在没有搜索关键词时)
    if (!searchQuery.value.trim() && activeCategory.value !== 'all') {
      filtered = filtered.filter(op => op.category === activeCategory.value)
    }

    // 按名称排序(A-Z)
    filtered = filtered.sort((a, b) => {
      const nameA = (a.name || '').toLowerCase()
      const nameB = (b.name || '').toLowerCase()
      return nameA.localeCompare(nameB)
    })

    return filtered
  })

  /**
   * 处理搜索输入
   */
  const handleSearchInput = () => {
    if (searchQuery.value.trim()) {
      activeCategory.value = 'all'
    }
  }

  /**
   * 清除搜索
   */
  const clearSearch = () => {
    searchQuery.value = ''
    activeCategory.value = 'all'
  }

  /**
   * 处理分类点击
   */
  const handleCategoryClick = (categoryKey) => {
    if (searchQuery.value.trim()) {
      searchQuery.value = ''
    }
    activeCategory.value = categoryKey
  }

  /**
   * 处理拖拽开始
   */
  const handleDragStart = (event, operator) => {
    event.dataTransfer.setData('application/json', JSON.stringify(operator))
    event.dataTransfer.effectAllowed = 'copy'
  }

  /**
   * 处理拖拽结束
   */
  const handleDragEnd = () => {
    // Clean up after drag
  }

  return {
    // State
    operators,
    operatorsLoading,
    activeCategory,
    searchQuery,
    categories,

    // Computed
    filteredOperators,

    // Methods
    loadOperators,
    loadLibOperators,
    categorizeOperator,
    formatDescription,
    handleSearchInput,
    clearSearch,
    handleCategoryClick,
    handleDragStart,
    handleDragEnd,
  }
}
