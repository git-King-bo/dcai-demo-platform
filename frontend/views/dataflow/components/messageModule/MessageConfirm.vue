<template>

    <transition :name="currentEffect">

	<div class="perform-task"  v-if="openMessage">

		<div class="marquee-card">

		<div class="finish-header">
		<div class="header-icon">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
			<polyline points="22 4 12 14.01 9 11.01"></polyline>
			</svg>
		</div>
		<span class="header-text">Pipeline构建完成，请确认是否执行任务</span>
		</div>
		<div class="flex items-center">
			<span style="color:red;padding-right:10px">*</span>
			<span style="flex-shrink:0;">数据集：</span>
			<VirtualDropdown></VirtualDropdown>
			<!-- <el-select
				class="select-input "
				v-model="datasetVal"
				filterable
				@change="handleSelect"
				placeholder="请选择数据集，KPS为您自动构建数据处理管线"
			>
				<el-option
				v-for="item in datasetList"
				:key="item.id"
				:label="item.name"
				:value="item.id"
				>
				</el-option>
			</el-select> -->
		</div>
		<span v-if="!datasetVal" class="check-tip">请选择数据集，便于自动执行任务～</span>
		<div class="form-actions">
        <button
          class="action-button cancel"
          @click="handleCancel"
        >
          取消
        </button>
        <button
          class="action-button submit"
          @click="handleConfirm"
        >
          确定
        </button>
      </div>
	</div>
	</div>
     </transition>

</template>

<script setup>
import { computed, inject,ref } from 'vue';
import { useAgentStore } from '@/store/modules/agent'
import VirtualDropdown from '@/components/dataflow/VirtualDropdown.vue'

const props = defineProps({
	content: {
		type: Object,
		default: () => ({})
	}
});
let agentStore = null
function getAgentStore() {
  if (!agentStore) {
    agentStore = useAgentStore()
  }
  return agentStore
}
 const currentEffect = ref('bounce');

const saveTask = inject('saveTask');
const providedDatasets = inject('datasets', ref([]));
// const availableDatasets=ref([])
const availableDatasets=computed(()=>{
	return providedDatasets.value
})
const datasetVal = computed(() => getAgentStore().agentDatasetVal)
const datasetList = computed(()=>{
  return getAgentStore().datasetArr
})
const checkSelect=ref(false)

const handleSelect = (val) => {
  checkSelect.value =false
  // 将选择的val保存到pinia中全局使用，使用getAgentStore().setDatasetVal(val)
  getAgentStore().setAgentDatasetVal(val)
  console.log('val = ',val ,typeof val)
}

const openMessage = ref(true);

const handleCancel = () => {

	openMessage.value = false;

};
const handleConfirm = () => {
	if (!datasetVal.value) {
		checkSelect.value = true
		// openMessage.value = false
		return;
	}
    getAgentStore().closePanel()
	saveTask(true);
};
// watch(providedDatasets, () => {
//   if (providedDatasets.value && providedDatasets.value.length > 0) {
//     availableDatasets.value = providedDatasets.value
//     console.log('父组件数据集列表更新:', availableDatasets.value.length, '个数据集')
//   }
// }, { deep: true })
</script>

<style scoped lang="scss">
.message-confirm {
	display: flex;
	align-items: center;
	justify-content: center;
	padding-bottom: 10px;
	.content {
		padding: 20px;
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border-radius: 50px;
		// background: #e0e0e0;
		background: #e0e0e02b;
		box-shadow: 15px 15px 30px #e6dfdf, -15px -15px 30px #ffffff;
		border: 1px solid #ebe4e4;
		// box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff;
	}
	.shrink-out {
		animation: shrinkOut 220ms ease forwards;
		will-change: transform, opacity;
	}
	.desc {
		font-weight: 600;
	}
	.footer {
		display: flex;
		gap: 12px;
		margin-top: 16px;
	}
}
@keyframes shrinkOut {
	0% {
		transform: scale(1);
		opacity: 1;
	}
	60% {
		transform: scale(0.9);
		opacity: 0.6;
	}
	100% {
		transform: scale(0.8);
		opacity: 0;
	}
}
.form-actions {
	display: flex;
	gap: 12px;
	margin-top: 16px;
}

.action-button {
	flex: 1;
	height: 44px;
	border: none;
	border-radius: 12px;
	font-size: 15px;
	font-weight: 600;
	letter-spacing: -0.3px;
	cursor: pointer;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	outline: none;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
}

.action-button.cancel {
	background: rgba(0, 0, 0, 0.05);
	color: #1d1d1f;
}

.action-button.cancel:hover {
	background: rgba(0, 0, 0, 0.08);
	transform: translateY(-1px);
}

.action-button.cancel:active {
	transform: translateY(0) scale(0.98);
}

.action-button.submit {
	background: linear-gradient(135deg, #007aff 0%, #5ac8fa 100%);
	color: white;
	box-shadow: 0 4px 12px rgba(0, 122, 255, 0.25);
}

.action-button.submit:hover:not(:disabled) {
	transform: translateY(-1px);
	box-shadow: 0 6px 20px rgba(0, 122, 255, 0.35);
}

.action-button.submit:active:not(:disabled) {
	transform: translateY(0) scale(0.98);
}

.action-button.submit:disabled {
	opacity: 0.4;
	cursor: not-allowed;
	box-shadow: none;
}
/* From Uiverse.io by ilkhoeri */
.button {
	--h-button: 48px;
	--w-button: 102px;
	--round: 0.75rem;
	cursor: pointer;
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
	transition: all 0.25s ease;
	background: radial-gradient(65.28% 65.28% at 50% 100%, rgba(223, 113, 255, 0.8) 0%, rgba(223, 113, 255, 0) 100%), linear-gradient(0deg, #7a5af8, #7a5af8);
	border-radius: var(--round);
	border: none;
	outline: none;
	padding: 12px 18px;
	cursor: pointer;
}
.button::before,
.button::after {
	content: '';
	position: absolute;
	inset: var(--space);
	transition: all 0.5s ease-in-out;
	border-radius: calc(var(--round) - var(--space));
	z-index: 0;
}
.button::before {
	--space: 1px;
	background: linear-gradient(177.95deg, rgba(255, 255, 255, 0.19) 0%, rgba(255, 255, 255, 0) 100%);
}
.button::after {
	--space: 2px;
	background: radial-gradient(65.28% 65.28% at 50% 100%, rgba(223, 113, 255, 0.8) 0%, rgba(223, 113, 255, 0) 100%), linear-gradient(0deg, #7a5af8, #7a5af8);
}
.cancelBtn {
}
.cancelBtn::after {
	background: radial-gradient(65.28% 65.28% at 50% 100%, rgb(89 79 92 / 80%) 0%, rgba(223, 113, 255, 0) 100%), linear-gradient(0deg, #363341, #0b0a0f);
}
.button:active {
	transform: scale(0.95);
}

.fold {
	z-index: 1;
	position: absolute;
	top: 0;
	right: 0;
	height: 1rem;
	width: 1rem;
	display: inline-block;
	transition: all 0.5s ease-in-out;
	background: radial-gradient(100% 75% at 55%, rgba(223, 113, 255, 0.8) 0%, rgba(223, 113, 255, 0) 100%);
	box-shadow: 0 0 3px black;
	/* border-bottom-left-radius: 0.5rem; */
	border-top-right-radius: var(--round);
}

.fold::after {
	content: '';
	position: absolute;
	top: 0;
	right: 0;
	width: 150%;
	height: 150%;
	transform: rotate(45deg) translateX(0%) translateY(-18px);
	background-color: #e8e8e8;
	pointer-events: none;
}
.left-fold {
	left: 0;
	border-top-left-radius: 0.5rem;
	border-top-left-radius: var(--round);
	background: radial-gradient(100% 75% at 55%, rgba(223, 113, 255, 0.8) 0%, rgba(223, 113, 255, 0) 100%);
	margin-top: -1rem;
	margin-left: -1rem;
}
.left-fold::after {
	left: 0;
	transform: rotate(10deg) translateX(0%) translateY(-28px);
}
.button:hover .fold {
	margin-top: -1rem;
	margin-right: -1rem;
}
.cancelBtn:hover .left-fold {
}
.points_wrapper {
	overflow: hidden;
	width: 100%;
	height: 100%;
	pointer-events: none;
	position: absolute;
	z-index: 1;
}

.points_wrapper .point {
	bottom: -10px;
	position: absolute;
	animation: floating-points infinite ease-in-out;
	pointer-events: none;
	width: 2px;
	height: 2px;
	background-color: #fff;
	border-radius: 9999px;
}
@keyframes floating-points {
	0% {
		transform: translateY(0);
	}
	85% {
		opacity: 0;
	}
	100% {
		transform: translateY(-55px);
		opacity: 0;
	}
}
.points_wrapper .point:nth-child(1) {
	left: 10%;
	opacity: 1;
	animation-duration: 2.35s;
	animation-delay: 0.2s;
}
.points_wrapper .point:nth-child(2) {
	left: 30%;
	opacity: 0.7;
	animation-duration: 2.5s;
	animation-delay: 0.5s;
}
.points_wrapper .point:nth-child(3) {
	left: 25%;
	opacity: 0.8;
	animation-duration: 2.2s;
	animation-delay: 0.1s;
}
.points_wrapper .point:nth-child(4) {
	left: 44%;
	opacity: 0.6;
	animation-duration: 2.05s;
}
.points_wrapper .point:nth-child(5) {
	left: 50%;
	opacity: 1;
	animation-duration: 1.9s;
}
.points_wrapper .point:nth-child(6) {
	left: 75%;
	opacity: 0.5;
	animation-duration: 1.5s;
	animation-delay: 1.5s;
}
.points_wrapper .point:nth-child(7) {
	left: 88%;
	opacity: 0.9;
	animation-duration: 2.2s;
	animation-delay: 0.2s;
}
.points_wrapper .point:nth-child(8) {
	left: 58%;
	opacity: 0.8;
	animation-duration: 2.25s;
	animation-delay: 0.2s;
}
.points_wrapper .point:nth-child(9) {
	left: 98%;
	opacity: 0.6;
	animation-duration: 2.6s;
	animation-delay: 0.1s;
}
.points_wrapper .point:nth-child(10) {
	left: 65%;
	opacity: 1;
	animation-duration: 2.5s;
	animation-delay: 0.2s;
}

.inner {
	z-index: 2;
	gap: 6px;
	position: relative;
	width: 100%;
	color: white;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-size: 16px;
	font-weight: 500;
	line-height: 1.5;
	transition: color 0.2s ease-in-out;
}

.inner svg.icon {
	width: 18px;
	height: 18px;
	transition: fill 0.1s linear;
}

.button:focus svg.icon {
	fill: white;
}
.button:hover svg.icon {
	fill: transparent;
	animation: dasharray 1s linear forwards, filled 0.1s linear forwards 0.95s;
}
@keyframes dasharray {
	from {
		stroke-dasharray: 0 0 0 0;
	}
	to {
		stroke-dasharray: 68 68 0 0;
	}
}
@keyframes filled {
	to {
		fill: white;
	}
}

.perform-task{
	// background: linear-gradient(135deg, rgba(52, 199, 89, 0.05) 0%, rgba(48, 209, 88, 0.05) 100%);
	border: 0.5px solid rgba(52, 199, 89, 0.2);
	border-radius: 16px;
	// padding: 14px 16px;
	margin: 8px 0;
	box-shadow:
		0 2px 8px rgba(52, 199, 89, 0.08),
		inset 0 1px 0 rgba(255, 255, 255, 0.8);
	animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.marquee-card {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 1;
//   animation: borderAnimation 4s linear infinite;
}

// .marquee-card::before {
//   content: '';
//   position: absolute;
//   top: -2px;
//   left: -2px;
//   right: -2px;
//   bottom: -2px;
//   background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #ff6b6b);
//   background-size: 400% 400%;
//   border-radius: 14px;
//   z-index: -1;
//   animation: gradientMove 3s linear infinite;
// }

.marquee-card::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  background: white;
  border-radius: 12px;
  z-index: -1;
}
@keyframes borderAnimation {
  0% {
    box-shadow:
      0 0 0 0 rgba(245, 137, 137, 0.2),
      0 0 0 0 rgba(78, 205, 196, 0.7);
  }
  25% {
    box-shadow:
      0 0 0 6px rgba(246, 140, 140, 0.3),
      0 0 0 0 rgba(78, 205, 196, 0.7);
  }
  50% {
    box-shadow:
      0 0 0 10px rgba(255, 107, 107, 0),
      0 0 0 10px rgba(78, 205, 196, 0.3);
  }
  75% {
    box-shadow:
      0 0 0 0 rgba(245, 165, 165, 0.4),
      0 0 0 10px rgba(78, 205, 196, 0);
  }
  100% {
    box-shadow:
      0 0 0 0 rgba(246, 161, 161, 0.4),
      0 0 0 0 rgba(78, 205, 196, 0.7);
  }
}
@keyframes gradientMove {
  0% {
	transform: rotate(0deg);
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
	transform: rotate(360deg);
    background-position: 0% 50%;
  }
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
.finish-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.header-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #34C759 0%, #30D158 100%);
  border-radius: 50%;
  color: white;
  animation: successScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.header-text {
  font-size: 14px;
  font-weight: 600;
  color: #1D1D1F;
  letter-spacing: -0.2px;
}
.check-tip{
	padding-left: 20px;
	color: rgba(255, 0, 0, 0.683);
}
@keyframes successScale {
  from {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.action-button {
  flex: 1;
  height: 44px;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.3px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
}

.action-button.cancel {
  background: rgba(0, 0, 0, 0.05);
  color: #1D1D1F;
}

.action-button.cancel:hover {
  background: rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.action-button.cancel:active {
  transform: translateY(0) scale(0.98);
}

.action-button.submit {
  background: linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.25);
}

.action-button.submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.35);
}

.action-button.submit:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.action-button.submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}
.select-input ::v-deep(.el-select__wrapper){
    padding: 10px 12px;
    background: rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 10px;
    font-size: 13px;
    font-weight: 400;
    color: #1D1D1F;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: none;
  }
  .select-input .el-select__wrapper::focus {
    background: white;
    border-color: #007AFF;
    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.08);
  }
   /* 弹跳动画 */
    .bounce-enter-active {
      animation: bounce-in 0.5s;
    }

    .bounce-leave-active {
      animation: bounce-in 0.5s reverse;
    }

    @keyframes bounce-in {
      0% {
        transform: scale(0);
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
      }
    }
</style>
