/**
 * usePipeline Composable
 * 管理Pipeline的构建、保存和加载
 */
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

export function usePipeline(nodes, edges, isOperatorNode) {
  /**
   * 拓扑排序函数 - 确保节点按执行顺序输出
   */
  const topologicalSort = (nodes, edges) => {
    const operatorNodes = nodes.filter(node => isOperatorNode(node))

    if (operatorNodes.length === 0) {
      return []
    }

    const graph = new Map()
    const inDegree = new Map()

    operatorNodes.forEach(node => {
      graph.set(node.id, [])
      inDegree.set(node.id, 0)
    })

    edges.forEach(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source)
      const targetNode = nodes.find(n => n.id === edge.target)

      if (sourceNode && targetNode &&
          isOperatorNode(sourceNode) &&
          isOperatorNode(targetNode)) {
        if (!graph.get(edge.source).includes(edge.target)) {
          graph.get(edge.source).push(edge.target)
          inDegree.set(edge.target, inDegree.get(edge.target) + 1)
        }
      }
    })

    const queue = []
    const sortedIds = []

    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId)
      }
    })

    while (queue.length > 0) {
      const currentId = queue.shift()
      sortedIds.push(currentId)

      const neighbors = graph.get(currentId) || []
      neighbors.forEach(neighborId => {
        inDegree.set(neighborId, inDegree.get(neighborId) - 1)
        if (inDegree.get(neighborId) === 0) {
          queue.push(neighborId)
        }
      })
    }

    if (sortedIds.length < operatorNodes.length) {
      console.warn('[拓扑排序] 检测到循环依赖，使用原始顺序')
      return operatorNodes
    }

    const sortedNodes = sortedIds.map(id =>
      operatorNodes.find(node => node.id === id)
    ).filter(node => node !== undefined)

    console.log('[拓扑排序] 原始顺序:', operatorNodes.map(n => n.id))
    console.log('[拓扑排序] 排序后:', sortedNodes.map(n => n.id))

    return sortedNodes
  }

  /**
   * 处理数组字段：如果原始配置是数组类型，将用户选择的字符串值包装成数组
   */
  const processArrayFields = (userConfig, originalConfig) => {
    const processedConfig = {}

    Object.keys(userConfig).forEach(key => {
      let value = userConfig[key]

      if (Array.isArray(originalConfig[key])) {
        if (!Array.isArray(value)) {
          if (value !== null && value !== undefined && value !== '') {
            value = [value]
          } else {
            value = []
          }
        }
      }

      processedConfig[key] = value
    })

    return processedConfig
  }

  /**
   * 构建Pipeline数据
   */
  const buildPipelineData = ({ nodes, edges, name, description, taskId = '' }) => {
    const datasetIds = []
    const processNodes = []

    const sortedOperatorNodes = topologicalSort(nodes, edges)

    // 先处理数据集节点
    nodes.forEach(node => {
      if (node.type === 'dataset') {
        if (node.data?.config?.selectedDataset) {
          datasetIds.push(node.data.config.selectedDataset)
        }
      }
    })

    // 按拓扑排序的顺序处理算子节点
    sortedOperatorNodes.forEach(node => {
      const config = {
        run: {},
        init: {}
      }

      let operator = null

      if (node.data?.operator) {
        operator = node.data.operator

        if (operator.config?.run) {
          config.run = { ...operator.config.run }
        }

        if (operator.config?.init) {
          config.init = { ...operator.config.init }
        }
      }

      // 从节点用户配置中覆盖
      if (node.data?.runConfig) {
        if (operator) {
          const processedRunConfig = processArrayFields(node.data.runConfig, operator.config?.run || {})
          config.run = { ...config.run, ...processedRunConfig }
        }
      }

      if (node.data?.initConfig) {
        if (operator) {
          const processedInitConfig = processArrayFields(node.data.initConfig, operator.config?.init || {})
          config.init = { ...config.init, ...processedInitConfig }
        }
      }

      // 兼容旧的 config 结构
      if (node.data?.config) {
        Object.keys(node.data.config).forEach(key => {
          const value = node.data.config[key]
          if (config.run.hasOwnProperty(key)) {
            config.run[key] = value
          } else if (config.init.hasOwnProperty(key)) {
            config.init[key] = value
          }
        })
      }

      processNodes.push({
        id: node.id,
        position: node.position,
        type: node.data?.operator?.type,
        name: node.data?.operator?.name || node.type,
        config: config
      })
    })

    // 过滤边，只保留非数据集节点之间的连接
    const processEdges = edges.filter(edge => {
      const sourceNode = nodes.find(n => n.id === edge.source)
      const targetNode = nodes.find(n => n.id === edge.target)
      return sourceNode && targetNode
    }).map(edge => ({
      source: edge.source,
      source_port: edge.sourceHandle || "output_file",
      target: edge.target,
      target_port: edge.targetHandle || "input_file"
    }))

    // 初始化三个配置对象
    const pipeline_config_a = { nodes: [], edges: [] }
    const pipeline_config_v = { nodes: [], edges: [] }
    const pipeline_config = { nodes: [], edges: [] }

    // 处理edges数组
    processEdges.forEach(edge => {
      const prefix = edge.source.split('_')[0]

      switch(prefix) {
        case 'audio':
          pipeline_config_a.edges.push(edge)
          break
        case 'video':
          pipeline_config_v.edges.push(edge)
          break
        default:
          pipeline_config.edges.push(edge)
      }
    })

    // 处理nodes数组
    processNodes.forEach(node => {
      const prefix = node.id.split('_')[0]

      switch(prefix) {
        case 'audio':
          pipeline_config_a.nodes.push(node)
          break
        case 'video':
          pipeline_config_v.nodes.push(node)
          break
        default:
          pipeline_config.nodes.push(node)
      }
    })

    const result = {
      name: name || "Operator_Workflow",
      description: description || "算子pipeline",
      task_type: "default",
      dataset_ids: datasetIds,
      id: taskId,
      template_id: -1,
      pipeline_config_a,
      pipeline_config_v,
      pipeline_config,
      tags: ['customized']
    }

    return result
  }

  return {
    buildPipelineData,
    topologicalSort,
    processArrayFields,
  }
}
