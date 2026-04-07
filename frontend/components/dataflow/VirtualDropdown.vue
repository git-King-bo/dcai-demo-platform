<template>
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
      <el-option
        v-for="item in datasetList"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      >
        <div class="option-item">
          <div class="option-name">{{ item.name }}</div>
        </div>
      </el-option>
      <div
        v-show="hasMore && !loading"

        class="load-more-option"
      >
        <div ref="loadMoreRef" class="load-more-trigger">滚动加载更多</div>
      </div>
      <div v-show="!hasMore && options.length > 0"  class="no-more-option">
        <div class="no-more-text">没有更多数据了</div>
      </div>
      <el-option v-show="options.length === 0 && !loading" :value="''" disabled>
        <div class="empty-text">暂无数据</div>
      </el-option>
    </el-select>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted, watch,computed,watchEffect } from 'vue'
import request from '@/utils/request'
import { useAgentStore } from '@/store/modules/agent'
import { getList } from '@/api/dataflow'

const Props=defineProps({
  placeholderTxt:{
    type:String,
    default:'请选择数据集'
  }
})
// const selectedValue = ref(null)
const loading = ref(false)
const options = ref([])
const keyword = ref('')
const currentPage = ref(0)
const pageSize = ref(100)
const hasMore = ref(true)
const totalCount = ref(0)
const loadMoreRef = ref(null)
const containerRef = ref(null)
const selectRef = ref(null)
const isComposing = ref(false) // 是否正在使用中文输入法
let observer = null
let scrollElement = null
let inputElement = null
let agentStore = null
function getAgentStore() {
  if (!agentStore) {
    agentStore = useAgentStore()
  }
  return agentStore
}
watchEffect(()=>{
  if (getAgentStore().datasetArr.length > 0 && getAgentStore().datasetArr.length >= getAgentStore().datasetTotalCount) {
      hasMore.value = false
      options.value = [...options.value, ...getAgentStore().datasetArr]
  }
})
// 获取数据列表
// 获取数据列表
const fetchData = async (page_num = 1, searchBy, append = false) => {
  const {keyword,dataset_id} = searchBy
  if (loading.value) return

  loading.value = true

  try {
    const params = {
      keyword,
      dataset_id,
      page_num,
      page_size: pageSize.value,

    }
    // const response = await queryDataset(params)
    const response = await getList(params)
    // const response={"code":0,"msg":"","data":{"list":[{"id":"3e4d3ae1-7730-4dd7-a865-4a760b31d10a","name":"罕见病测试4","domain":"kps","record_count":0,"created_at":"2025-11-20T16:24:44.591625+08:00","updated_at":"2025-11-20T16:24:44.591633+08:00"},{"id":"71df5dae-26f5-40e3-b71d-e57b49a340e9","name":"罕见病测试2","domain":"kps","record_count":0,"created_at":"2025-11-20T16:24:44.590939+08:00","updated_at":"2025-11-20T16:24:44.590954+08:00"},{"id":"4ffe84f5-ae2f-4e25-918e-a3ecb27ccbcf","name":"罕见病测试","domain":"kps","record_count":0,"created_at":"2025-11-20T16:24:44.589693+08:00","updated_at":"2025-11-20T16:24:44.589753+08:00"},{"id":"45f599e7-4cac-479d-b74f-8ef91ba0372d","name":"罕见病测试4","domain":"kps","record_count":0,"created_at":"2025-11-19T16:11:44.940210+08:00","updated_at":"2025-11-19T16:11:44.940217+08:00"},{"id":"d7cba419-90e7-4023-882c-b788267fbe81","name":"罕见病测试2","domain":"kps","record_count":0,"created_at":"2025-11-19T16:11:44.939511+08:00","updated_at":"2025-11-19T16:11:44.939519+08:00"},{"id":"a8293bf4-3078-42fd-b160-e48b1ae30f12","name":"罕见病测试","domain":"kps","record_count":2,"created_at":"2025-11-19T16:11:44.938324+08:00","updated_at":"2025-11-19T16:11:44.938363+08:00"}],"total":6,"page_size":10,"page_num":1,"pages":1},"request_id":"20251120164119969b7129"}
    if (response.code === 0 && response.data) {
      const { list = [], total: total = 0 } = response.data

      if (append) {
        // 追加数据
        options.value = [...options.value, ...list]
      } else {
        // 替换数据
        options.value = list
      }

      getAgentStore().datasetTotalCount = total
      hasMore.value = options.value.length < getAgentStore().datasetTotalCount
      currentPage.value = page_num
    } else {
      if (!append) {
        options.value = []
      }
      hasMore.value = false
    }
    getAgentStore().setDatasetArr(options.value)
  } catch (error) {
    console.error('获取数据失败:', error)
    if (!append) {
      options.value = []
    }
    hasMore.value = false
  } finally {
    console.log('finally',hasMore.value);

    loading.value = false
  }
}
const datasetList = computed(()=>{
  return getAgentStore().datasetArr
})
// 远程搜索方法
const remoteMethod = (query) => {
  // 如果正在使用中文输入法，不触发搜索
  if (query) {

  }
  keyword.value = query
  currentPage.value = 1
  hasMore.value = true
  fetchData(1, query, false)

}
const handleSelect = (val) => {
  // 将选择的val保存到pinia中全局使用，使用getAgentStore().setDatasetVal(val)
  getAgentStore().setAgentDatasetVal(val)
  console.log('val = ',val ,typeof val)
}
// 设置滚动监听
const setupScrollObserver = () => {
  nextTick(() => {
    // 尝试多种方式找到滚动容器
    const selectors = [
      '.search-select-dropdown .el-scrollbar__wrap',
      '.search-select-dropdown .el-select-dropdown__list',
      '.search-select-dropdown .el-scrollbar'
    ]

    for (const selector of selectors) {
      const element = document.querySelector(selector)
      if (element) {
        scrollElement = element
        break
      }
    }

    // if (!scrollElement) {
    //   // 如果找不到，使用整个下拉框
    //   scrollElement = document.querySelector('.search-select-dropdown')
    // }

    // if (scrollElement) {
      // 使用 Intersection Observer 监听加载更多元素
      if (loadMoreRef.value) {
        observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && hasMore.value && !loading.value) {
                console.log('进入区域，===》〉');

                loadMore()
              }
            })
          },
          {
            root: null, // 使用视口作为 root，因为下拉框挂载在 body 上
            rootMargin: '0px',
            threshold: 0.1
          }
        )
        observer.observe(loadMoreRef.value)
      }

  })
}

// 清理滚动监听
const cleanupScrollObserver = () => {
  if (observer && loadMoreRef.value) {
    observer.unobserve(loadMoreRef.value)
    observer.disconnect()
    observer = null
  }

  if (scrollElement && scrollElement._scrollHandler) {
    scrollElement.removeEventListener('scroll', scrollElement._scrollHandler)
    scrollElement._scrollHandler = null
  }

  scrollElement = null
}

// 设置输入法事件监听
const setupCompositionListeners = () => {
  // 如果已经设置过，先清理
  if (inputElement) {
    cleanupCompositionListeners()
  }

  nextTick(() => {
    // 优先通过 ref 查找
    if (containerRef.value) {
      inputElement = containerRef.value.querySelector('.el-input__inner')
    }

    // 如果找不到，尝试通过选择器查找
    if (!inputElement) {
      const selectors = [
        '.search-select-container .el-input__inner',
        '.el-select .el-input__inner'
      ]

      for (const selector of selectors) {
        const element = document.querySelector(selector)
        if (element) {
          inputElement = element
          break
        }
      }
    }

    // 如果还是找不到，延迟重试
    if (!inputElement) {
      setTimeout(() => {
        if (containerRef.value) {
          inputElement = containerRef.value.querySelector('.el-input__inner')
          if (inputElement && !inputElement._compositionStartHandler) {
            attachCompositionListeners()
          }
        }
      }, 100)
      return
    }

    attachCompositionListeners()
  })
}

// 附加输入法事件监听器
const attachCompositionListeners = () => {
  if (!inputElement) return

  // 如果已经附加过，不重复附加
  if (inputElement._compositionStartHandler) {
    return
  }

  // 监听输入法开始事件
  const handleCompositionStart = () => {
    isComposing.value = true
  }

  // 监听输入法结束事件
  const handleCompositionEnd = (e) => {
    isComposing.value = false
    // 输入法结束后，使用当前输入框的值触发搜索
    const query = e.target.value || ''
    if (query) {
      keyword.value = query
      currentPage.value = 1
      hasMore.value = true
      fetchData(1, query, false)
    }
  }

  inputElement.addEventListener('compositionstart', handleCompositionStart)
  inputElement.addEventListener('compositionend', handleCompositionEnd)

  // 保存清理函数
  inputElement._compositionStartHandler = handleCompositionStart
  inputElement._compositionEndHandler = handleCompositionEnd
}

// 清理输入法事件监听
const cleanupCompositionListeners = () => {
  if (inputElement) {
    if (inputElement._compositionStartHandler) {
      inputElement.removeEventListener('compositionstart', inputElement._compositionStartHandler)
      inputElement._compositionStartHandler = null
    }
    if (inputElement._compositionEndHandler) {
      inputElement.removeEventListener('compositionend', inputElement._compositionEndHandler)
      inputElement._compositionEndHandler = null
    }
    inputElement = null
  }
  isComposing.value = false
}

// 处理下拉框显示/隐藏
const handleVisibleChange = (visible) => {
  if (visible) {
    // 打开时，如果没有数据则加载默认数据
    // if (options.value.length === 0 && hasMore.value) {
    //   fetchData(1, keyword.value, false)
    // }
    fetchData(1, keyword.value, false)
    // 设置滚动监听
    setupScrollObserver()
    // 设置输入法事件监听
    setupCompositionListeners()
  } else {
    // setTimeout(()=>{
    //   options.value = []
    //   getAgentStore().setDatasetArr(options.value)
    // })
    if(selectedValue.value){
      const datasetName = options.value.find(item=>item.id === selectedValue.value)?.name
     fetchData(1, datasetName, false)
    }
    // 关闭时清理滚动监听
    cleanupScrollObserver()
    // 清理输入法事件监听
    cleanupCompositionListeners()
  }

}

// 监听 loadMoreRef 变化，重新设置 observer
watch(loadMoreRef, (newVal) => {
  if (newVal && scrollElement) {
    cleanupScrollObserver()
    setupScrollObserver()
  }
})

// 加载更多数据
const loadMore = () => {
  if (loading.value) return
  fetchData(currentPage.value + 1, keyword.value, true)
}

// 处理清空
const handleClear = () => {
  selectedValue.value = ''
  keyword.value = ''
  options.value = []
  getAgentStore().setDatasetArr(options.value)
  currentPage.value = 0
  hasMore.value = true
  setupScrollObserver()
}
const selectedValue=computed(()=>{
  return getAgentStore().agentDatasetVal
})
 fetchData(1, { dataset_id:getAgentStore().agentDatasetVal }, false)

// 初始化加载
onMounted(() => {
  console.log('===>>>>');
  setupScrollObserver()
  // 尝试设置输入法监听（输入框可能已经渲染）
  // setupCompositionListeners()
  // const icon = this.$refs.select.$el.querySelector('.el-input__suffix-inner .el-input__icon');
  // if (icon) icon.classList.add('el-icon-arrow-up');
})

// 组件卸载时清理
onUnmounted(() => {
  cleanupScrollObserver()
  cleanupCompositionListeners()
})
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
::v-deep(.el-select__wrapper){
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
  .is-selected > .option-name{
    color:pink
  }
}
.el-select__input{
  width: 100% !important;
}
</style>

