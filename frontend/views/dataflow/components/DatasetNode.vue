<template>
  <div :class="['dataset-node', { selected: props.selected }]">
    <!-- Node Header -->
    <div class="node-header">
      <div class="node-icon">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3C7.58 3 4 4.79 4 7C4 9.21 7.58 11 12 11S20 9.21 20 7C20 4.79 16.42 3 12 3ZM4 9V12C4 14.21 7.58 16 12 16S20 14.21 20 12V9C20 11.21 16.42 13 12 13S4 11.21 4 9ZM4 14V17C4 19.21 7.58 21 12 21S20 19.21 20 17V14C20 16.21 16.42 18 12 18S4 16.21 4 14Z"/>
        </svg>
      </div>
      <div class="node-info">
        <div class="node-title">数据集</div>
        <div class="node-type">DATASET</div>
      </div>
      <div class="node-actions">
        <button class="delete-button" @click="handleDelete" title="删除节点">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Node Body -->
    <div class="node-body">
      <div class="dataset-section">
        <div class="section-title">选择数据集</div>

        <!-- Dataset Dropdown -->
        <div class="config-item">

          <div class="fields-list">
            <virtual-dropdown></virtual-dropdown>
          </div>
        </div>
        <!-- Dataset Fields Display -->
        <div v-if="localConfig.selectedDataset && datasetFields.length > 0 && !isParsingFields" class="config-item">
          <div class="fields-section">
            <div class="section-title">数据集字段</div>
            <div class="fields-list">
              <div
                v-for="(field, index) in datasetFields"
                :key="`field-display-${field}-${index}`"
                :class="['field-item', { 'field-item-default': field === 'dataset_id' }]"
                :data-field="field"
                :data-index="index"
              >
              <span v-if="field === 'dataset_id'" class="field-type-badge">dataset_id</span>
                <span :class="['field-name', { 'field-name-default': field === 'dataset_id' }]">
                  {{ field === 'dataset_id' ? (localConfig.selectedDataset || 'dataset_id') : field }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Parsing Status -->
        <div v-if="localConfig.selectedDataset && isParsingFields" class="config-item">
          <div class="parsing-section">
            <div class="parsing-indicator">
              <svg class="loading-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
              </svg>
              正在解析数据集字段...
            </div>
          </div>
        </div>

        <!-- Create Dataset Button -->
        <div class="config-item">
          <button class="create-dataset-btn" @click="createDataset">
            创建数据集
          </button>
        </div>
      </div>
    </div>

    <!-- Dataset Field Ports (positioned outside the scrollable area) -->
    <div v-if="localConfig.selectedDataset && datasetFields.length > 0 && !isParsingFields" class="field-output-ports">
      <Handle
        v-for="(field, index) in datasetFields"
        :key="`field-port-${field}-${index}`"
        :id="`dataset-field-${field}`"
        :handle-id="field"
        type="source"
        :position="Position.Right"
        class="port field-output-port"
        :style="{
          top: `${getFieldPortPosition(index)}px`,
          transform: 'translateY(-50%)'
        }"
      >
        <div class="port-label">{{ field === 'dataset_id' ? (localConfig.selectedDataset || 'dataset_id') : field }}</div>
      </Handle>
    </div>

    <!-- Default Output Port (when no dataset selected) -->
    <div v-if="!localConfig.selectedDataset && !isParsingFields" class="output-ports">
      <Handle
        id="dataset-field-dataset_id"
        handle-id="dataset-field-dataset_id"
        type="source"
        :position="Position.Right"
        class="port output-port port-data"
        :style="{ top: '50%' }"
      >
        <div class="port-label">数据输出</div>
      </Handle>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, inject } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { getList, getDatasetData, getFileDownloadUrl } from '@/api/dataflow'
import { useAgentStore } from '@/store/modules/agent'
import VirtualDropdown from '@/components/dataflow/VirtualDropdown.vue'

// Props
const props = defineProps({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  },
  position: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update-node'])

// Router instance
const router = useRouter()

// Inject the update function from parent
const onNodeUpdate = inject('onNodeUpdate', null)
const onNodeDelete = inject('onNodeDelete', null)
const providedDatasets = inject('datasets', ref([]))
let agentStore = null
function getAgentStore() {
  if (!agentStore) {
    agentStore = useAgentStore()
  }
  return agentStore
}
const debugMode = computed(() => {
        return localStorage.getItem('debug_mode') === 'true';
      });
// Local state
const localConfig = ref({
  selectedDataset: ''
})
const availableDatasets = ref([])
const loading = ref(false)
const dropdownOpen = ref(false)

// 字段解析相关状态
const datasetFields = ref([])
const isParsingFields = ref(false)
const fieldParseError = ref('')

// 缓存机制
const datasetFieldsCache = new Map()
const FILE_SIZE_LIMIT = 100 * 1024 * 1024 // 100MB
const PARSE_CONTENT_LIMIT = 1024 * 10 // 10KB

// Computed
const selectedDatasetName = computed(() => {
  const dataset = availableDatasets.value.find(d => d.id === localConfig.value.selectedDataset)
  return dataset ? dataset.name : ''
})

// 计算字段端口在节点右侧的绝对位置
const getFieldPortPosition = (index) => {
  // 精确计算各部分高度
  const headerHeight = 32 + 32 + 12 + 1 // padding-top + content + padding-bottom + border
  const bodyPaddingTop = 16
  const datasetSectionTitleHeight = 13 + 8 + 4 // font-size + margin-bottom + padding-bottom
  const selectHeight = 44 // 选择框高度
  const sectionMargin = 16 // config-item margin-bottom
  const fieldsSectionTitleHeight = 13 + 8 + 4 // 字段标题
  const fieldsListPadding = 8
  const fieldItemHeight = 30 + 2 // height + margin-bottom

  const baseY = headerHeight + bodyPaddingTop + datasetSectionTitleHeight + selectHeight +
                sectionMargin + fieldsSectionTitleHeight + fieldsListPadding

  const fieldY = baseY + (index * fieldItemHeight) + 15 // 15 是field-item高度的一半

  // console.log(`字段 ${index} 端口位置计算:`, {
  //   headerHeight,
  //   bodyPaddingTop,
  //   datasetSectionTitleHeight,
  //   selectHeight,
  //   sectionMargin,
  //   fieldsSectionTitleHeight,
  //   fieldsListPadding,
  //   baseY,
  //   fieldY
  // })

  return fieldY
}

// Methods
const updateConfig = () => {
  if (onNodeUpdate) {
    onNodeUpdate(props.id, {
      config: { ...localConfig.value }
    })
  } else {
    // Fallback to emit if inject is not available
    emit('update-node', props.id, {
      config: { ...localConfig.value }
    })
  }
}

const toggleDropdown = () => {
  if (!loading.value && availableDatasets.value.length > 0) {
    dropdownOpen.value = !dropdownOpen.value
  }
}

const selectDataset = async (id) => {
  localConfig.value.selectedDataset = id
  getAgentStore().setAgentDatasetVal(id)
  dropdownOpen.value = false
  updateConfig()

  // 打印选中的数据集ID
  console.log('选中的数据集ID:', id, typeof id)

  // 解析数据集字段
  try {
    const fields = await parseDatasetFields(id)
    console.log('selectDataset - 解析到的字段:', fields)
    console.log('selectDataset - 字段数量:', fields.length)

    datasetFields.value = fields
    // console.log('selectDataset - 设置后的datasetFields.value:', datasetFields.value)
    // console.log('selectDataset - datasetFields.value长度:', datasetFields.value.length)

    // 通知父组件更新端口信息
    if (onNodeUpdate) {
      onNodeUpdate(props.id, {
        config: { ...localConfig.value },
        datasetFields: fields
      })
    }
  // if(getAgentStore().agentDatasetVal !== id){
  //   selectDataset(id)
  // }
  } catch (error) {
    console.error('解析数据集字段失败:', error)
    // 解析失败时显示默认字段
    datasetFields.value = ['dataset_id']
  }
}

const createDataset = () => {
  // 跳转到数据集创建页面，并传递来源参数
  // console.log('DatasetNode - 准备跳转到数据集创建页面，来源参数: operator-workflow')
  router.push({
    path: '/dataset/create',
    query: {
      from: 'operator-workflow'
    }
  }).then(() => {
    console.log('DatasetNode - 跳转成功')
  }).catch(error => {
    console.error('DatasetNode - 跳转失败:', error)
  })
}

// 删除节点处理函数
const handleDelete = () => {
  if (onNodeDelete) {
    onNodeDelete(props.id)
  }
}

// 字段解析相关函数
const isJsonFile = (filename) => {
  const ext = filename.toLowerCase().split('.').pop()
  return ['json', 'jsonl'].includes(ext)
}

const parseJsonData = (content, filename) => {
  console.log('parseJsonData - 开始解析')
  console.log('文件名:', filename)
  console.log('内容长度:', content?.length || 0)
  console.log('内容预览:', content?.substring(0, 200) || '(无内容)')

  if (!content || content.trim().length === 0) {
    console.error('parseJsonData - 内容为空')
    return null
  }

  try {
    // 判断是否为部分加载的内容（小于完整文件大小）
    const isPartialContent = content.length <= PARSE_CONTENT_LIMIT
    console.log('parseJsonData - 是否为部分内容:', isPartialContent)

    // 提取键名的辅助函数，忽略值的复杂性
    const extractKeysWithEmptyValues = (obj) => {
      if (!obj || typeof obj !== 'object') return null

      // 创建一个新对象，保留所有键但值设为null
      const result = {}
      Object.keys(obj).forEach(key => {
        result[key] = null
      })
      return result
    }

    if (filename.endsWith('.jsonl')) {
      console.log('parseJsonData - 处理JSONL格式')
      // JSONL格式：每行一个JSON对象
      const lines = content.split('\n').filter(line => line.trim())
      console.log(`parseJsonData - 找到 ${lines.length} 行数据`)

      if (lines.length === 0) {
        console.warn('parseJsonData - JSONL文件没有有效数据行')
        return null
      }

      try {
        // 对于部分内容，只解析第一行；对于完整内容，尝试合并多行数据的字段
        if (isPartialContent) {
          console.log('parseJsonData - 部分内容模式，只解析第一行')
          console.log('parseJsonData - 第一行数据:', lines[0])
          // 尝试解析第一行，如果失败则尝试其他行
          let firstRecord = null
          let lineIndex = 0

          while (!firstRecord && lineIndex < Math.min(5, lines.length)) {
            try {
              const parsed = JSON.parse(lines[lineIndex])
              firstRecord = extractKeysWithEmptyValues(parsed)
            } catch (e) {
              console.warn(`parseJsonData - 第${lineIndex+1}行解析失败:`, e.message)
              lineIndex++
            }
          }

          if (!firstRecord) {
            throw new Error('无法解析JSONL文件的任何行')
          }

          console.log('parseJsonData - 解析后的第一条记录(仅键名):', firstRecord)
          return firstRecord
        } else {
          // 对于完整内容，尝试解析更多行以获取更完整的字段集合
          console.log('parseJsonData - 完整内容模式，解析多行数据')
          // 最多解析前10行数据来获取字段
          const sampleSize = Math.min(10, lines.length)
          const mergedRecord = {}
          let parsedCount = 0

          for (let i = 0; i < sampleSize; i++) {
            try {
              const record = JSON.parse(lines[i])
              // 只提取键名
              if (record && typeof record === 'object') {
                Object.keys(record).forEach(key => {
                  if (!(key in mergedRecord)) {
                    mergedRecord[key] = null
                  }
                })
                parsedCount++
              }
            } catch (e) {
              console.warn(`parseJsonData - 第${i+1}行解析失败:`, e.message)
            }
          }

          if (parsedCount === 0) {
            console.warn('parseJsonData - 所有样本行解析失败')
            return null
          }

          console.log('parseJsonData - 合并后的记录(仅键名):', mergedRecord)
          return mergedRecord
        }
      } catch (error) {
        console.error('parseJsonData - JSONL解析失败:', error)
        return null
      }
    } else {
      console.log('parseJsonData - 处理JSON格式')
      // JSON格式：可能是数组或单个对象
      try {
        const data = JSON.parse(content)
        console.log('parseJsonData - 解析后的数据类型:', typeof data)
        console.log('parseJsonData - 是否为数组:', Array.isArray(data))

        if (Array.isArray(data)) {
          console.log(`parseJsonData - 数组长度: ${data.length}`)
          if (data.length === 0) {
            console.warn('parseJsonData - JSON数组为空')
            return null
          }

          // 对于部分内容，只提取第一个元素的键名；对于完整内容，合并多个元素的键名
          if (isPartialContent) {
            const firstItem = data[0]
            if (firstItem && typeof firstItem === 'object') {
              const keysOnly = extractKeysWithEmptyValues(firstItem)
              console.log('parseJsonData - 第一个元素的键名:', keysOnly)
              return keysOnly
            }
            return null
          } else {
            // 对于完整内容，合并多个元素的键名
            console.log('parseJsonData - 完整内容模式，合并多个元素的键名')
            // 最多使用前10个元素来获取字段
            const sampleSize = Math.min(10, data.length)
            const mergedRecord = {}

            for (let i = 0; i < sampleSize; i++) {
              const sample = data[i]
              if (sample && typeof sample === 'object') {
                Object.keys(sample).forEach(key => {
                  if (!(key in mergedRecord)) {
                    mergedRecord[key] = null
                  }
                })
              }
            }

            console.log('parseJsonData - 合并后的键名:', mergedRecord)
            return mergedRecord
          }
        } else if (data && typeof data === 'object') {
          // 单个对象，只提取键名
          const keysOnly = extractKeysWithEmptyValues(data)
          console.log('parseJsonData - 对象的键名:', keysOnly)
          return keysOnly
        } else {
          console.warn('parseJsonData - 数据不是对象或数组')
          return null
        }
      } catch (error) {
        console.error('parseJsonData - JSON解析失败:', error)
        return null
      }
    }
  } catch (error) {
    console.error('parseJsonData - 解析过程出错:', error)
    console.error('parseJsonData - 尝试解析的内容:', content.substring(0, 500))
    throw new Error(`JSON解析失败: ${error.message}`)
  }
}

const extractFields = (record) => {
  console.log('extractFields - 开始提取字段')
  console.log('record:', record)
  console.log('record类型:', typeof record)
  console.log('record是否为null:', record === null)

  if (!record || typeof record !== 'object') {
    console.warn('extractFields - record不是有效对象，返回空数组')
    return []
  }

  const allKeys = Object.keys(record)
  console.log('extractFields - 所有键名:', allKeys)

  // 不再过滤字段类型，直接返回所有键名
  console.log('extractFields - 返回所有字段:', allKeys)
  return allKeys
}

const downloadFileContent = async (url, sizeLimit = PARSE_CONTENT_LIMIT) => {
  console.log('开始下载文件:', url)
  console.log('下载大小限制:', sizeLimit, 'bytes')

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', url, true)

    // 设置响应类型为文本
    xhr.responseType = 'text'

    // 添加请求头，确保获取文本内容
    xhr.setRequestHeader('Accept', 'application/json, text/plain, */*')

    let downloaded = 0
    let partialContent = ''

    xhr.onprogress = (event) => {
      if (event.lengthComputable) {
        console.log(`下载进度: ${event.loaded}/${event.total} bytes (${Math.round(event.loaded/event.total*100)}%)`)
      } else {
        console.log(`已下载: ${event.loaded} bytes`)
      }

      downloaded = event.loaded

      // 如果下载量超过限制，中止请求
      if (downloaded > sizeLimit) {
        console.log(`达到下载限制 ${sizeLimit} bytes，中止下载`)
        xhr.abort()
        // 返回已获取的部分内容
        const content = xhr.responseText || partialContent || ''
        console.log(`中止时获取的内容长度: ${content.length}`)
        resolve(content.substring(0, sizeLimit))
        return
      }
    }

    xhr.onreadystatechange = () => {
      console.log(`请求状态变化: readyState=${xhr.readyState}, status=${xhr.status}`)

      if (xhr.readyState === 2) { // HEADERS_RECEIVED
        console.log('响应头信息:')
        console.log('Content-Type:', xhr.getResponseHeader('Content-Type'))
        console.log('Content-Length:', xhr.getResponseHeader('Content-Length'))
      }

      if (xhr.readyState === 3) { // LOADING 状态
        partialContent = xhr.responseText || ''
        console.log(`LOADING状态，当前内容长度: ${partialContent.length}`)
      }
    }

    xhr.onload = () => {
      console.log(`下载完成！状态: ${xhr.status}, ${xhr.statusText}`)

      if (xhr.status >= 200 && xhr.status < 300) {
        const finalContent = xhr.responseText || ''
        console.log(`最终文件内容长度: ${finalContent.length} 字符`)

        if (finalContent.length > 0) {
          console.log(`文件内容预览(前300字符):`)
          console.log(finalContent.substring(0, 300))
          console.log(`文件内容结尾(后100字符):`)
          console.log(finalContent.substring(Math.max(0, finalContent.length - 100)))
        } else {
          console.warn('警告：下载的文件内容为空！')
        }

        // 如果内容超过限制，只返回限制大小的内容
        const result = finalContent.length > sizeLimit ?
          finalContent.substring(0, sizeLimit) : finalContent

        resolve(result)
      } else {
        console.error(`HTTP错误: ${xhr.status} ${xhr.statusText}`)
        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`))
      }
    }

    xhr.onerror = (event) => {
      console.error('网络错误:', event)
      console.error('错误详情:', xhr.status, xhr.statusText)
      reject(new Error(`Network error: ${xhr.status} ${xhr.statusText}`))
    }

    xhr.ontimeout = () => {
      console.error('请求超时')
      reject(new Error('Request timeout'))
    }

    xhr.onabort = () => {
      console.log('请求被中止')
      // 中止时返回已获取的内容
      const content = xhr.responseText || partialContent || ''
      console.log(`中止时内容长度: ${content.length}`)
      resolve(content.substring(0, sizeLimit))
    }

    // 设置30秒超时
    xhr.timeout = 30000

    try {
      console.log('发送请求...')
      xhr.send()
    } catch (error) {
      console.error('发送请求失败:', error)
      reject(error)
    }
  })
}
const datasetList = computed(()=>{
  return getAgentStore().datasetArr
})
const parseDatasetFields = async (datasetId) => {
  if(!datasetId){
    return []
  }
  // 验证数据集ID是否在可用列表中
  // const datasetExists = datasetList.value.some(dataset => dataset.id === datasetId)
  // console.log(getAgentStore().datasetArr,'数据集ID是否存在:', datasetExists)
  // if (!datasetExists) {
  //   console.log('数据集ID不在可用列表中，跳过解析:', datasetId)
  //   return []
  // }

  // 检查缓存
  if (datasetFieldsCache.has(datasetId)) {
    return datasetFieldsCache.get(datasetId)
  }

  // 定义基础字段，包含dataset_id
  const baseFields = ['dataset_id']

  try {
    isParsingFields.value = true
    fieldParseError.value = ''

    // 1. 获取数据集文件列表
    const filesResponse = await getDatasetData({
      id: datasetId,
      page: 1,
      size: 10
    })

    if (filesResponse.code !== 0 || !filesResponse.data?.list) {
      throw new Error('获取数据集文件列表失败')
    }

    // 2. 查找第一个JSON/JSONL文件
    const jsonFile = filesResponse.data.list.find(file =>
      isJsonFile(file.name) && file.size <= FILE_SIZE_LIMIT
    )

    if (!jsonFile) {
      // 没有JSON文件，只返回基础字段
      datasetFieldsCache.set(datasetId, baseFields)
      return baseFields
    }

    // 3. 检查文件大小
    if (jsonFile.size > FILE_SIZE_LIMIT) {
      console.warn(`文件 ${jsonFile.name} 大小超过限制 (${jsonFile.size} bytes)`)
      // 文件过大，只返回基础字段
      datasetFieldsCache.set(datasetId, baseFields)
      return baseFields
    }

    // 4. 获取文件下载URL
    console.log('准备获取文件下载URL, object_path:', jsonFile.path)
    const urlResponse = await getFileDownloadUrl({
      object_path: jsonFile.path
    })

    console.log('获取下载URL响应:', urlResponse)

    if (urlResponse.code !== 0 || !urlResponse.data?.url) {
      console.error('获取文件下载地址失败，响应:', urlResponse)
      throw new Error(`获取文件下载地址失败: ${urlResponse.msg || '未知错误'}`)
    }

    console.log('成功获取下载URL:', urlResponse.data.url)
    console.log('文件信息:', {
      name: jsonFile.name,
      path: jsonFile.path,
      size: jsonFile.size
    })

    // 5. 下载文件内容 - 对于小于10MB的文件，下载完整内容；大于10MB的文件才使用部分内容
    console.log('开始下载文件内容...')
    // 如果文件小于10MB，下载完整内容，否则只下载部分内容用于解析
    const downloadLimit = jsonFile.size <= FILE_SIZE_LIMIT ? jsonFile.size : PARSE_CONTENT_LIMIT
    const content = await downloadFileContent(urlResponse.data.url, downloadLimit)
    console.log("下载完成，content长度:", content?.length || 0)
    console.log("content内容:", content?.substring(0, 100) || '(空内容)')

    if (!content || content.trim().length === 0) {
      console.error('下载的文件内容为空')
      throw new Error('文件内容为空，无法解析字段')
    }

    console.log('开始解析JSON数据...')
    let record = null
    try {
      record = parseJsonData(content, jsonFile.name)
      console.log('JSON解析结果 record:', record)
      console.log('record类型:', typeof record)
      console.log('是否为对象:', record && typeof record === 'object')
    } catch (error) {
      console.warn('JSON解析失败，只显示基础字段:', error.message)
      // 解析失败时返回基础字段
      datasetFieldsCache.set(datasetId, baseFields)
      return baseFields
    }

    const parsedFields = extractFields(record)
    // 将解析到的字段与基础字段合并，dataset_id在最前面
    const allFields = [...baseFields, ...parsedFields]

    // 6. 缓存结果
    datasetFieldsCache.set(datasetId, allFields)

    console.log(`数据集 ${datasetId} 解析到字段:`, allFields)
    return allFields

  } catch (error) {
    console.warn('解析数据集字段失败:', error)
    fieldParseError.value = error.message || '解析失败'

    // 返回基础字段
    datasetFieldsCache.set(datasetId, baseFields)
    return baseFields
  } finally {
    isParsingFields.value = false
  }
}

const loadDatasets = async () => {
  loading.value = true
  try {
    // 使用父组件提供的数据集列表
    if (providedDatasets.value && providedDatasets.value.length > 0) {
      availableDatasets.value = providedDatasets.value
      console.log('使用父组件提供的数据集列表:', availableDatasets.value.length, '个数据集')
    } else {
      // 如果父组件没有提供数据，则直接调用API（备用方案）
      // const response = await getList({
      //   page_size: 100,
      //   page_num: 1
      // })
      // console.log('获取到的数据集列表:', response)

      // if (response && response.code === 0 && response.data && response.data.list) {
      //   availableDatasets.value = response.data.list
      //   console.log('数据集加载成功:', availableDatasets.value.length, '个数据集')
      // } else {
      //   availableDatasets.value = []
      //   console.warn('数据集列表为空或格式不正确')
      // }


    }
     if(getAgentStore().agentDatasetVal){
       selectDataset(getAgentStore().agentDatasetVal)
      }

  } catch (error) {
    console.error('加载数据集失败:', error)
    availableDatasets.value = []
    ElMessage.error('加载数据集列表失败')
  } finally {
    loading.value = false
  }
}

// Initialize config
const initializeConfig = async () => {
  const defaultConfig = props.data.config || {}
  localConfig.value = { ...defaultConfig }

  // 如果已有选中的数据集，解析其字段
  if (localConfig.value.selectedDataset) {
    try {
      const fields = await parseDatasetFields(localConfig.value.selectedDataset)
      datasetFields.value = fields
    } catch (error) {
      console.error('初始化时解析数据集字段失败:', error)
      datasetFields.value = []
    }
  }
}

// Handle click outside to close dropdown
const handleClickOutside = (event) => {
  const dropdown = event.target.closest('.custom-select-wrapper')
  if (!dropdown && dropdownOpen.value) {
    dropdownOpen.value = false
  }
}

// Handle touch events specifically
const handleTouchOutside = (event) => {
  const dropdown = event.target.closest('.custom-select-wrapper')
  if (!dropdown && dropdownOpen.value) {
    dropdownOpen.value = false
  }
}

// Lifecycle
onMounted(async () => {
  console.log('DatasetNode mounted with props:', props)
  await initializeConfig()
  loadDatasets()

  // Add global click and touch listeners
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('touchstart', handleTouchOutside, { passive: true })
})

onUnmounted(() => {
  // Remove global listeners
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('touchstart', handleTouchOutside)
})

// Watch for data changes
// watch(() => props.data, async () => {
//   await initializeConfig()
// }, { deep: true })

// Watch for parent provided datasets changes
// watch(providedDatasets, () => {
//   if (providedDatasets.value && providedDatasets.value.length > 0) {
//     availableDatasets.value = providedDatasets.value
//     console.log('父组件数据集列表更新:', availableDatasets.value.length, '个数据集')
//   }
// }, { deep: true })
watch(()=> getAgentStore().agentDatasetVal, async (newValue, oldValue)=>{
  await selectDataset(newValue)
},{deep:true})
</script>

<style scoped>
.dataset-node {
  background: white;
  border: 2px solid #34C759;
  border-radius: 12px;
  min-width: 350px;
  min-height: 120px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  touch-action: auto;
}

.dataset-node:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.dataset-node.selected {
  border-color: #34C759;
  box-shadow: 0 0 0 3px rgba(52, 199, 89, 0.2);
}

/* Node Header */
.node-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
  border-bottom: 1px solid #BBF7D0;
  border-radius: 10px 10px 0 0;
}

.node-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: #34C759;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.node-info {
  flex: 1;
}

.node-title {
  font-size: 15px;
  font-weight: 600;
  color: #1C1C1E;
  line-height: 1.2;
  margin-bottom: 2px;
}

.node-type {
  font-size: 12px;
  color: #34C759;
  font-weight: 500;
}

.node-actions {
  margin-left: 8px;
}

.delete-button {
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(255, 59, 48, 0.1);
  color: #FF3B30;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  opacity: 0.7;
  border: 1px solid rgba(255, 59, 48, 0.3);
  font-weight: 600;
}

.delete-button:hover {
  opacity: 1;
  background: #FF3B30;
  color: white;
  transform: scale(1.1);
}

.delete-button:active {
  transform: scale(0.95);
}

/* Node Body */
.node-body {
  padding: 16px;
}

.dataset-section {
  margin-bottom: 0;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #34C759;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #E5E5EA;
}

/* 字段显示区域 */
.fields-section {
  margin-bottom: 16px;
}

.fields-list {
  position: relative;
  background: #F9F9F9;
  border: 1px solid #E5E5EA;
  border-radius: 8px;
  padding: 8px;
}

.field-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  margin-bottom: 2px;
  padding: 0 8px;
  background: white;
  border: 1px solid #E5E5EA;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.field-item:last-child {
  margin-bottom: 0;
}

.field-item:hover {
  border-color: #34C759;
  box-shadow: 0 2px 4px rgba(52, 199, 89, 0.1);
}

.field-name {
  font-size: 13px;
  font-weight: 500;
  color: #1C1C1E;
  font-family: 'SF Mono', Consolas, monospace;
  background: #F2F2F7;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #E5E5EA;
}

.field-name-default {
  background: #E8F5E8;
  border-color: #34C759;
  color: #1B5E1F;
  font-weight: 600;
}

.field-item-default {
  background: linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%);
  border-color: #34C759;
}

.field-type-badge {
  font-size: 10px;
  font-weight: 600;
  color: #34C759;
  background: rgba(52, 199, 89, 0.1);
  padding: 2px 6px;
  border-radius: 10px;
  border: 1px solid rgba(52, 199, 89, 0.3);
}


/* 解析状态样式 */
.parsing-section {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: #F9F9F9;
  border: 1px solid #E5E5EA;
  border-radius: 8px;
}

.parsing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #8E8E93;
  font-weight: 500;
}

.loading-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.config-item {
  margin-bottom: 16px;
}

.config-item:last-child {
  margin-bottom: 0;
}

.config-label {
  font-size: 13px;
  font-weight: 600;
  color: #1C1C1E;
  margin-bottom: 8px;
  display: block;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

/* Custom Select Dropdown */
.custom-select-wrapper {
  position: relative;
  touch-action: auto;
}

.custom-select {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #E5E5EA;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 20px;
}

.custom-select:hover:not(.is-disabled) {
  border-color: #C7C7CC;
  background-color: #FAFAFA;
}

.custom-select.is-open {
  border-color: #34C759;
  box-shadow: 0 0 0 4px rgba(52, 199, 89, 0.1);
}

.custom-select.is-disabled {
  background-color: #F2F2F7;
  cursor: not-allowed;
  border-color: #E5E5EA;
}

.select-display {
  flex: 1;
  overflow: hidden;
}

.selected-text {
  font-size: 14px;
  font-weight: 500;
  color: #1C1C1E;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.placeholder-text {
  font-size: 14px;
  font-weight: 400;
  color: #8E8E93;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.select-arrow {
  margin-left: 8px;
  color: #8E8E93;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.custom-select.is-open .select-arrow {
  transform: rotate(180deg);
}

.custom-select.is-disabled .select-arrow {
  color: #C7C7CC;
}

/* Dropdown Panel */
.dropdown-panel {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #E5E5EA;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 10000;
  overflow: hidden;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  pointer-events: auto;
  touch-action: auto;
}

.dropdown-content {
  max-height: 240px;
  overflow-y: auto;
  padding: 8px 0;
  overscroll-behavior: contain;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  -ms-overflow-style: auto;
  scrollbar-width: thin;
}

.dropdown-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.15s ease;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background-color: #F2F2F7;
}

.dropdown-item.is-selected {
  background-color: rgba(52, 199, 89, 0.08);
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  color: #1C1C1E;
  line-height: 1.3;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

.item-description {
  font-size: 12px;
  color: #8E8E93;
  line-height: 1.3;
  margin-top: 2px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.check-icon {
  color: #34C759;
  margin-left: 8px;
  flex-shrink: 0;
}

.empty-state {
  padding: 16px;
  text-align: center;
  color: #8E8E93;
  font-size: 13px;
  font-style: italic;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
}

/* Scrollbar styling for dropdown */
.dropdown-content::-webkit-scrollbar {
  width: 6px;
}

.dropdown-content::-webkit-scrollbar-track {
  background: transparent;
  border-radius: 3px;
}

.dropdown-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  transition: background 0.2s ease;
}

.dropdown-content::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

.create-dataset-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid #34C759;
  border-radius: 10px;
  background: white;
  color: #34C759;
  font-size: 14px;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.create-dataset-btn:hover {
  background: #34C759;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(52, 199, 89, 0.25);
}

.create-dataset-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(52, 199, 89, 0.2);
}

.button-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* Field Output Ports */
.field-output-ports {
  position: absolute;
  top: 0;
  right: -8px;
  height: 100%;
  pointer-events: none;
}

.field-output-port {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  background: #34C759;
  cursor: crosshair;
  pointer-events: all;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.field-output-port:hover {
  background: #22C55E;
  transform: translateY(-50%) scale(1.2);
  box-shadow: 0 0 0 4px rgba(52, 199, 89, 0.2);
}

/* Output Ports */
.output-ports {
  position: absolute;
  top: 0;
  right: -8px;
  height: 100%;
  pointer-events: none;
}


.port {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid white;
  background: #34C759;
  cursor: crosshair;
  pointer-events: all;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
}

.port:hover {
  background: #22C55E;
  transform: translateY(-50%) scale(1.2);
  box-shadow: 0 0 0 4px rgba(52, 199, 89, 0.2);
}

.port-label {
  position: absolute;
  font-size: 11px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
  transform: translateY(-50%);
  right: 24px;
}

.port:hover .port-label {
  opacity: 1;
}

/* Vue Flow Handle Overrides */
:deep(.vue-flow__handle) {
  width: 16px !important;
  height: 16px !important;
  border: 2px solid white !important;
  border-radius: 50% !important;
  background: #34C759 !important;
  cursor: crosshair !important;
  transition: all 0.2s ease !important;
}

:deep(.vue-flow__handle:hover) {
  background: #22C55E !important;
  transform: scale(1.2) !important;
  box-shadow: 0 0 0 4px rgba(52, 199, 89, 0.2) !important;
}

/* Override Vue Flow touch-action for dropdown elements */
:deep(.vue-flow__node) .custom-select-wrapper,
:deep(.vue-flow__node) .dropdown-panel,
:deep(.vue-flow__node) .dropdown-content {
  touch-action: auto !important;
}

/* Ensure dropdown can scroll on touch devices */
.dropdown-panel *,
.dropdown-content * {
  touch-action: auto !important;
  -webkit-overflow-scrolling: touch !important;
}

</style>
