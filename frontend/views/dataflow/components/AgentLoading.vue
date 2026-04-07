<template>
	<!-- 渐渐消失 -->
	<transition name="fade">
		<div v-if="agentLoading" class="loading">
			<div class="loader"></div>
			<div class="title">
				<span v-for="(char, index) in text" :key="index" :style="{animationDelay: `${index * 0.1}s`, color: `rgba(20, ${130 + index * 10}, 255, 0.8)`}">
					{{ char }}
				</span>
			</div>
		</div>
	</transition>
</template>

<script setup>
import { ref, onMounted } from 'vue';
const agentLoading = defineModel();
const text = ref('Agent...');
const template = () => {};
onMounted(() => {});
</script>

<style scoped lang="scss">
.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.8s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.loading {
	position: fixed;
	top: 0;
	left: 0;
	z-index: 9999;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
	overflow: hidden;
	background-color: #f4f7f9;

	/* transition: all 0.8s ease-out; */
}

.loading.hidden {
	pointer-events: none;
	visibility: hidden;
	opacity: 0;
	transition: all 0.8s ease-out;
}

.dark .loading {
	background: #0d0d10;
}

.title {
	margin-top: 66px;
	font-size: 28px;
	font-weight: 600;
	display: flex;
    // 好看的渐变色文字颜色
     
	span {
		opacity: 0;
		transform: translateY(-20px);
		animation: typewriter 0.5s ease forwards;
	}
}

@keyframes typewriter {
  0%, 60%, 100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  30% {
    transform: translateY(-8px) scale(1.1);
    opacity: 0.5;
  }
}

.dark .title {
	color: #fff;
}

.loader {
	position: relative;
	width: 48px;
	height: 48px;
}

.loader::before {
	position: absolute;
	top: 60px;
	left: 0;
	width: 48px;
	height: 5px;
	content: '';
	background: hsl(var(--primary, 210 100% 50%) / 50%);
	border-radius: 50%;
	animation: shadow-ani 0.5s linear infinite;
}

.loader::after {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	content: '';
	background: hsl(var(--primary, 210 100% 50%));
	border-radius: 4px;
	animation: jump-ani 0.5s linear infinite;
}

@keyframes jump-ani {
	15% {
		border-bottom-right-radius: 3px;
	}

	25% {
		transform: translateY(9px) rotate(22.5deg);
	}

	50% {
		border-bottom-right-radius: 40px;
		transform: translateY(18px) scale(1, 0.9) rotate(45deg);
	}

	75% {
		transform: translateY(9px) rotate(67.5deg);
	}

	100% {
		transform: translateY(0) rotate(90deg);
	}
}

@keyframes shadow-ani {
	0%,
	100% {
		transform: scale(1, 1);
	}

	50% {
		transform: scale(1.2, 1);
	}
}
</style>
