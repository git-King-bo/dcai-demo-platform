<template>
	<div class="run-started-card">
		<el-collapse accordion v-model="activeName">
			<el-collapse-item name="1">
				<template #title>
					<div class="status-indicator">
						<div class="status-icon">
							<svg fill="#e4c111" viewBox="-3.94 0 122.88 122.88" version="1.1" id="Layer_1" style="enable-background: new 0 0 115 122.88" xml:space="preserve" stroke="#e4c111">
								<path
									d="M36.37,82.46c-2.88-3.29-5.86-6.71-8.22-11.74c-2.31-4.96-3.59-10.08-3.55-15.4c0.05-5.32,1.4-10.8,4.34-16.46 c0.02-0.04,0.04-0.07,0.06-0.11l0,0c3.85-6.52,9.24-10.88,15.24-13.32c5.03-2.06,10.5-2.76,15.86-2.27 c5.34,0.49,10.57,2.17,15.14,4.87c5.81,3.44,10.59,8.54,13.22,14.98c1.42,3.49,2.38,7.38,2.5,11.64c0.12,4.25-0.61,8.83-2.57,13.67 c-3,7.43-10.01,15.39-14.6,22.7c-0.25-0.05-0.51-0.06-0.77-0.02l-6.19,0.92l9.43-32.8c0.27-0.93-0.28-1.9-1.21-2.17 c-0.93-0.26-1.9,0.28-2.17,1.21L63.01,92.5l-9.36,1.39l-9.89-31.44c0.71,0.14,1.46-0.17,1.85-0.83l7.01-11.93l3.57,8.19 c0.39,0.89,1.42,1.29,2.3,0.91c0.44-0.19,0.76-0.55,0.93-0.96l0,0l3.16-7.98l3.7,9.76c0.34,0.91,1.35,1.36,2.26,1.02 c0.91-0.34,1.36-1.35,1.02-2.26l-5.27-13.9c-0.15-0.49-0.52-0.91-1.03-1.11c-0.9-0.36-1.92,0.09-2.28,0.99l-3.27,8.27l-3.26-7.48 c-0.14-0.33-0.39-0.62-0.72-0.81c-0.83-0.49-1.91-0.21-2.39,0.62l-8.52,14.5l-0.61-1.93c-0.29-0.92-1.27-1.44-2.19-1.15 c-0.92,0.29-1.44,1.27-1.15,2.19l11.27,35.85l-6.78,1.01C41.72,90.57,39.22,85.73,36.37,82.46L36.37,82.46z M14.26,18.49 c-0.79-0.74-1.21-1.73-1.25-2.73c-0.04-1,0.31-2.02,1.04-2.81c0.74-0.79,1.73-1.21,2.73-1.25c1-0.04,2.02,0.31,2.81,1.04l6.28,5.85 c0.79,0.74,1.21,1.73,1.25,2.73c0.04,1.01-0.31,2.02-1.04,2.81c-0.74,0.79-1.73,1.21-2.73,1.25c-1.01,0.04-2.02-0.31-2.81-1.04 L14.26,18.49L14.26,18.49z M3.99,61.66c-1.06,0.02-2.03-0.39-2.75-1.06C0.51,59.91,0.04,58.95,0,57.86 c-0.04-1.08,0.37-2.08,1.06-2.81c0.69-0.73,1.65-1.2,2.74-1.23l8.57-0.29c1.08-0.04,2.08,0.37,2.81,1.06 c0.73,0.69,1.2,1.65,1.23,2.74l0,0.06h0.01l-0.01,0.14c-0.02,1.01-0.42,1.92-1.06,2.61c-0.69,0.73-1.65,1.19-2.74,1.23l-0.06,0 v0.01l-0.09,0L3.99,61.66L3.99,61.66z M110.71,49.51l0.13-0.01c1.02-0.06,1.97,0.27,2.71,0.87c0.78,0.63,1.31,1.57,1.43,2.64 l0,0.04c0.01,0,0.01,0.11,0.01,0.13c0.06,1.02-0.27,1.97-0.87,2.71c-0.63,0.78-1.57,1.31-2.64,1.43l-8.53,0.9 c-1.08,0.11-2.1-0.23-2.87-0.86c-0.78-0.63-1.32-1.57-1.43-2.64c-0.11-1.07,0.23-2.1,0.86-2.87c0.63-0.78,1.57-1.32,2.64-1.43 C105,50.11,107.86,49.78,110.71,49.51L110.71,49.51L110.71,49.51z M93.81,15.37c0.61-0.9,1.51-1.46,2.49-1.66 c0.98-0.19,2.03-0.01,2.94,0.59l0.01,0.01c0.9,0.6,1.47,1.51,1.66,2.49c0.19,0.98,0.01,2.03-0.59,2.94l-4.77,7.13 c-0.6,0.9-1.51,1.47-2.5,1.67c-0.98,0.19-2.03,0.01-2.94-0.59c-0.9-0.6-1.47-1.52-1.67-2.5c-0.19-0.98-0.01-2.03,0.59-2.94 L93.81,15.37L93.81,15.37z M56.77,3.83c0.03-1.09,0.49-2.06,1.22-2.75c0.71-0.68,1.69-1.09,2.75-1.08l0-0.01 c0.09,0,0.18,0.01,0.27,0.02c0.99,0.08,1.88,0.53,2.52,1.2c0.68,0.71,1.09,1.68,1.08,2.75l0.01,0c0,0.07,0,0.14-0.01,0.2 l-0.21,8.37h0.01c0,0.09-0.01,0.18-0.02,0.27c-0.08,1-0.53,1.88-1.2,2.52c-0.72,0.68-1.69,1.09-2.75,1.08v0.01 c-0.09,0-0.18-0.01-0.27-0.02c-1-0.08-1.88-0.53-2.52-1.2c-0.68-0.72-1.09-1.69-1.08-2.75h-0.01c0-0.07,0-0.14,0.01-0.2L56.77,3.83 L56.77,3.83z M71.42,95.84l-0.63,2.95l-0.16,2.1l-25.33,3.77c-0.09-1.51-0.33-3.14-0.71-4.83L71.42,95.84L71.42,95.84z M70.58,105.49l0.02,1.27l0.03,0.44c0.07,0.83,0.08,1.67,0.03,2.5l-0.38,1.83l-23.53,3.5l-0.41-0.94l-0.92-3.76l-0.02-1.09 L70.58,105.49L70.58,105.49z M68.73,116.35c-1.22,2.09-2.9,3.72-4.82,4.83c-1.71,1-3.62,1.57-5.53,1.69 c-1.94,0.12-3.9-0.25-5.69-1.11c-1.22-0.6-2.36-1.43-3.37-2.51L68.73,116.35L68.73,116.35z"
								></path>
							</svg>
						</div>

						<span class="status-text">正在分析需求</span>
					</div>
				</template>
				<div v-if="content?.code_debug_result">
					<div class="input-label">日志分析:</div>
					<!-- <div class="input-text">{{ content.code_debug_result.reason }}</div> -->
					<div class="json-display" v-html="jsonToHtml(content.code_debug_result.reason)"></div>
				</div>
				<div v-if="executionResult?.stderr" class="user-input">
					<div class="input-label">错误日志:</div>
					<!-- <div class="input-text">{{ executionResult.stderr }}</div> -->
					<div class="json-display" v-html="jsonToHtml(executionResult.stderr)"></div>
				</div>
				<div v-if="executionResult?.stdout" class="user-input">
					<div class="input-label">执行日志:</div>
					<!-- <div class="input-text">{{ executionResult.stdout }}</div> -->
					<div class="json-display" v-html="jsonToHtml(executionResult.stdout)"></div>
				</div>
				<div v-if="content?.explanation" class="user-input">
					<div class="input-label">pipeline解释:</div>
					<!-- <div class="input-text">{{ content.explantation }}</div> -->
					<div class="json-display" v-html="jsonToHtml(content.explanation)"></div>
				</div>
				<div v-if="content?.cot" class="user-input">
					<div class="input-label">思维链:</div>
					<!-- <div class="input-text" >{{ content.cot }}</div> -->
					<div class="json-display" v-html="jsonToHtml(content.cot)"></div>
				</div>
				<div v-if="content?.op_explanations" class="user-input">
					<div class="input-label">算子解释:</div>
					<template v-if="typeof content.op_explanations === 'object'">
					<div v-for="(item, index) in op_dict" :key="index">
							<div class="json-display" v-html="jsonToHtml(content.op_explanations[item])"></div>
					</div>
					</template>
					<template v-else>
						<div class="json-display" v-html="jsonToHtml(content.op_explanations)"></div>
					</template>
				</div>
				<div v-else-if="content?.mock_data || content?.classifier_node || content?.recommender_node">
					<div
						class="json-display"
						v-html="jsonToHtml(content?.mock_data || content?.classifier_node || content?.recommender_node)"
					/>
				</div>
			</el-collapse-item>
		</el-collapse>
		<div v-if="timestamp" class="timestamp">
			{{ formatTime(timestamp) }}
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue';
const props = defineProps({
	content: {
		type: Object,
		default: () => ({})
	},
	timestamp: {
		type: String,
		default: ''
	}
});
console.log('props=>>>>>>>>>>>>>>>>>>>%', props.content);
const activeName = ref('1');
const op_dict = computed(() => {
	return Object.keys(props.content.op_explanations || {});
}); //算子解释字典映射
// 1. 内容空值过滤器 - 过滤空值和无效文本
const contentNullFilter = (text) => {
	if (!text) return '';
	
	const str = String(text).trim();
	
	// 过滤无效内容
	if (!str || 
		str === 'null' || 
		str === 'undefined' || 
		str === 'None' || 
		str.length === 0) {
		return '';
	}
	
	return str;
};

// 2. 语言过滤器 - 只保留简/繁中文、英文、数字、标点符号和序号
const languageFilter = (text) => {
	if (!text) return '';
	
	// 保留：中文(简繁)、英文、数字、常用标点、空格、换行符、序号格式
	// 中文范围：\u4e00-\u9fff (基本汉字), \u3400-\u4dbf (扩展A), \uf900-\ufaff (兼容汉字)
	const allowedPattern = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaffa-zA-Z0-9\s\n\r.,!?;:'"()（）【】、。，！？；：""''—…\-\[\]\/\\]+/g;
	
	const matches = text.match(allowedPattern);
	return matches ? matches.join('') : '';
};

// 3. 特殊字符过滤器 - 去除特殊控制字符和不可见字符（保留序号和标点）
const specialCharacterFilter = (text) => {
	if (!text) return '';
	
	return text
		// 移除控制字符（除了换行、回车、制表符）
		.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
		// 移除零宽字符
		.replace(/[\u200B-\u200D\uFEFF]/g, '')
		// 移除其他不可见字符
		.replace(/[\u2060\u180E]/g, '')
		// 多个连续空格替换为单个空格（保留序号格式）
		.replace(/ {2,}/g, ' ')
		.trim();
};

// 应用所有过滤器
const applyTextFilters = (text) => {
	let filtered = contentNullFilter(text);
	if (!filtered) return '';
	
	filtered = languageFilter(filtered);
	if (!filtered) return '';
	
	filtered = specialCharacterFilter(filtered);
	return filtered;
};

const jsonToHtml = (qa) => {
	// 1. 首先进行空值过滤
	const initialFiltered = contentNullFilter(qa);
	if (!initialFiltered) return '';

	try {
		let jsonObj = qa;

		// 如果是字符串，尝试解析
		if (typeof qa === 'string') {
			// 处理 Python 风格的单引号：将单引号转换为双引号
			let normalizedStr = qa.replace(/'/g, '"');
			try {
				jsonObj = JSON.parse(normalizedStr);
			} catch (e) {
				// 解析失败，作为普通文本处理，应用过滤器
				const filtered = applyTextFilters(qa);
				if (!filtered) return '';
				
				const escaped = escapeHtml(filtered);
				const withBreaks = escaped.replace(/\n/g, '<br>').replace(/\\n/g, '<br>');
				return `<div class="json-text">${withBreaks}</div>`;
			}
		}

		// 如果是对象，格式化显示
		if (typeof jsonObj === 'object' && jsonObj !== null) {
			let html = '';
			for (const [key, value] of Object.entries(jsonObj)) {
				// 对值应用过滤器
				const filteredValue = applyTextFilters(String(value));
				if (!filteredValue) continue; // 跳过被过滤掉的空值
				
				html += `<div class="json-item">`;
				html += `<span class="json-key">${escapeHtml(key)}</span>: `;
				
				// 处理值中的换行
				const escapedValue = escapeHtml(filteredValue);
				const formattedValue = escapedValue.replace(/\n/g, '<br>').replace(/\\n/g, '<br>');
				html += `<span class="json-value">${formattedValue}</span>`;
				html += `</div>`;
			}
			
			// 如果所有内容都被过滤掉了，返回空字符串
			if (!html) return '';
			return `<div class="json-formatted">${html}</div>`;
		}

		// 其他情况，应用过滤器后显示
		const filtered = applyTextFilters(String(qa));
		if (!filtered) return '';
		
		const escaped = escapeHtml(filtered);
		const withBreaks = escaped.replace(/\n/g, '<br>').replace(/\\n/g, '<br>');
		return `<div class="json-text">${withBreaks}</div>`;
	} catch (error) {
		console.error('格式化错误:', error);
		
		// 错误情况下也应用过滤器
		const filtered = applyTextFilters(String(qa));
		if (!filtered) return '';
		
		const escaped = escapeHtml(filtered);
		const withBreaks = escaped.replace(/\n/g, '<br>').replace(/\\n/g, '<br>');
		return `<div class="json-text">${withBreaks}</div>`;
	}
};

// 转义 HTML 特殊字符
const escapeHtml = (str) => {
	const div = document.createElement('div');
	div.textContent = str;
	return div.innerHTML;
};
const executionResult = computed(() => {
	return props.content.execution_result;
});
const formatTime = (timestamp) => {
	if (!timestamp) return '';
	const date = new Date(timestamp);
	return date.toLocaleTimeString('zh-CN', {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	});
};
</script>

<style scoped>
.run-started-card {
	background: white;
	border: 0.5px solid rgba(0, 0, 0, 0.06);
	border-radius: 16px;
	padding: 14px 16px;
	margin: 8px 0;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8);
	animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
	from {
		opacity: 0;
		transform: translateY(-8px) scale(0.98);
	}
	to {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}

.status-indicator {
	display: flex;
	align-items: center;
	gap: 10px;
	/* margin-bottom: 10px; */
}

.status-icon {
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: white;
}
.status-icon-error {
	background: linear-gradient(135deg, #ff3b30 0%, #ff6b6b 100%);
}
@keyframes pulse {
	0%,
	100% {
		opacity: 1;
		transform: scale(1);
	}
	50% {
		opacity: 0.8;
		transform: scale(0.95);
	}
}

.status-text {
	font-size: 14px;
	font-weight: 600;
	color: #1d1d1f;
	letter-spacing: -0.2px;
}

.user-input {
	padding: 10px 12px;
	background: rgba(0, 122, 255, 0.04);
	border-radius: 10px;
	margin-bottom: 8px;
	border-left: 3px solid #007aff;
}

.input-label {
	font-size: 11px;
	font-weight: 600;
	color: #86868b;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	margin-bottom: 4px;
}

.input-text {
	font-size: 13px;
	font-weight: 500;
	color: #1d1d1f;
	line-height: 1.5;
	letter-spacing: -0.1px;
	white-space: pre-wrap;
	word-break: break-word;
}

.timestamp {
	font-size: 11px;
	font-weight: 400;
	color: #86868b;
	text-align: right;
	letter-spacing: -0.1px;
}

/* JSON 显示样式 */
.json-display {
	margin-top: 8px;
}

.json-formatted {
	background: #f8f9fa;
	border: 1px solid #e9ecef;
	border-radius: 8px;
	padding: 12px;
	margin: 0;
	overflow-x: auto;
	font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace;
	font-size: 12px;
	line-height: 1.8;
	color: #1d1d1f;
	max-height: 400px;
	overflow-y: auto;
}

.json-item {
	margin-bottom: 12px;
}

.json-item:last-child {
	margin-bottom: 0;
}

.json-key {
	color: #0066cc;
	font-weight: 600;
	font-size: 13px;
}

.json-value {
	color: #1d1d1f;
	font-size: 12px;
	line-height: 1.8;
	white-space: pre-wrap;
	word-break: break-word;
}

.json-text {
	font-size: 13px;
	font-weight: 500;
	color: #1d1d1f;
	line-height: 1.8;
	letter-spacing: -0.1px;
	white-space: pre-wrap;
	word-break: break-word;
}

/* 滚动条美化 */
.json-formatted::-webkit-scrollbar {
	width: 6px;
	height: 6px;
}

.json-formatted::-webkit-scrollbar-track {
	background: #f1f1f1;
	border-radius: 4px;
}

.json-formatted::-webkit-scrollbar-thumb {
	background: #c1c1c1;
	border-radius: 4px;
}

.json-formatted::-webkit-scrollbar-thumb:hover {
	background: #a8a8a8;
}

::v-deep(.el-collapse-item__header) {
	border-bottom: none;
}
::v-deep(.el-collapse) {
	border-top: none;
}
::v-deep(.el-collapse-item__wrap){
	border-bottom: none;
}
</style>
