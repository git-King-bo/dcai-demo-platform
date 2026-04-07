<template>
  <aside :class="['template-panel', { 'panel-open': isOpen }]" @click.stop>
    <!-- Panel Header -->
    <div class="panel-header">
      <div class="panel-title">
        <svg class="panel-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 20H16.8C15.1198 20 14.2798 20 13.638 19.673C13.0735 19.3854 12.6146 18.9265 12.327 18.362C12 17.7202 12 16.8802 12 15.2V8.8C12 7.11984 12 6.27976 12.327 5.63803C12.6146 5.07354 13.0735 4.6146 13.638 4.32698C14.2798 4 15.1198 4 16.8 4H17M17 20C17 21.1046 17.8954 22 19 22C20.1046 22 21 21.1046 21 20C21 18.8954 20.1046 18 19 18C17.8954 18 17 18.8954 17 20ZM17 4C17 5.10457 17.8954 6 19 6C20.1046 6 21 5.10457 21 4C21 2.89543 20.1046 2 19 2C17.8954 2 17 2.89543 17 4ZM7 12L17 12M7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12ZM17 12C17 13.1046 17.8954 14 19 14C20.1046 14 21 13.1046 21 12C21 10.8954 20.1046 10 19 10C17.8954 10 17 10.8954 17 12Z"/>
        </svg>
        <span>我的Pipeline</span>
      </div>
    </div>

    <!-- Search Box -->
    <div class="search-container">
      <div class="search-box">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="搜索模板..."
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="clear-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Panel Content -->
    <div class="panel-content">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner">
          <svg class="spinner-icon" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,4A8,8 0 0,1 20,12C20,16.42 16.42,20 12,20A8,8 0 0,1 4,12C4,7.58 7.58,4 12,4ZM12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" opacity="0.3"/>
            <path d="M12,4A8,8 0 0,1 20,12H18A6,6 0 0,0 12,6V4Z"/>
          </svg>
        </div>
        <div class="loading-text">加载模版中...</div>
      </div>

      <!-- Template List -->
      <div v-else-if="filteredTemplates.length > 0" class="template-list">
        <!-- Debug info -->
        <!-- <div style="color: red; font-size: 12px; padding: 8px;">Debug: {{ templates.length }} templates loaded</div> -->
        <div
          v-for="template in filteredTemplates"
          :key="template.id"
          class="template-card"
          :draggable="true"
          @click="applyTemplate(template)"
          @dragstart="handleDragStart($event, template)"
          @dragend="handleDragEnd"
        >
          <div class="template-header">
            <div class="template-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 20H16.8C15.1198 20 14.2798 20 13.638 19.673C13.0735 19.3854 12.6146 18.9265 12.327 18.362C12 17.7202 12 16.8802 12 15.2V8.8C12 7.11984 12 6.27976 12.327 5.63803C12.6146 5.07354 13.0735 4.6146 13.638 4.32698C14.2798 4 15.1198 4 16.8 4H17M17 20C17 21.1046 17.8954 22 19 22C20.1046 22 21 21.1046 21 20C21 18.8954 20.1046 18 19 18C17.8954 18 17 18.8954 17 20ZM17 4C17 5.10457 17.8954 6 19 6C20.1046 6 21 5.10457 21 4C21 2.89543 20.1046 2 19 2C17.8954 2 17 2.89543 17 4ZM7 12L17 12M7 12C7 13.1046 6.10457 14 5 14C3.89543 14 3 13.1046 3 12C3 10.8954 3.89543 10 5 10C6.10457 10 7 10.8954 7 12ZM17 12C17 13.1046 17.8954 14 19 14C20.1046 14 21 13.1046 21 12C21 10.8954 20.1046 10 19 10C17.8954 10 17 10.8954 17 12Z"/>
              </svg>
            </div>
            <div class="template-info">
              <div class="template-name">{{ template.name }}</div>
              <div class="template-type">{{ template.template_type || 'TEMPLATE' }}</div>
            </div>
            <button
              class="delete-button"
              @click.stop="handleDelete(template)"
              title="删除模板"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
          </div>

          <!-- 描述部分 -->
          <div v-if="template.description" class="template-section">
            <div class="section-label">功能描述</div>
            <div class="template-description">
              {{ template.description }}
            </div>
          </div>

          <!-- 功能说明部分 -->
          <div v-if="template.detail?.features && template.detail.features.length > 0" class="template-section">
            <div class="section-label">管线特点</div>
            <div class="template-features">
              <div
                v-for="(feature, index) in template.detail.features"
                :key="index"
                class="feature-item"
              >
                {{ feature }}
              </div>
            </div>
          </div>

          <!-- 阅读文档按钮 -->
          <div v-if="template.link" class="template-actions">
            <button
              class="read-docs-button"
              @click.stop="openDocumentation(template.link)"
            >
              <svg class="docs-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              阅读文档
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        <div v-if="searchQuery.trim()" class="empty-state-title">未找到匹配的模板</div>
        <div v-else class="empty-state-title">暂无可用模版</div>
        <div v-if="searchQuery.trim()" class="empty-state-subtitle">请尝试其他搜索关键词</div>
        <div v-else class="empty-state-subtitle">请检查网络连接或稍后重试</div>
        <button v-if="!searchQuery.trim()" class="refresh-button" @click="loadTemplates">
          <svg class="refresh-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4 7.58 4 12S7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12S8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z"/>
          </svg>
          刷新模版列表
        </button>
        <button v-else class="refresh-button" @click="searchQuery = ''">
          清除搜索
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getBestTemplateList, deleteTemplate } from '@/api/task'

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'apply-template'])

// State
const templates = ref([])
const loading = ref(false)
const searchQuery = ref('')
const filteredTemplates1= [
{
  "id": 33,
  "name": "Pipeline_2026-03-17T03-04-49",
  "link": null,
  "description": "自定义Pipeline配置",
  "template_type": "default",
  "tags": [
    "customized"
  ],
  "detail": {},
  "dataset_ids": [],
  "pipeline_config": {
    "edges": [
      {
        "source": "node2",
        "target": "node1",
        "source_port": "output_key",
        "target_port": "input_col"
      },
      {
        "source": "node1",
        "target": "node3",
        "source_port": "output_col",
        "target_port": "input_col"
      },
      {
        "source": "node3",
        "target": "node4",
        "source_port": "output_col",
        "target_port": "input_aux_keys"
      },
      {
        "source": "node5",
        "target": "node2",
        "source_port": "output_key",
        "target_port": "input_key"
      },
      {
        "source": "node4",
        "target": "node6",
        "source_port": "output_key",
        "target_port": "input_col"
      },
      {
        "source": "node6",
        "target": "node7",
        "source_port": "output_col",
        "target_port": "input_col"
      },
      {
        "source": "node7",
        "target": "node8",
        "source_port": "output_col",
        "target_port": "input_aux_keys"
      },
      {
        "source": "node8",
        "target": "node9",
        "source_port": "output_key",
        "target_port": "input_col"
      },
      {
        "source": "node9",
        "target": "node10",
        "source_port": "output_col",
        "target_port": "node10-node-input"
      },
      {
        "source": "node10",
        "target": "node11",
        "source_port": "output_key",
        "target_port": "input_col"
      },
      {
        "source": "node11",
        "target": "node12",
        "source_port": "output_col",
        "target_port": "node12-node-input"
      },
      {
        "source": "node12",
        "target": "node13",
        "source_port": "output_key",
        "target_port": "input_col"
      },
      {
        "source": "node13",
        "target": "node14",
        "source_port": "output_col",
        "target_port": "input_key"
      }
    ],
    "nodes": [
      {
        "id": "node5",
        "name": "UniParser",
        "type": "parser",
        "config": {
          "run": {
            "chart": true,
            "table": true,
            "figure": false,
            "textual": true,
            "equation": true,
            "molecule": true,
            "table_cls": false,
            "expression": true,
            "output_key": "content",
            "admin_debug": false,
            "input_paths": "72590fb3-ccd5-401d-9778-7fcb3a321444",
            "rename_fields": false,
            "ordering_method": "gap_tree"
          },
          "init": {}
        },
        "position": {
          "x": -600,
          "y": 200
        }
      },
      {
        "id": "node2",
        "name": "ChunkedPromptedGenerator",
        "type": "internal",
        "config": {
          "run": {
            "input_key": "content",
            "output_key": "structure_info"
          },
          "init": {
            "use_llm": true,
            "max_chunk_len": 128000,
            "input_aux_keys": "",
            "allowed_prompts": [
              "StructureInfoExtractPrompt"
            ],
            "user_model_name": [
              "gemini-2.5-flash"
            ],
            "json_schema_kwargs": null
          }
        },
        "position": {
          "x": 340,
          "y": 180
        }
      },
      {
        "id": "node1",
        "name": "DataFrameTransformOperator",
        "type": "internal",
        "config": {
          "run": {
            "output_col": "structure_info"
          },
          "init": {
            "op": "parse_json_list",
            "keys": null,
            "field": null,
            "json_key": null,
            "input_col": "structure_info",
            "sublist_key": null
          }
        },
        "position": {
          "x": 800,
          "y": 200
        }
      },
      {
        "id": "node3",
        "name": "DataFrameTransformOperator",
        "type": "internal",
        "config": {
          "run": {
            "output_col": "material_indexes"
          },
          "init": {
            "op": "extract_nested_fields",
            "keys": "[\"chemical_formula\", \"lattice_parameter\", \"space_group\", \"n_atoms\", \"note\"]",
            "field": null,
            "json_key": null,
            "input_col": "structure_info",
            "sublist_key": "material_structures"
          }
        },
        "position": {
          "x": 1220,
          "y": 200
        }
      },
      {
        "id": "node4",
        "name": "ChunkedPromptedGenerator",
        "type": "internal",
        "config": {
          "run": {
            "input_key": "content",
            "output_key": "computation_detail"
          },
          "init": {
            "use_llm": true,
            "max_chunk_len": 128000,
            "input_aux_keys": "material_indexes",
            "allowed_prompts": [
              "ComputationDetailExtractPrompt"
            ],
            "user_model_name": [
              "gemini-2.5-flash"
            ],
            "json_schema_kwargs": null
          }
        },
        "position": {
          "x": 1640,
          "y": 200
        }
      },
      {
        "id": "node6",
        "name": "DataFrameTransformOperator",
        "type": "internal",
        "config": {
          "run": {
            "output_col": "computation_detail"
          },
          "init": {
            "op": "parse_json_list",
            "keys": null,
            "field": null,
            "json_key": null,
            "input_col": "computation_detail",
            "sublist_key": null
          }
        },
        "position": {
          "x": 2080,
          "y": 240
        }
      },
      {
        "id": "node7",
        "name": "DataFrameTransformOperator",
        "type": "internal",
        "config": {
          "run": {
            "output_col": "computation_indexes"
          },
          "init": {
            "op": "extract_nested_fields",
            "keys": "[\"chemical_formula\", \"space_group\", \"n_atoms\", \"K_points\", \"theoretical_calculation_method\", \"Exchange_Correlation_Functional\", \"note\"] ",
            "field": null,
            "json_key": null,
            "input_col": "computation_detail",
            "sublist_key": "material_structures"
          }
        },
        "position": {
          "x": 2520,
          "y": 240
        }
      },
      {
        "id": "node8",
        "name": "ChunkedPromptedGenerator",
        "type": "internal",
        "config": {
          "run": {
            "input_key": "content",
            "output_key": "thermal_properties"
          },
          "init": {
            "use_llm": true,
            "max_chunk_len": 128000,
            "input_aux_keys": "computation_indexes",
            "allowed_prompts": [
              "ThermalPropertyExtractPrompt"
            ],
            "user_model_name": [
              "gemini-2.5-flash"
            ],
            "json_schema_kwargs": null
          }
        },
        "position": {
          "x": 3000,
          "y": 220
        }
      },
      {
        "id": "node9",
        "name": "DataFrameTransformOperator",
        "type": "internal",
        "config": {
          "run": {
            "output_col": "thermal_properties"
          },
          "init": {
            "op": "parse_json_list",
            "keys": null,
            "field": null,
            "json_key": null,
            "input_col": "thermal_properties",
            "sublist_key": null
          }
        },
        "position": {
          "x": 3420,
          "y": 280
        }
      },
      {
        "id": "node10",
        "name": "ChunkedPromptedGenerator",
        "type": "internal",
        "config": {
          "run": {
            "input_key": "content",
            "output_key": "mechanical_properties"
          },
          "init": {
            "use_llm": true,
            "max_chunk_len": 128000,
            "input_aux_keys": "computation_indexes",
            "allowed_prompts": [
              "MechanicalPropertyExtractPrompt"
            ],
            "user_model_name": [
              "gemini-2.5-flash"
            ],
            "json_schema_kwargs": null
          }
        },
        "position": {
          "x": 3900,
          "y": 260
        }
      },
      {
        "id": "node11",
        "name": "DataFrameTransformOperator",
        "type": "internal",
        "config": {
          "run": {
            "output_col": "mechanical_properties"
          },
          "init": {
            "op": "parse_json_list",
            "keys": null,
            "field": null,
            "json_key": null,
            "input_col": "mechanical_properties",
            "sublist_key": null
          }
        },
        "position": {
          "x": 4320,
          "y": 260
        }
      },
      {
        "id": "node12",
        "name": "ChunkedPromptedGenerator",
        "type": "internal",
        "config": {
          "run": {
            "input_key": "content",
            "output_key": "electrical_or_magnetic_properties"
          },
          "init": {
            "use_llm": true,
            "max_chunk_len": 128000,
            "input_aux_keys": "computation_indexes",
            "allowed_prompts": [
              "ElectricalMagneticPropertyExtractPrompt"
            ],
            "user_model_name": [
              "gemini-2.5-flash"
            ],
            "json_schema_kwargs": null
          }
        },
        "position": {
          "x": 4760,
          "y": 280
        }
      },
      {
        "id": "node13",
        "name": "DataFrameTransformOperator",
        "type": "internal",
        "config": {
          "run": {
            "output_col": "electrical_or_magnetic_properties"
          },
          "init": {
            "op": "parse_json_list",
            "keys": null,
            "field": null,
            "json_key": null,
            "input_col": "electrical_or_magnetic_properties",
            "sublist_key": null
          }
        },
        "position": {
          "x": 5160,
          "y": 320
        }
      },
      {
        "id": "node14",
        "name": "JsonToTwoDimensionalTableFormat",
        "type": "internal",
        "config": {
          "run": {
            "input_key": "electrical_or_magnetic_properties",
            "output_key": "format_electrical_or_magnetic_properties"
          },
          "init": {}
        },
        "position": {
          "x": 5600,
          "y": 640
        }
      }
    ]
  },
  "pipeline_config_v": {
    "edges": [],
    "nodes": []
  },
  "pipeline_config_a": {
    "edges": [],
    "nodes": []
  },
  "user_id": "31a21b55-e40a-4bd2-aa4f-ff0e65961852",
  "del_flag": false,
  "created_at": "2026-03-17T11:04:55.212882+08:00",
  "updated_at": "2026-03-17T11:04:55.212892+08:00"
}
]
// Computed
const filteredTemplates = computed(() => {
  if (!searchQuery.value.trim()) {
    return templates.value
  }
  const query = searchQuery.value.toLowerCase().trim()
  return templates.value.filter(template => {
    const name = (template.name || '').toLowerCase()
    const description = (template.description || '').toLowerCase()
    const type = (template.template_type || '').toLowerCase()

    return name.includes(query) ||
           description.includes(query) ||
           type.includes(query)
  })
})

// Methods
const loadTemplates = async () => {
  loading.value = true
  try {
    const response = await getBestTemplateList()
    console.log('Template API response:', response)
    console.log('Response type:', typeof response)
    console.log('Response keys:', Object.keys(response || {}))

    // Handle different response structures - fix for API returning nested data
    let templateData = []

    // Check for nested data.list structure (from your log: data.list: Array(6))
    if (response?.data?.list && Array.isArray(response.data.list)) {
      console.log('Using response.data.list, length:', response.data.list.length)
      templateData = response.data.list
    }
    // Check for direct list property
    else if (response?.list && Array.isArray(response.list)) {
      console.log('Using response.list, length:', response.list.length)
      templateData = response.list
    }
    // Check for direct data array
    else if (response?.data && Array.isArray(response.data)) {
      console.log('Using response.data, length:', response.data.length)
      templateData = response.data
    }
    // Check if response itself is array
    else if (Array.isArray(response)) {
      console.log('Using response as array, length:', response.length)
      templateData = response
    }
    // Fallback to single object
    else if (response && typeof response === 'object') {
      console.log('Using response as single object')
      templateData = [response]
    }

    templates.value = templateData
    console.log('Final processed templates:', templates.value)
    console.log('Final templates count:', templates.value.length)
    console.log('First template sample:', templates.value[0])
  } catch (error) {
    console.error('Error loading templates:', error)
    ElMessage.error('加载模版失败')
    templates.value = []
  } finally {
    loading.value = false
  }
}

const applyTemplate = (template) => {
  try {
    if (!template.pipeline_config?.nodes) {
      ElMessage.warning('模版数据格式不正确')
      return
    }

    // Emit template to parent, parent will handle confirmation
    emit('apply-template', template)
  } catch (error) {
    console.error('Error applying template:', error)
    ElMessage.error('应用模版失败')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const openDocumentation = (link) => {
  if (link) {
    window.open(link, '_blank', 'noopener,noreferrer')
  }
}

const handleDelete = async (template) => {
  try {
    // 第一次确认
    await ElMessageBox.confirm(
      `确定要删除模板 "${template.name}" 吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '继续',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'delete-confirm-dialog'
      }
    )

    // Call delete API
    await deleteTemplate(template.id)

    // Remove from local list
    templates.value = templates.value.filter(t => t.id !== template.id)

    ElMessage.success('模板删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Error deleting template:', error)
      ElMessage.error('删除模板失败')
    }
  }
}

// Drag and drop handlers
const handleDragStart = (event, template) => {
  event.dataTransfer.setData('application/json', JSON.stringify({
    type: 'template',
    template: template
  }))
  event.dataTransfer.effectAllowed = 'copy'
}

const handleDragEnd = (event) => {
  // Clean up after drag operation
  event.dataTransfer.clearData()
}

// Watch for panel open state - reload templates every time panel opens
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    loadTemplates()
  }
})

// Load templates on mount if panel is open
onMounted(() => {
  if (props.isOpen) {
    loadTemplates()
  }
})
</script>

<style scoped>
.template-panel {
  position: absolute;
  top: 0px;
  left: -320px;
  width: 280px;
  height: 100%;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 2010;
  transition: left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.template-panel.panel-open {
  left: 0;
}

/* Panel Header */
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: rgba(248, 249, 250, 0.8);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 17px;
  font-weight: 600;
  color: #1d1d1f;
  letter-spacing: -0.022em;
}

.panel-icon {
  color: #007aff;
  flex-shrink: 0;
}

/* Search Container */
.search-container {
  padding: 12px 16px;
  background: rgba(248, 249, 250, 0.6);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 8px 12px;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: #007aff;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.search-icon {
  color: #8e8e93;
  flex-shrink: 0;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  color: #1d1d1f;
  background: transparent;
}

.search-input::placeholder {
  color: #8e8e93;
}

.clear-search {
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(120, 120, 128, 0.12);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #8e8e93;
  padding: 0;
  flex-shrink: 0;
}

.clear-search:hover {
  background: rgba(120, 120, 128, 0.2);
  color: #1d1d1f;
}

.clear-search:active {
  transform: scale(0.9);
}

.close-button {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(120, 120, 128, 0.12);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #8e8e93;
}

.close-button:hover {
  background: rgba(120, 120, 128, 0.2);
  color: #1d1d1f;
  transform: scale(1.05);
}

.close-button:active {
  transform: scale(0.95);
}

/* Panel Content */
.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.loading-spinner {
  margin-bottom: 16px;
}

.spinner-icon {
  color: #007aff;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 15px;
  color: #8e8e93;
  font-weight: 400;
}

/* Template List */
.template-list {
  padding: 16px;
}

.template-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.04);
}

.template-card:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(0, 122, 255, 0.2);
  transform: translateY(-3px);
  box-shadow: 0 8px 32px rgba(0, 122, 255, 0.12);
}

.template-card:active {
  transform: translateY(-1px);
  transition: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.template-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  position: relative;
}

.delete-button {
  position: absolute;
  top: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 59, 48, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #ff3b30;
  opacity: 0;
  pointer-events: none;
}

.template-card:hover .delete-button {
  opacity: 1;
  pointer-events: auto;
}

.delete-button:hover {
  background: rgba(255, 59, 48, 0.15);
  transform: scale(1.05);
}

.delete-button:active {
  transform: scale(0.95);
}

.template-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, #007aff, #5ac8fa);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.25);
}

.template-info {
  flex: 1;
  min-width: 0;
}

.template-name {
  font-size: 14px;
  font-weight: 600;
  color: #1d1d1f;
  line-height: 1.3;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.022em;
}

.template-type {
  font-size: 11px;
  color: #8e8e93;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.template-section {
  margin-bottom: 16px;
}

.template-section:last-child {
  margin-bottom: 0;
}

.section-label {
  font-size: 13px;
  font-weight: 700;
  color: #1d1d1f;
  margin-bottom: 6px;
  letter-spacing: -0.022em;
}

.template-description {
  font-size: 12px;
  color: #6d6d70;
  line-height: 1.4;
  font-weight: 400;
  letter-spacing: -0.022em;
  /* 强制显示完整文本，覆盖任何可能的截断样式 */
  overflow: visible !important;
  text-overflow: initial !important;
  white-space: normal !important;
  display: block !important;
  -webkit-line-clamp: unset !important;
  -webkit-box-orient: unset !important;
  max-height: none !important;
  height: auto !important;
}

.template-features {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.feature-item {
  font-size: 12px;
  color: #6d6d70;
  line-height: 1.4;
  font-weight: 400;
  padding-left: 12px;
  position: relative;
  letter-spacing: -0.022em;
}

.feature-item::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #007aff;
  font-weight: 600;
}


/* 阅读文档按钮 */
.template-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: center;
  align-items: center;
}

.read-docs-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(0, 122, 255, 0.08);
  color: #007aff;
  border: 1px solid rgba(0, 122, 255, 0.2);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  letter-spacing: -0.022em;
}

.read-docs-button:hover {
  background: rgba(0, 122, 255, 0.12);
  border-color: rgba(0, 122, 255, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.15);
}

.read-docs-button:active {
  transform: translateY(0);
  background: rgba(0, 122, 255, 0.15);
  transition: all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.docs-icon {
  flex-shrink: 0;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  margin-bottom: 20px;
  color: #d1d1d6;
}

.empty-state-title {
  font-size: 17px;
  font-weight: 600;
  color: #8e8e93;
  margin-bottom: 8px;
  letter-spacing: -0.022em;
}

.empty-state-subtitle {
  font-size: 15px;
  color: #aeaeb2;
  margin-bottom: 24px;
  line-height: 1.4;
}

.refresh-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #007aff;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: -0.022em;
}

.refresh-button:hover {
  background: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.4);
}

.refresh-button:active {
  transform: translateY(0);
}

.refresh-icon {
  flex-shrink: 0;
}

/* Scrollbar */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-track {
  background: transparent;
}

/* Responsive */
@media (max-width: 768px) {
  .template-panel {
    width: 260px;
    left: -280px;
  }

  .template-card {
    padding: 12px;
  }

  .template-name {
    font-size: 15px;
  }
}
</style>
