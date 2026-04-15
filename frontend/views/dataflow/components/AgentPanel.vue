<template>
  <transition name="panel-slide">
    <div v-show="getAgentStore().isOpen" class="agent-panel" :class="{ 'center-mode': isCenterMode ,'sidebar-mode': isSidebar && isCenterMode}" :style="{ height: messages.length > 0 && isCenterMode ? '80vh' : 'auto' }" @click.stop>
      <!-- History Sidebar -->
      <transition name="history-slide">
        <div v-if="showHistory" class="history-sidebar" @click.stop>
          <!-- History Header -->
          <div class="history-header">
            <h3 class="history-title">历史对话</h3>
            <button class="history-close-btn" @click="showHistory = false" title="关闭">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <!-- New Conversation Button -->
          <button class="new-conversation-btn" @click="handleNewConversation">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>新建对话</span>
          </button>
          
          <!-- Search Box -->
          <div class="history-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input 
              v-model="historySearchQuery" 
              type="text" 
              placeholder="搜索对话..." 
              class="history-search-input"
            />
          </div>
          
          <!-- History List -->
          <div class="history-list">
            <!-- Loading -->
            <div v-if="isLoadingHistory" class="history-loading">
              <!-- <div class="loading-spinner"></div>
              <span>加载中...</span> -->
            </div>
            
            <!-- Empty State -->
            <div v-else-if="historyList.length === 0" class="history-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <p>暂无历史对话</p>
            </div>
            
            <!-- History Groups -->
            <div v-else class="history-groups">
              <!-- Today -->
              <div v-if="groupedHistory.today.length > 0" class="history-group">
                <div class="group-label">今天</div>
                <div 
                  v-for="item in groupedHistory.today" 
                  :key="item.id"
                  class="history-item"
                  :class="{ active: currentConversationId === item.id }"
                  @click="selectHistoryItem(item)"
                >
                  <div class="history-item-content">
                    <div class="history-item-title">{{ item.title }}</div>
                    <div class="history-item-time">{{ formatTime(item.created_at || item.createdAt) }}</div>
                  </div>
                  <button 
                    class="history-item-delete"
                    @click="deleteHistoryItem(item, $event)"
                    title="删除"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <!-- Yesterday -->
              <div v-if="groupedHistory.yesterday.length > 0" class="history-group">
                <div class="group-label">昨天</div>
                <div 
                  v-for="item in groupedHistory.yesterday" 
                  :key="item.id"
                  class="history-item"
                  :class="{ active: currentConversationId === item.id }"
                  @click="selectHistoryItem(item)"
                >
                  <div class="history-item-content">
                    <div class="history-item-title">{{ item.title }}</div>
                    <div class="history-item-time">{{ formatTime(item.created_at || item.createdAt) }}</div>
                  </div>
                  <button 
                    class="history-item-delete"
                    @click="deleteHistoryItem(item, $event)"
                    title="删除"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <!-- Last Week -->
              <div v-if="groupedHistory.lastWeek.length > 0" class="history-group">
                <div class="group-label">最近7天</div>
                <div 
                  v-for="item in groupedHistory.lastWeek" 
                  :key="item.id"
                  class="history-item"
                  :class="{ active: currentConversationId === item.id }"
                  @click="selectHistoryItem(item)"
                >
                  <div class="history-item-content">
                    <div class="history-item-title">{{ item.title }}</div>
                    <div class="history-item-time">{{ formatTime(item.created_at || item.createdAt) }}</div>
                  </div>
                  <button 
                    class="history-item-delete"
                    @click="deleteHistoryItem(item, $event)"
                    title="删除"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              <!-- Earlier -->
              <div v-if="groupedHistory.earlier.length > 0" class="history-group">
                <div class="group-label">更早</div>
                <div 
                  v-for="item in groupedHistory.earlier" 
                  :key="item.id"
                  class="history-item"
                  :class="{ active: currentConversationId === item.id }"
                  @click="selectHistoryItem(item)"
                >
                  <div class="history-item-content">
                    <div class="history-item-title">{{ item.title }}</div>
                    <div class="history-item-time">{{ formatTime(item.created_at || item.createdAt) }}</div>
                  </div>
                  <button 
                    class="history-item-delete"
                    @click="deleteHistoryItem(item, $event)"
                    title="删除"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <!-- 加载更多触发器 -->
            <div v-if="hasMoreData" class="history-load-more">
              <div v-if="isLoadingMore" class="loading-more">
                <div class="loading-spinner small"></div>
                <span>加载中...</span>
              </div>
              <!-- IntersectionObserver目标元素 -->
              <div ref="observerTarget" class="observer-target"></div>
            </div>
            
            <!-- 没有更多数据 -->
            <div v-else-if="!hasMoreData && historyList.length > 0" class="history-no-more">
              没有更多历史记录了
            </div>
          </div>
        </div>
      </transition>
      
      <!-- Main Panel -->
      <div class="main-panel">
      <!-- Header -->
      <!-- <header class="agent-header">
        <div class="header-content">
          <div class="header-left">
            <div class="header-title">
              <div class="title-text">自动化管线编排</div>
              <div v-if="getAgentStore().isThinking" class="subtitle-text">正在思考...</div>
              <div v-else-if="getAgentStore().isExecuting" class="subtitle-text">正在执行</div>
              <div v-else-if="isConnected" class="subtitle-text">在线</div>
            </div>
          </div>
          <div class="header-actions">
            <button 
              class="header-btn"
              @click="clearConversation"
              :title="messages.length > 0 ? '清空对话' : ''"
              :disabled="messages.length === 0"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
            <button 
              class="header-btn close-btn"
              @click="getAgentStore().closePanel"
              title="关闭面板"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </header> -->
      
      <!-- Conversation Area -->
      <div ref="conversationRef" class="conversation-area">
        <!-- Welcome Message -->
        <div v-if="messages.length === 0" class="welcome-section">
          <!-- <div class="welcome-title flex items-center mb-3">
            <div class="text">KPS Agent</div>
            <img class="w-12 h-10 ml-2" src="https://img.js.design/assets/img/69008a8640d5d2a02e09ae45.png" alt="">
          
          </div> -->
          <!-- <p class="welcome-description">你好～  我可以帮你快速构建数据流水线</p> -->
          <div class="capabilities">
              <div class="capability-item flex items-center ">
                <div class="example-label mr-2 flex-shrink-0">数据集：</div>
                <VirtualDropdown :placeholderTxt="'请选择数据集，将为您自动构建数据处理管线'"/>
              </div>
          </div>
          <div class="capabilities">
            <div class="capability-item cursor-pointer" @click="handleQuickAction({id: 'build'})">
              <div class="capability-icon">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M8.47037 8.81437C8.30118 8.3065 8.22429 8.06027 8.08586 8.01411C8.02434 7.99871 7.96282 7.99871 7.9013 8.01411C7.7629 8.06027 7.68599 8.3065 7.51682 8.81437C6.82472 10.9227 6.48637 11.9692 5.82505 12.8003C5.51746 13.185 5.1791 13.5236 4.79463 13.8313C3.96412 14.4777 2.9183 14.8317 0.811289 15.5242C0.303743 15.6935 0.0576668 15.7704 0.0115414 15.909C-0.00385284 15.9705 -0.00385284 16.0321 0.0115414 16.0936C0.0576668 16.2321 0.303743 16.3091 0.811289 16.4784C2.9183 17.1709 3.96412 17.5095 4.79463 18.1712C5.1791 18.479 5.51746 18.8176 5.82505 19.2023C6.471 20.0333 6.82472 21.0798 7.51682 23.1882C7.68599 23.6961 7.7629 23.9423 7.9013 23.9884C7.96282 24.0038 8.02434 24.0038 8.08586 23.9884C8.22429 23.9423 8.30118 23.6961 8.47037 23.1882C9.16244 21.0798 9.5008 20.0333 10.1621 19.2023C10.4697 18.8176 10.8081 18.479 11.1926 18.1712C12.0231 17.5248 13.0689 17.1709 15.1759 16.4784C15.6834 16.3091 15.9295 16.2321 15.9756 16.0936C15.991 16.0321 15.991 15.9705 15.9756 15.909C15.9295 15.7704 15.6834 15.6935 15.1759 15.5242C13.0689 14.8317 12.0231 14.4931 11.1926 13.8313C10.8081 13.5236 10.4697 13.185 10.1621 12.8003C9.5008 11.9692 9.16244 10.9227 8.47037 8.81437ZM18.9747 4.55147C18.867 4.2129 18.8055 4.0436 18.7132 4.01282C18.6671 3.99745 18.6363 3.99745 18.5902 4.01282C18.4979 4.0436 18.4518 4.2129 18.3287 4.55147C17.8673 5.95191 17.6367 6.65983 17.206 7.21386C17.0061 7.47546 16.7754 7.70632 16.5139 7.90637C15.9603 8.33728 15.2528 8.56814 13.8532 9.02983C13.5149 9.13754 13.3457 9.1991 13.315 9.29144C13.2996 9.33762 13.2996 9.3684 13.315 9.41455C13.3457 9.50689 13.5149 9.55307 13.8532 9.67619C15.2528 10.1379 15.9603 10.3687 16.5139 10.7996C16.7754 10.9997 17.0061 11.2305 17.206 11.4922C17.6367 12.0462 17.8673 12.7541 18.3287 14.1545C18.4364 14.4931 18.4979 14.6624 18.5902 14.6932C18.6363 14.7086 18.6671 14.7086 18.7132 14.6932C18.8055 14.6624 18.8516 14.4931 18.9747 14.1545C19.4361 12.7541 19.6668 12.0462 20.0974 11.4922C20.2973 11.2305 20.528 10.9997 20.7895 10.7996C21.3432 10.3687 22.0506 10.1379 23.4502 9.67619C23.7885 9.56845 23.9577 9.50689 23.9885 9.41455C24.0038 9.3684 24.0038 9.33762 23.9885 9.29144C23.9577 9.1991 23.7885 9.15294 23.4502 9.02983C22.0506 8.56814 21.3432 8.33728 20.7895 7.90637C20.528 7.70632 20.2973 7.47549 20.0974 7.21386C19.6668 6.64445 19.4361 5.95191 18.9747 4.55147ZM11.5156 0.350114C11.454 0.134659 11.4079 0.0423215 11.3618 0.011542C11.331 -0.0038475 11.3156 -0.0038475 11.2848 0.011542C11.2233 0.0269316 11.1926 0.134659 11.131 0.350111C10.8388 1.22731 10.7004 1.65822 10.4236 2.01219C10.3005 2.16609 10.1467 2.31999 9.99295 2.4431C9.63923 2.72009 9.20859 2.85862 8.33194 3.15101C8.11662 3.21256 8.02434 3.25875 7.99358 3.3049C7.97822 3.33568 7.97822 3.35108 7.99358 3.38186C8.00898 3.44342 8.11662 3.4742 8.33194 3.53576C9.20859 3.82815 9.63923 3.96667 9.99295 4.24368C10.1467 4.3668 10.3005 4.52069 10.4236 4.67459C10.7004 5.02853 10.8388 5.45944 11.131 6.33666C11.1926 6.55212 11.2387 6.64445 11.2848 6.67523C11.3156 6.69061 11.331 6.69061 11.3618 6.67523C11.4233 6.65983 11.454 6.55212 11.5156 6.33666C11.8078 5.45944 11.9462 5.02853 12.223 4.67459C12.346 4.52069 12.4998 4.3668 12.6536 4.24368C13.0074 3.96667 13.438 3.82815 14.3146 3.53576C14.53 3.4742 14.6222 3.42802 14.653 3.38186C14.6684 3.35108 14.6684 3.33568 14.653 3.3049C14.6376 3.24334 14.53 3.21256 14.3146 3.15101C13.438 2.85862 13.0074 2.72009 12.6536 2.4431C12.4998 2.31999 12.346 2.16609 12.223 2.01219C11.9616 1.65822 11.8078 1.22731 11.5156 0.350111L11.5156 0.350114Z"   fill="#164FC9" ></path></svg>
              </div>
              <div class="capability-text">
                <div class="capability-title">Pipeline构建</div>
                <div class="capability-desc">自然语言描述需求，自动生成 Pipeline</div>
              </div>
            </div>
            <div class="capability-item cursor-pointer" @click="handleQuickAction({id: 'optimize'})">
              <div class="capability-icon">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="21.60009765625" height="21.60247802734375" viewBox="0 0 21.60009765625 21.60247802734375" fill="none"><path d="M21.262 0.615379L21.2092 0.39335L20.9846 0.338145C17.2198 -0.656781 11.3918 0.338145 6.43041 6.10727C4.10453 6.05327 2.22029 6.88137 0.33364 8.7608L0 9.09084L4.57378 12.1548C3.9665 13.259 4.33136 14.89 5.49191 16.0481C6.65365 17.2063 8.28465 17.5687 9.36838 16.9878L12.448 21.6025L12.7804 21.27C14.7235 19.3389 15.5528 17.4631 15.4724 15.1144C21.2367 10.1362 22.2628 4.37305 21.2633 0.614179L21.2633 0.615379L21.262 0.615379ZM15.0259 8.63717C14.9906 8.63566 14.9554 8.63325 14.9202 8.62996C14.885 8.62669 14.8499 8.62255 14.815 8.61755C14.78 8.61256 14.7452 8.60671 14.7105 8.6C14.6758 8.59329 14.6413 8.58574 14.607 8.57734C14.5727 8.56895 14.5386 8.55971 14.5047 8.54962C14.4708 8.53956 14.4372 8.52865 14.4039 8.51692C14.3706 8.50522 14.3376 8.49268 14.3049 8.47933C14.2721 8.466 14.2398 8.45186 14.2078 8.43693C14.1757 8.42199 14.1441 8.40629 14.1129 8.3898C14.0816 8.37332 14.0508 8.35608 14.0204 8.33807C13.99 8.32009 13.96 8.30136 13.9306 8.28187C13.9011 8.26241 13.8721 8.24222 13.8436 8.22134C13.8151 8.20045 13.7871 8.17887 13.7597 8.15662C13.7323 8.13436 13.7054 8.11143 13.6791 8.08784C13.6528 8.06425 13.6271 8.04006 13.602 8.01521C13.5769 7.99035 13.5524 7.96491 13.5285 7.93886C13.5046 7.91282 13.4814 7.8862 13.4589 7.85901C13.4363 7.83183 13.4144 7.80411 13.3932 7.77584C13.372 7.74757 13.3515 7.71882 13.3317 7.68956C13.3119 7.6603 13.2929 7.63055 13.2745 7.60034C13.2562 7.57015 13.2386 7.53952 13.2218 7.50844C13.205 7.47739 13.1889 7.44591 13.1737 7.41406C13.1584 7.38222 13.1439 7.35001 13.1302 7.31744C13.1165 7.28488 13.1036 7.25199 13.0915 7.21879C13.0794 7.1856 13.0682 7.15212 13.0577 7.11837C13.0473 7.08463 13.0377 7.05065 13.0289 7.01641C13.0201 6.98219 13.0122 6.94778 13.0051 6.91316C12.998 6.87856 12.9918 6.8438 12.9864 6.80888C12.981 6.77397 12.9765 6.73895 12.9728 6.7038C12.9692 6.66865 12.9664 6.63344 12.9645 6.59817C12.9625 6.56289 12.9615 6.5276 12.9613 6.49226C12.961 6.45695 12.9617 6.42163 12.9633 6.38632C12.9648 6.35104 12.9672 6.31581 12.9705 6.28062C12.9737 6.24543 12.9779 6.21037 12.9829 6.17539C12.9878 6.14041 12.9937 6.10558 13.0004 6.07088C13.0071 6.0362 13.0146 6.0017 13.023 5.96738C13.0314 5.93308 13.0406 5.89899 13.0507 5.8651C13.0608 5.83124 13.0716 5.79764 13.0834 5.7643C13.0951 5.73097 13.1076 5.69796 13.1209 5.66524C13.1343 5.63254 13.1484 5.60015 13.1633 5.56813C13.1782 5.5361 13.1939 5.50448 13.2104 5.47321C13.2269 5.44197 13.2441 5.41115 13.2621 5.38073C13.2801 5.35035 13.2988 5.32039 13.3183 5.2909C13.3377 5.26143 13.3579 5.23244 13.3788 5.20392C13.3997 5.17544 13.4213 5.14746 13.4435 5.12002C13.4658 5.09259 13.4887 5.06573 13.5123 5.0394C13.5358 5.0131 13.56 4.98738 13.5849 4.96226C13.6097 4.93713 13.6352 4.91264 13.6612 4.88875C13.6873 4.86487 13.7139 4.84165 13.7411 4.81907C13.7682 4.79652 13.7959 4.77464 13.8242 4.75342C13.8524 4.73222 13.8812 4.71171 13.9105 4.6919C13.9397 4.67211 13.9694 4.65306 13.9997 4.63471C14.0299 4.61638 14.0605 4.59878 14.0915 4.58195C14.1226 4.56511 14.1541 4.54906 14.1859 4.53376C14.2178 4.51849 14.25 4.50397 14.2825 4.49026C14.3151 4.47657 14.348 4.46368 14.3812 4.45157C14.4143 4.43948 14.4478 4.42822 14.4816 4.41775C14.5153 4.40731 14.5493 4.39769 14.5835 4.38889C14.6177 4.38012 14.6521 4.37218 14.6868 4.36507C14.7214 4.35799 14.7561 4.35176 14.791 4.34636C14.826 4.34098 14.861 4.33645 14.8961 4.33277C14.9313 4.3291 14.9665 4.3263 15.0018 4.32436C15.037 4.32242 15.0723 4.32136 15.1077 4.32115C15.143 4.32094 15.1783 4.32159 15.2136 4.32311C15.2489 4.32465 15.2841 4.32704 15.3193 4.33029C15.3545 4.33356 15.3896 4.33767 15.4246 4.34265C15.4595 4.34763 15.4943 4.35347 15.529 4.36016C15.5637 4.36685 15.5982 4.37438 15.6326 4.38275C15.6669 4.39115 15.701 4.40037 15.7348 4.41041C15.7687 4.42047 15.8023 4.43136 15.8356 4.44305C15.869 4.45478 15.902 4.46729 15.9347 4.4806C15.9674 4.49393 15.9998 4.50807 16.0318 4.52296C16.0639 4.5379 16.0955 4.55359 16.1268 4.57005C16.158 4.58652 16.1888 4.60374 16.2193 4.62171C16.2497 4.63971 16.2796 4.65842 16.3091 4.67787C16.3386 4.69732 16.3676 4.71749 16.3961 4.73836C16.4246 4.75924 16.4526 4.78082 16.48 4.80306C16.5075 4.8253 16.5343 4.84821 16.5607 4.87177C16.587 4.89536 16.6127 4.91956 16.6378 4.94439C16.663 4.96922 16.6875 4.99464 16.7114 5.02067C16.7352 5.0467 16.7585 5.07333 16.781 5.1005C16.8036 5.12767 16.8255 5.15539 16.8467 5.18362C16.8679 5.21189 16.8885 5.24064 16.9083 5.26989C16.928 5.29915 16.9471 5.32887 16.9655 5.35906C16.9838 5.38927 17.0014 5.41988 17.0183 5.45094C17.0351 5.48199 17.0512 5.51345 17.0665 5.54528C17.0818 5.57714 17.0963 5.60935 17.11 5.6419C17.1237 5.67445 17.1366 5.70732 17.1487 5.74051C17.1608 5.77371 17.1721 5.80717 17.1826 5.84093C17.193 5.87468 17.2026 5.90865 17.2115 5.94287C17.2202 5.97708 17.2282 6.01149 17.2353 6.04609C17.2424 6.08071 17.2486 6.11548 17.254 6.15039C17.2594 6.18531 17.264 6.22033 17.2677 6.25545C17.2713 6.2906 17.2741 6.32581 17.2761 6.36108C17.278 6.39636 17.2791 6.43167 17.2793 6.46699C17.2795 6.50233 17.2789 6.53764 17.2774 6.57292C17.2757 6.60819 17.2732 6.6434 17.2698 6.67855C17.2664 6.71369 17.2621 6.74873 17.257 6.78367C17.2519 6.81861 17.246 6.85342 17.2392 6.88806C17.2324 6.9227 17.2247 6.95717 17.2162 6.99143C17.2077 7.02571 17.1984 7.05976 17.1883 7.09358C17.1781 7.12742 17.1672 7.16096 17.1554 7.19423C17.1436 7.22752 17.131 7.2605 17.1176 7.29315C17.1042 7.32583 17.09 7.35815 17.075 7.39013C17.0601 7.42212 17.0443 7.4537 17.0278 7.4849C17.0113 7.51612 16.994 7.5469 16.976 7.57724C16.9579 7.60762 16.9392 7.63751 16.9197 7.66696C16.9002 7.69641 16.88 7.72538 16.8591 7.75382C16.8382 7.7823 16.8166 7.81023 16.7944 7.83761C16.7721 7.86504 16.7492 7.89187 16.7256 7.91816C16.702 7.94445 16.6778 7.97014 16.653 7.99525C16.6282 8.02035 16.6027 8.04485 16.5767 8.06868C16.5507 8.09257 16.5241 8.11577 16.4969 8.13832C16.4698 8.1609 16.4421 8.18278 16.4139 8.204C16.3856 8.22522 16.3569 8.24573 16.3277 8.26552C16.2984 8.28533 16.2687 8.3044 16.2386 8.32275C16.2084 8.34113 16.1778 8.35874 16.1468 8.37558C16.1158 8.39246 16.0844 8.40855 16.0526 8.42387C16.0207 8.4392 15.9886 8.45374 15.9561 8.46749C15.9235 8.48125 15.8907 8.4942 15.8575 8.50636C15.8244 8.51851 15.791 8.52986 15.7573 8.54036C15.7236 8.55089 15.6896 8.56059 15.6554 8.56946C15.6213 8.57832 15.5869 8.58633 15.5523 8.5935C15.5177 8.6007 15.483 8.60703 15.4481 8.61251C15.4133 8.618 15.3783 8.62264 15.3431 8.62642C15.308 8.63019 15.2729 8.6331 15.2376 8.63517C15.2024 8.63724 15.1671 8.63842 15.1318 8.63876C15.0965 8.63909 15.0612 8.63857 15.0259 8.63717ZM1.44978 17.9456C0.555669 18.8433 0.00240026 21.6002 0.00240026 21.6002C0.00240026 21.6002 2.65473 21.1525 3.65207 20.1502C4.41176 19.3941 4.54977 18.2876 3.9281 17.6659C3.30643 17.0442 2.20588 17.1883 1.44978 17.9456Z"   fill="#0FBF5E" ></path></svg>
              </div>
              <div class="capability-text">
                <div class="capability-title">Pipeline优化</div>
                <div class="capability-desc">分析现有流程，提供优化建议</div>
              </div>
            </div>
            <div class="capability-item cursor-pointer" @click="handleQuickAction({id: 'explain'})">
              <div class="capability-icon">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="23.983642578125" height="21.06341552734375" viewBox="0 0 23.983642578125 21.06341552734375" fill="none"><path d="M17.1886 13.2445C17.1886 16.0828 14.8519 18.382 11.9667 18.382C9.08156 18.382 6.74484 16.0828 6.74484 13.2445C6.74484 10.4063 9.08156 8.10703 11.9667 8.10703C14.8519 8.10703 17.1886 10.4063 17.1886 13.2445ZM23.6597 19.8563C22.9917 20.993 21.5152 21.382 20.3573 20.7258C19.2839 20.1164 18.8667 18.8227 19.3425 17.7305L17.887 16.9031C16.6495 18.8367 14.4605 20.1211 11.9667 20.1211C9.48703 20.1211 7.31203 18.8531 6.06984 16.9383L4.64016 17.7492C5.11828 18.8414 4.69875 20.1352 3.62531 20.7445C2.46984 21.4008 0.990942 21.0117 0.322973 19.875C-0.342652 18.7406 0.0534431 17.2875 1.20891 16.6313C2.28235 16.0219 3.63 16.3125 4.35422 17.2664L5.78391 16.4555C5.26828 15.4969 4.97766 14.4047 4.97766 13.2469C4.97766 9.54375 7.95188 6.52266 11.6808 6.375L11.6808 4.73906C10.4808 4.60078 9.55031 3.59531 9.55031 2.37891C9.55031 1.06641 10.6331 0 11.9667 0C13.3027 0 14.3831 1.06406 14.3831 2.37891C14.3831 3.59766 13.4527 4.60078 12.2527 4.73906L12.2527 6.375C15.9816 6.52031 18.9605 9.54141 18.9605 13.2469C18.9605 14.3906 18.6769 15.4688 18.1753 16.418L19.6331 17.2453C20.3503 16.2914 21.7003 16.0008 22.7738 16.6102C23.9292 17.2664 24.3277 18.7195 23.6597 19.8563ZM17.8917 15.6984C18.2269 14.9203 18.3956 14.0953 18.3956 13.2422C18.3956 12.3914 18.2269 11.5641 17.8917 10.7859C17.5683 10.0336 17.1066 9.35859 16.5159 8.77734C15.9253 8.1961 15.2386 7.73906 14.4722 7.42266C13.68 7.09219 12.8363 6.92578 11.9667 6.92578C11.0972 6.92578 10.2558 7.09219 9.46125 7.42266C8.69484 7.74141 8.00813 8.19844 7.4175 8.77734C6.82688 9.35859 6.36516 10.0336 6.04172 10.7859C5.70891 11.5664 5.53781 12.3914 5.53781 13.2445C5.53781 14.0953 5.70656 14.9227 6.04172 15.7008C6.36516 16.4531 6.82688 17.1281 7.4175 17.707C8.00813 18.2883 8.69484 18.7453 9.46125 19.0617C10.2534 19.3922 11.0972 19.5586 11.9667 19.5586C12.8363 19.5586 13.6777 19.3922 14.4722 19.0617C15.2386 18.743 15.9253 18.2859 16.5159 17.707C17.1042 17.1258 17.5683 16.4508 17.8917 15.6984Z"   fill="#7D12FF" ></path></svg>
              </div>
              <div class="capability-text">
                <div class="capability-title">算子解释</div>
                <div class="capability-desc">解释算子功能和配置参数</div>
              </div>
            </div>
          </div>
          <!-- <div class="example-prompts">
            <div class="example-label">试试这些示例：</div>
            <button 
              v-for="example in examplePrompts" 
              :key="example"
              class="example-btn"
              @click="userInput = example"
            >
              {{ example }}
            </button>
          </div> -->
        </div>
        
        <!-- Messages -->
        <AgentMessage
          v-for="message in messages"
          :key="message.id"
          :message="message"
          @confirm="handleConfirm"
          @reject="handleReject"
          @modify="handleModify"
          @save="handleSave"
          @action="handleSuggestionAction"
          @cancel="handleCancel"
          @view-node="handleViewNode"
        />
        
        <!-- Thinking Indicator -->
        <div v-if="getAgentStore().isThinking" class="thinking-indicator">
          <div class="thinking-content">
            <div class="thinking-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span class="thinking-text">{{ thinkingText }}</span>
          </div>
        </div>
      </div>
      
      <!-- Input Area -->
      <footer class="input-area">
        <!-- Quick Actions -->
        <div v-show="messages.length === 0" class="bot-container welcome-title">
          <div class="text ">
            <div class="bot-text">
              管线编排 Agent
              <div class="img1">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="63.59918212890625" height="17.435203552246094" viewBox="0 0 63.59918212890625 17.435203552246094" fill="none"><path d="M0 12.3125C12.4123 14.6181 38.7322 21.2483 63.5992 9.53674e-07C45.9568 22.3536 13.9849 19.2778 0 12.3125Z"   fill="url(#linear_fill_5_68107)" ></path><defs><linearGradient id="linear_fill_5_68107" x1="28.4097900390625" y1="6.812480926513672" x2="26.4296875" y2="24.176380157470703" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1960F6"  /><stop offset="1" stop-color="#21F7FC"  /></linearGradient></defs></svg>
              </div>
               <div class="img2">
                 <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="51.68255615234375" height="26.184181213378906" viewBox="0 0 51.68255615234375 26.184181213378906" fill="none"><path d="M-2.81334e-05 26.1842C11.8903 25.3889 37.543 15.2661 45.8716 1.79095C47.9279 -1.70971 54.8572 0.0536366 49.9746 5.92649C45.092 11.7994 34.2335 23.5719 -2.81334e-05 26.1842Z"   fill="url(#linear_fill_5_68106)" ></path><defs><linearGradient id="linear_fill_5_68106" x1="21.112060546875" y1="5.341545104980469" x2="21.84527587890625" y2="32.54263687133789" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1960F6"  /><stop offset="1" stop-color="#21F7FC"  /></linearGradient></defs></svg>
               </div>
            </div>
            <div class="flex-1"></div>
          </div>
          <!-- <img :class="['botSty', {'offline': !isConnected}]" src="https://img.js.design/assets/img/69008a8640d5d2a02e09ae45.png" alt=""> -->
          <img :class="['botSty', {'offline': !isConnected}]"  src="@/assets/images/agentBot.jpg" alt="">
         <div class="welcome-description">你好～  我可以帮你快速构建数据流水线</div>
        
        </div>
        <!-- Input Box -->
        <div class="input-container">
          <div class="input-wrapper">
            <textarea
              ref="inputRef"
              v-model="userInput"
              class="input-textarea"
              placeholder="描述你的数据流需求..."
              rows="1"
              :disabled="isProcessing"
              @input="handleInputChange"
              @keydown.enter.exact.prevent="onEnter"
              @keydown.enter.meta.prevent="userInput += '\n'"
              @keydown.enter.ctrl.prevent="userInput += '\n'"
            />
            <!-- 发送/停止按钮 -->
            <button 
              v-if="!isProcessing"
              class="send-button"
              :class="{ 'active': canSend }"
              :disabled="!canSend"
              @click="handleSend"
              title="发送 (Enter)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/>
              </svg>
            </button>
            <button 
              v-else
              class="stop-button"
              @click="handleStop"
              title="停止"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          </div>
          
          <!-- Status Bar -->
          <!-- <div class="status-bar">
            <div class="status-left">
              <div class="connection-status">
                <div class="status-dot" :class="{ 'connected': isConnected, 'disconnected': !isConnected }"></div>
                <span class="status-label">{{ isConnected ? '已连接' : '连接中...' }}</span>
              </div>
            </div>
            <div class="status-right">
              <span class="hint-text" v-if="!isProcessing">Enter 发送 · ⌘Enter 换行</span>
              <span class="hint-text" v-else>点击停止按钮中断当前任务</span>
            </div>
          </div> -->
        </div>
         <transition name="quick-actions-slide">
          <div class="flex justify-center items-center mt-3" v-if="isConnected">
            <div v-show="quickActions && quickActions.length > 0 && !isProcessing" class="quick-actions">
              <button
                v-for="action in quickActions"
                :key="action.id"
                class="quick-action-chip"
                @click="handleQuickAction(action)"
              >
                <span class="chip-icon">{{ action.icon }}</span>
                <span class="chip-text">{{ action.text }}</span>
              </button>
            </div>
            <div  v-if="!isProcessing" class="flex items-end" style="flex-direction: column;">
              <!-- <div>
                <span class="thinking-text">调试:</span>
                <el-switch class="" v-model="passThrough" :loading="passThroughLoading" :before-change="beforeChangePassThrough" />
              </div> -->
              <!-- <div>
                <span class="thinking-text">透传:</span>
                <el-switch class="" v-model="passThrough" :loading="passThroughLoading" :before-change="beforeChangePassThrough" />
              </div> -->
              <!-- <div class="flex items-center">
                <span class="thinking-text">深度思考:</span>
                <el-switch class="" v-model="deepThinking" :loading="switchLoading" :before-change="beforeChange" />
              </div> -->
            </div>
          </div>
          <div v-else class="connection-status">
            <div class="status-dot" :class="{ 'connected': isConnected, 'disconnected': !isConnected }"></div>
            <span class="status-label"> 连接中...</span>
          </div>
          <!-- 开关按钮 -->
        </transition>
      </footer>
      </div>
      <!-- End Main Panel -->
      <Teleport to="body">
        <OperatorNode v-model:visible="centerDialogVisible" @sendMessage="operatorSendMessage" />
      </Teleport>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, provide,inject ,defineComponent} from 'vue'
import { useAgentStore } from '@/store/modules/agent'
import { useAgentWebSocket } from '@/composables/useAgentWebSocket'
import { useAgentMessages } from '@/composables/useAgentMessages'
import AgentMessage from './AgentMessage.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getConversationList, deleteConversation } from '@/api/dataflow'
import { getList as getDatasetList } from '@/api/dataflow'
import VirtualDropdown from '@/components/dataflow/VirtualDropdown.vue'
import OperatorNode from './OperatorExplain.vue'
const props = defineProps({
  canvasContext: {
    type: Object,
    default: () => ({})
  },
  isSidebar: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['focus-node', 'save-pipeline'])

// Stores & Composables
let agentStore = null
function getAgentStore() {
  if (!agentStore) {
    agentStore = useAgentStore()
  }
  return agentStore
}
const isCenterMode = ref(true) // 默认居中模式
const socketByWorkflow = inject('socketByWorkflow')

const {
  socket,
  isConnected,
  connect,
  disconnect,
  sendUserMessage,
  sendConfirmMessage,
  sendModifyMessage,
  sendFormUpdate,
  stopCurrentTask,
  setMessageHandlers,
  currentConversationId,
  conversationTitle,
  loadConversation,
  startNewConversation
} = socketByWorkflow
const centerDialogVisible =ref(false)
// 提供 WebSocket 方法给子组件
provide('sendFormUpdate', sendFormUpdate)
const resetCanvas = inject('resetCanvas')
const switchLoading = ref(false)
const passThroughLoading = ref(false)
const passThrough = computed(()=>{
  return getAgentStore().debugMode
  // return getAgentStore().passThrough
})
const beforeChange = () => {
  switchLoading.value = true
  return new Promise((resolve) => {
    setTimeout(() => {
      getAgentStore().setDeepThinking()
      switchLoading.value = false
      ElMessage.success(`${deepThinking.value ? '开启' : '关闭'}深度思考`)
      return resolve(true)
    }, 500)
  })
}
const beforeChangePassThrough = () => {
  passThroughLoading.value = true
  return new Promise((resolve) => {
    setTimeout(() => {
      getAgentStore().setDebugMode()
      // getAgentStore().setPassThrough()
      passThroughLoading.value = false
      // ElMessage.success(`${passThrough.value ? '开启' : '关闭'}透传`)
      return resolve(true)
    }, 500)
  })
}



const deepThinking = computed(()=>{
  return getAgentStore().deepThinking
})
// 监听画布节点数量变化，自动切换模式
watch(() => props.canvasContext?.nodes?.length || 0, (nodeCount) => {
  // 当节点数量 > 0 时，自动切换到抽屉模式
  if (nodeCount > 0 && isCenterMode.value) {
    isCenterMode.value = false
  }
  // 当节点数量为0且AgentPanel打开时，切换到居中模式
  else if (nodeCount === 0 && getAgentStore().isOpen && !isCenterMode.value) {
    isCenterMode.value = true
  }
}, { immediate: true })

// 监听 AgentPanel 打开状态，打开时根据画布状态设置模式
watch(() => getAgentStore().isOpen, (isOpen) => {
  if (isOpen) {
    const nodeCount = props.canvasContext?.nodes?.length || 0
    isCenterMode.value = nodeCount === 0
  }
}, { immediate: true })

const {
  conversationRef,
  scrollToBottom,
  handleThoughtMessage,
  handlePlanMessage,
  handleActionMessage,
  handleErrorMessage,
  handleCompleteMessage,
  handleRunStarted,
  handlePlanDecision,
  handleRunFinished,
  handleStateUpdate,
  clearMessages,
  addWelcomeMessage,
  handlePipelineDebugLog,
  handleOperatorExplanation,
  handleMessageConfirm,
  handleQuestionClosely
} = useAgentMessages()

// State
const userInput = ref('')
const inputRef = ref(null)


// 历史记录相关状态
const showHistory = ref(false)
const historyList = ref([])
const isLoadingHistory = ref(false)
const isLoadingMore = ref(false)
const currentPage = ref(1)
const hasMoreData = ref(true)
const pageSize = 50
const observerTarget = ref(null)
const observer = ref(null)
const historySearchQuery = ref('')

// Example prompts
const examplePrompts = ref([
  '构建pipeline将英文文档翻译成中文',
  '分析当前 Pipeline 并优化性能',
  '解释数据清洗算子的配置参数'
])

// Quick Actions - 使用 store 中定义的 quickActions
const quickActions = computed(() => {
  // 始终显示快捷操作，不管是否有消息历史
  return getAgentStore().quickActions
})

// Computed
const messages = computed(() => getAgentStore().messages)
const isProcessing = computed(() => 
  getAgentStore().isThinking || getAgentStore().isExecuting
)
const canSend = computed(() => 
  userInput.value.trim().length > 0 && !isProcessing.value && isConnected.value
)
const agentDatasets = ref([])
const datasetVal = computed(() => getAgentStore().agentDatasetVal)
const handleSelect = (val) => {
  // 将选择的val保存到pinia中全局使用，使用getAgentStore().setDatasetVal(val)
  getAgentStore().setAgentDatasetVal(val)
  console.log('val = ',val ,typeof val)
}
const loadDatasets = async () => {
  try {
    const response = await getDatasetList({ page_num: 1, page_size: 500 })
    
    if (response && response.code === 0 && response.data && response.data.list) {
      agentDatasets.value = response.data.list
    } else {
      agentDatasets.value = []
    }
  } catch (error) {
    datasets.value = []
    ElMessage.error('加载数据集列表失败')
  }
}
// 思考状态文本 - 根据当前消息类型显示
const thinkingText = computed(() => {
  const msgType = getAgentStore().currentMessageType
  
  // 🔍 调试日志 - 追踪思考状态
  console.log('🔍 [AgentPanel thinkingText] ========')
  console.log('  currentMessageType:', msgType)
  console.log('  isThinking:', getAgentStore().isThinking)
  console.log('  isExecuting:', getAgentStore().isExecuting)
  console.log('  currentStep:', getAgentStore().currentStep)
  nextTick(() => {
    scrollToBottom()
  })  
  // 根据消息类型返回对应的描述
  if (msgType === 'plan_decision') {
    return '正在规划方案...'
  }
  
  if (msgType === 'run_started') {
    return '正在分析您的需求...'
  }
  
  if (msgType === 'action') {
    const step = getAgentStore().currentStep
    if (step && step.action) {
      if (step.action === 'add_node') {
        return '正在添加节点...'
      }
      if (step.action === 'add_edge') {
        return '正在创建连线...'
      }
      if (step.action === 'update_config') {
        return '正在更新配置...'
      }
    }
    return '正在执行任务...'
  }
  
  if (msgType === 'thought') {
    return '正在思考...'
  }
  
  // 如果正在执行但没有明确的消息类型
  if (getAgentStore().isExecuting) {
    return '正在执行任务...'
  }
  
  // 默认（纯思考状态）
  return '正在分析您的需求...'
})

// Auto-resize textarea
const handleInputChange = () => {
  if (inputRef.value) {
    inputRef.value.style.height = 'auto'
    inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 120) + 'px'
  }
}

// Methods
const onEnter = (event) => {
  // 当中文输入法正在组词时，忽略 Enter
  if (event && (event.isComposing || event.keyCode === 229)) {
    return
  }
  handleSend()
}
const handleSend = async (...args) => {
  if (!canSend.value) return
  
  const text = userInput.value.trim()
  const context = {
    currentNodes: props.canvasContext.nodes?.length || 0,
    currentEdges: props.canvasContext.edges?.length || 0,
    canvasState: props.canvasContext.canvasState || {}
  }
  if(args.includes('explain')){
    // props.canvasContext.node 中包含当前选中的节点信息
    const nodes = props.canvasContext.nodes || []
    const selectId = props.canvasContext.canvasState?.selectedNodeId || ''
    const selectedNode = nodes.find(node => node.id === selectId) || {}
    const operatorName = selectedNode?.data?.operator?.name || ''
    if(!operatorName){
      userInput.value = ''
      centerDialogVisible.value = true
      // ElMessage.error('请先选择一个算子节点')
      return
    }
    context.operator_names= [operatorName]
  }
    console.log('[Agent] props.canvasContext', text, props.canvasContext);
  getAgentStore().setThinking(true)
  userInput.value = ''
  const success = await sendUserMessage(text, context)
  
  if (success) {
    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.style.height = 'auto'
      }
    })
  }else{
    getAgentStore().setThinking(false)
  }
}
const operatorSendMessage = async (text, context) => {
    const success = await sendUserMessage(text, context)

    if (success) {
    getAgentStore().setThinking(true)
    userInput.value = ''
    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.style.height = 'auto'
      }
    })
  }
}

const handleQuickAction = (action) => {
  const actionTexts = {
    'build': '构建一个新的Pipeline',
    'optimize': '我想优化Pipeline',
    'explain': '请解释当前选中的节点',
    'add': '我想添加新的算子节点'
  }
  userInput.value = actionTexts[action.id] || action.text
  if(action.id === 'explain'){
    handleSend('explain')
    return
  }
  handleSend()
}

const handleConfirm = async () => {
  if (!getAgentStore().pendingConfirm) return
  
  const planId = getAgentStore().pendingConfirm.planId || ''
  await sendConfirmMessage('confirm', '', planId)
}

const handleReject = async () => {
  ElMessageBox.prompt('请说明拒绝理由（可选）', '拒绝', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'textarea'
  }).then(async ({ value }) => {
    const planId = getAgentStore().pendingConfirm?.planId || ''
    await sendConfirmMessage('reject', value || '', planId)
  }).catch(() => {
    // 用户取消
  })
}

const handleModify = () => {
  ElMessageBox.prompt('请描述你想如何修改', '修改计划', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputType: 'textarea',
    inputPlaceholder: '例如：在第2步添加数据验证...'
  }).then(async ({ value }) => {
    if (value) {
      userInput.value = `修改计划：${value}`
      await handleSend()
    }
  }).catch(() => {
    // 用户取消
  })
}

const handleSave = () => {
  // 向父组件（OperatorWorkflow）发送保存Pipeline的事件
  emit('save-pipeline')
}

const handleSuggestionAction = (suggestion) => {
  if (suggestion.type === 'retry') {
    // 重试上一个操作
    ElMessage.info('正在重试...')
    // TODO: 实现重试逻辑
  } else if (suggestion.type === 'alternative' && suggestion.action) {
    // 使用替代方案
    userInput.value = `使用替代方案：${suggestion.description}`
    handleSend()
  } else if (suggestion.type === 'modify') {
    // 修改配置
    userInput.value = suggestion.description
    handleSend()
  }
}

const handleCancel = () => {
  getAgentStore().resetState()
  ElMessage.info('已取消操作')
}

const handleStop = async () => {
  await stopCurrentTask()
}

const handleViewNode = (nodeId) => {
  emit('focus-node', nodeId)
  ElMessage.success('已聚焦到节点')
}

const clearConversation = () => {
  ElMessageBox.confirm(
    '确定要清空对话历史吗？此操作不可恢复。',
    '清空对话',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    await stopCurrentTask()
    clearMessages()
    startNewConversation()
    ElMessage.success('对话历史已清空')
  }).catch(() => {
    // 用户取消
  })
}

// ========== 历史记录管理 ==========

/**
 * 切换历史记录侧边栏
 */
const toggleHistory = () => {
  showHistory.value = !showHistory.value
  
  // 如果打开历史记录，加载列表并设置IntersectionObserver
  if (showHistory.value) {
    loadHistoryList()
    nextTick(() => {
      setupIntersectionObserver()
    })
  } else {
    // 关闭历史记录时清除observer
    if (observer.value) {
      observer.value.disconnect()
      observer.value = null
    }
  }
}

// 监听历史面板显示状态，重新设置observer
watch(showHistory, (newVal) => {
  if (newVal) {
    nextTick(() => {
      setupIntersectionObserver()
    })
  }
})

// 组件卸载时清除observer
onBeforeUnmount(() => {
  if (observer.value) {
    observer.value.disconnect()
    observer.value = null
  }
})

/**
 * 加载历史会话列表
 */
const loadHistoryList = async (isLoadMore = false) => {
  try {
    if (isLoadMore) {
      isLoadingMore.value = true
    } else {
      isLoadingHistory.value = true
      currentPage.value = 1
      hasMoreData.value = true
    }
    
    const response = await getConversationList({
      page: isLoadMore ? currentPage.value : 1,
      page_size: pageSize
    })
    
    if (response.data?.conversations) {
      if (isLoadMore) {
        // 追加数据
        historyList.value = [...historyList.value, ...response.data.conversations]
        // 检查是否还有更多数据
        hasMoreData.value = response.data.conversations.length === pageSize
      } else {
        // 替换数据
        historyList.value = response.data.conversations
      }
      console.log('[Agent] 历史会话列表已加载:', historyList.value.length)
    }
  } catch (error) {
    hasMoreData.value = false
    console.error('[Agent] 加载历史会话列表失败:', error)
    if (!isLoadMore) {
      ElMessage.error('加载历史记录失败')
    }
  } finally {
    isLoadingHistory.value = false
    isLoadingMore.value = false
  }
}

/**
 * 设置IntersectionObserver监听加载更多
 */
const setupIntersectionObserver = () => {
  // 清除已存在的observer
  if (observer.value) {
    observer.value.disconnect()
    observer.value = null
  }
  
  // 如果没有更多数据或正在加载，不设置observer
  if (!hasMoreData.value || isLoadingMore.value) {
    return
  }
  
  nextTick(() => {
    if (!observerTarget.value) return
    
    // 创建IntersectionObserver
    observer.value = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && hasMoreData.value && !isLoadingMore.value) {
          // 元素进入视口且可以加载更多时，加载下一页
          loadMoreHistory()
        }
      },
      {
        root: document.querySelector('.history-list'),
        rootMargin: '50px', // 提前50px触发
        threshold: 0.1
      }
    )
    
    // 开始观察目标元素
    observer.value.observe(observerTarget.value)
  })
}

/**
 * 加载更多历史会话
 */
const loadMoreHistory = async () => {
  if (isLoadingMore.value || !hasMoreData.value) return
  
  currentPage.value++
  await loadHistoryList(true)
  
  // 加载完成后重新设置observer
  setupIntersectionObserver()
}

/**
 * 按时间分组历史会话
 */
const groupedHistory = computed(() => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  const groups = {
    today: [],
    yesterday: [],
    lastWeek: [],
    earlier: []
  }
  
  // 筛选搜索结果
  const filtered = historySearchQuery.value
    ? historyList.value.filter(item => 
        item.title?.toLowerCase().includes(historySearchQuery.value.toLowerCase())
      )
    : historyList.value
  
  filtered.forEach(item => {
    const itemDate = new Date(item.created_at || item.createdAt)
    
    if (itemDate >= today) {
      groups.today.push(item)
    } else if (itemDate >= yesterday) {
      groups.yesterday.push(item)
    } else if (itemDate >= lastWeek) {
      groups.lastWeek.push(item)
    } else {
      groups.earlier.push(item)
    }
  })
  
  return groups
})

/**
 * 选择历史会话
 */
const selectHistoryItem = async (item) => {
  try {
    // 加载历史会话
    const success = await loadConversation(item.id)
    
    if (success) {
      resetCanvas()
      // 关闭历史记录侧边栏
      showHistory.value = false
      
      // 滚动到底部
      nextTick(() => {
        scrollToBottom()
      })
    }
  } catch (error) {
    console.error('[Agent] 加载历史会话失败:', error)
  }
}
const agentScrollToBottom = () => {
  nextTick(() => {
    scrollToBottom()
  })
}
provide('agentScrollToBottom', agentScrollToBottom)
/**
 * 删除历史会话
 */
const deleteHistoryItem = async (item, event) => {
  // 阻止事件冒泡，避免触发选择
  event.stopPropagation()
  
  try {
    await ElMessageBox.confirm(
      `确定要删除会话"${item.title}"吗？`,
      '删除会话',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteConversation({ id: item.id })
    
    // 从列表中移除
    historyList.value = historyList.value.filter(h => h.id !== item.id)
    
    ElMessage.success('会话已删除')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('[Agent] 删除会话失败:', error)
      ElMessage.error('删除会话失败')
    }
  }
}

/**
 * 开始新会话
 */
const handleNewConversation = async () => {
  await stopCurrentTask()
  clearMessages()
  startNewConversation()
  showHistory.value = false
  ElMessage.success('已开始新会话')
}

/**
 * 格式化时间
 */
const formatTime = (dateStr) => {
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  
  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }
  
  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前`
  }
  
  // 小于24小时
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前`
  }
  
  // 小于7天
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000)
    return `${days}天前`
  }
  
  // 显示日期
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// Watchers
watch(() => getAgentStore().isOpen, (isOpen) => {
  if (isOpen) {
    if (!isConnected.value) {
      connect()
    }
    
    // 聚焦输入框
    nextTick(() => {
      if (inputRef.value) {
        inputRef.value.focus()
      }
    })
  }
})

watch(messages, () => {
  scrollToBottom()
}, { deep: true })

// Lifecycle
onMounted(() => {
  // loadDatasets()
  // 设置消息处理器（包括新旧格式）
  setMessageHandlers({
    // 旧格式消息处理器
    onThought: handleThoughtMessage,
    onPlan: handlePlanMessage,
    onAction: handleActionMessage,
    onError: handleErrorMessage,
    onComplete: handleCompleteMessage,
    // 新格式消息处理器
    onRunStarted: handleRunStarted,
    onPlanDecision: handlePlanDecision,
    onRunFinished: handleRunFinished,
    onStateUpdate: handleStateUpdate,
    pipelineDebugLlog: handlePipelineDebugLog,
    operatorExplanation: handleOperatorExplanation,
    onMessageConfirm: handleMessageConfirm,
    questionClosely: handleQuestionClosely
  })
  
  // Focus input when panel opens
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus()
    }
  })
})
</script>

<style scoped>
/* ========================================
   Apple Design System - DataFlow Agent Panel
   ======================================== */

/* Panel Container */
.agent-panel {
  position: absolute;
  top: 90px;
  right: 0;
  left: auto;
  bottom: 0;
  width: 760px;
  background: transparent;
  display: flex;
  flex-direction: row;
  z-index: 1000;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  height: auto;
  border-radius: 0;
  box-shadow: 
    -8px 0 24px rgba(0, 0, 0, 0.04),
    -2px 0 8px rgba(0, 0, 0, 0.02);
  box-shadow: none;
  padding-bottom: 20px;
  padding-right: 10px;
  box-sizing: content-box;
}

/* 居中模式样式 */
.agent-panel.center-mode {
  top: 55%;
  left: 50%;
  right: auto;
  bottom: auto;
  width: 800px;
  max-width: 90vw;
  /* height: 600px; */
  max-height: 80vh;
  /* border-radius: 16px; */
  overflow: hidden;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translate(-50%, -50%);
  box-shadow: none;
  padding-bottom: 0;
}
.sidebar-mode{
  left: calc(50% + 140px) !important;
}
/* 居中模式的背景遮罩 */
.agent-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* background: rgba(0, 0, 0, 0.3); */
  /* background: rgba(0, 0, 0, 0); */
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: -1;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.agent-panel.center-mode .main-panel {
  border-left: none;
  /* border-radius: 16px; */
  box-shadow: none;
  overflow: hidden;
}

/* 居中模式下历史侧边栏的圆角 */
.agent-panel.center-mode .history-sidebar {
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
  border-right: 0.5px solid rgba(0, 0, 0, 0.08);
}

/* Main Panel */
.main-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  /* background: #FAFAFA; */
  background: #ffffff1c;
  border-left: 0.5px solid rgba(0, 0, 0, 0.08);
  box-shadow: 
    -8px 0 24px rgba(0, 0, 0, 0.04),
    -2px 0 8px rgba(0, 0, 0, 0.02);
  border-left: none;
  box-shadow: none;
}

/* Panel Slide Animation */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.32, 0.72, 0, 1);
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(100%);
}

/* 居中模式的进入/离开动画 */
.agent-panel.center-mode.panel-slide-enter-from,
.agent-panel.center-mode.panel-slide-leave-to {
  transform: translate(-50%, -50%) scale(0.9);
  opacity: 0;
}

/* ========================================
   Header Section
   ======================================== */
.agent-header {
  flex-shrink: 0;
  /* background: rgba(255, 255, 255, 0.8); */
  background: rgba(255, 255, 255, 0);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  /* border-bottom: 0.5px solid rgba(0, 0, 0, 0.08); */
  padding: 12px 20px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.agent-avatar {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-title {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: #1D1D1F;
  letter-spacing: -0.3px;
  line-height: 1.2;
}

.subtitle-text {
  font-size: 12px;
  font-weight: 400;
  color: #86868B;
  letter-spacing: -0.1px;
  line-height: 1.2;
}

.header-actions {
  display: flex;
  gap: 6px;
}

.header-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868B;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.header-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.header-btn:not(:disabled):hover {
  background: rgba(0, 0, 0, 0.05);
  color: #007AFF;
  transform: scale(1.05);
}

.header-btn:not(:disabled):active {
  background: rgba(0, 0, 0, 0.08);
  transform: scale(0.95);
}

.header-btn.close-btn:not(:disabled):hover {
  background: rgba(255, 59, 48, 0.08);
  color: #FF3B30;
}

/* ========================================
   Conversation Area
   ======================================== */
.conversation-area {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  /* padding: 20px; */
  scroll-behavior: smooth;
  overscroll-behavior: contain;
}
/* 在对话框顶部加一个滤镜 */
.conversation-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 50%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
} 
.conversation-area::-webkit-scrollbar {
  width: 0px;
}

.conversation-area::-webkit-scrollbar-track {
  background: transparent;
  margin: 8px 0;
}

.conversation-area::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.conversation-area::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15);
  background-clip: padding-box;
}

/* ========================================
   Welcome Section
   ======================================== */
.welcome-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0 20px;
  text-align: center;
  animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-icon {
  margin-bottom: 20px;
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.welcome-title {
  font-size: 32px;
  font-weight: 500;
  letter-spacing: 0px;
  color: #164FC9FF;
  animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.3s both;
}
.welcome-title .text{
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 0px;
  margin:0;
  /* 渐变色彩 */
  background: linear-gradient(183.03deg, rgba(25, 96, 246, 1) 0%, rgba(33, 247, 252, 1) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.welcome-description {
  margin: 0 0 32px 0;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 23.17px;
  color: rgba(102, 116, 145, 1);
  animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.4s both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.capabilities {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.capability-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(247, 250, 255, 1);
  /* background: rgba(247, 250, 255, 1); */
  border-radius: 12px;
  text-align: left;
  /* border: 0.5px solid rgba(0, 0, 0, 0.04); */
  /* box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); */
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
}
.capability-item ::v-deep(.el-select__wrapper){
    border-radius: 10px !important;
    background: rgba(0, 0, 0, 0.02);
    /* background: #fff; */
    border: 1px solid rgba(255, 255, 255, 0.08);
    height: 40px;
  }
  ::v-deep(.is-focused) {
    box-shadow: none;
  }
.capability-item:nth-child(1) { animation-delay: 0.5s; }
.capability-item:nth-child(2) { animation-delay: 0.6s; }
.capability-item:nth-child(3) { animation-delay: 0.7s; }

.capability-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: rgba(0, 122, 255, 0.1);
}

.capability-icon {
  font-size: 24px;
  flex-shrink: 0;
  line-height: 1;
}

.capability-text {
  flex: 1;
}

.capability-title {
  font-size: 14px;
  font-weight: 600;
  color: #1D1D1F;
  letter-spacing: -0.2px;
  margin-bottom: 4px;
}

.capability-desc {
  font-size: 12px;
  font-weight: 400;
  color: #86868B;
  letter-spacing: -0.1px;
  line-height: 1.4;
}

.example-prompts {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: slideUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.8s both;
}

.example-label {
  font-size: 12px;
  font-weight: 600;
  color: #86868B;
  letter-spacing: -0.1px;
  text-align: left;
  text-transform: uppercase;
}

.example-btn {
  width: 100%;
  padding: 12px 16px;
  background: white;
  border: 0.5px solid rgba(0, 0, 0, 0.08);
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  color: #007AFF;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  -webkit-tap-highlight-color: transparent;
}

.example-btn:hover {
  background: rgba(0, 122, 255, 0.05);
  border-color: rgba(0, 122, 255, 0.2);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.1);
}

.example-btn:active {
  transform: translateX(2px);
  background: rgba(0, 122, 255, 0.08);
}

/* ========================================
   Thinking Indicator
   ======================================== */
.thinking-indicator {
  display: flex;
  justify-content: flex-start;
  margin: 12px 0;
  animation: fadeIn 0.3s ease-out;
}

.thinking-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  background: white;
  border-radius: 18px;
  border: 0.5px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.thinking-dots {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 2px;
}

.thinking-dots span {
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #007AFF, #5AC8FA);
  border-radius: 50%;
  animation: thinkingBounce 1.4s ease-in-out infinite;
}

.thinking-dots span:nth-child(1) {
  animation-delay: 0s;
}

.thinking-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.thinking-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes thinkingBounce {
  0%, 60%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-8px) scale(1.1);
    opacity: 1;
  }
}

.thinking-text {
  font-size: 13px;
  font-weight: 500;
  color: #86868B;
  letter-spacing: -0.1px;
}

/* ========================================
   Input Area
   ======================================== */
.input-area {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-top: 0.5px solid rgba(0, 0, 0, 0.08);
  /* padding: 16px 20px; */
  border-top: none;
}
.bot-container{
  --bot-height: 106px;
  position: relative;
  height: var(--bot-height);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-left: 80px;
}
.botSty{
  width: 134px;
  height: var(--bot-height);
  position: absolute;
  bottom: 0;
  right: 84px;
}
.offline{
  filter: grayscale(0.8);
}
.bot-text{
  position: relative;
  display: inline-flex;
  margin-bottom: 7px;
  font-size: 32px;
    font-weight: 700;
    letter-spacing: 0px;
    margin: 0;
    background: linear-gradient(183.03deg, rgba(25, 96, 246, 1) 0%, rgba(33, 247, 252, 1) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin-bottom: 10px;
}
.bot-text .img1{
  width: 65px;
  height: 11px;
  position: absolute;
  right: -14px;
  bottom: 14px;
}
.bot-text .img2{
  position: absolute;
  width: 55px;
  height: 17px;
  right: -36px;
  bottom: 7px
}
.welcome-description{
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 26.06px;
  color: rgba(102, 116, 145, 1);
  margin-bottom: 23px;
}
/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 8px;
  /* margin-top: 12px; */
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  justify-content: space-between;
}

.quick-actions::-webkit-scrollbar {
  display: none;
}

.quick-actions-slide-enter-active,
.quick-actions-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.quick-actions-slide-enter-from,
.quick-actions-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.quick-action-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: white;
  border: 1px solid rgba(189, 212, 255, 1);
  /* border-radius: 20px; */
  font-size: 13px;
  font-weight: 500;
  color: rgba(22, 79, 201, 1);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.quick-action-chip:hover {
  background: rgba(0, 122, 255, 0.05);
  border-color: rgba(0, 122, 255, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.12);
}

.quick-action-chip:active {
  transform: scale(0.96);
  background: rgba(0, 122, 255, 0.08);
}

.chip-icon {
  font-size: 14px;
  line-height: 1;
}

.chip-text {
  letter-spacing: -0.1px;
}

/* Input Container */
.input-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-wrapper {
  /* display: flex; */
  align-items: flex-end;
  gap: 10px;
  padding: 12px 14px;
  background: white;
  /* border: 1px solid rgba(0, 0, 0, 0.08); */
  border-radius: 8px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  border: 1px solid;
  box-sizing: border-box;
  border-image: linear-gradient(178.76deg, rgba(8, 246, 252, 1) 0%, rgba(25, 96, 246, 1) 100%) 2;
}

.input-wrapper:focus-within {
  /* border-color: #007AFF; */
  /* box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.08); */
  background: white;
}

.input-textarea {
  width: 100%;
  flex: 1;
  min-height: 24px;
  max-height: 120px;
  padding: 0;
  border: none;
  outline: none;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  resize: none;
  color: #1D1D1F;
  background: transparent;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
}

.input-textarea::placeholder {
  color: #86868B;
  letter-spacing: -0.1px;
}

.input-textarea:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-button {
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  color: #86868B;
  cursor: not-allowed;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  -webkit-tap-highlight-color: transparent;
  padding: 0;
  margin-left: auto;
}

.send-button.active {
  background: linear-gradient(135deg, #007AFF, #5AC8FA);
  color: white;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.25);
}

.send-button.active:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.35);
}

.send-button.active:active {
  transform: scale(0.92);
  box-shadow: 0 1px 4px rgba(0, 122, 255, 0.3);
}

/* Stop Button */
.stop-button {
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF3B30, #FF6B6B);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  -webkit-tap-highlight-color: transparent;
  padding: 0;
  box-shadow: 0 2px 8px rgba(255, 59, 48, 0.25);
  animation: pulseStop 2s ease-in-out infinite;
  margin-left: auto;
}

.stop-button:hover {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(255, 59, 48, 0.35);
}

.stop-button:active {
  transform: scale(0.92);
  box-shadow: 0 1px 4px rgba(255, 59, 48, 0.3);
}

@keyframes pulseStop {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(255, 59, 48, 0.25);
  }
  50% {
    box-shadow: 0 2px 12px rgba(255, 59, 48, 0.4);
  }
}

.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
  transform: scale(0.8) rotate(45deg);
}

.spinner-icon svg {
  animation: spinRotate 1s linear infinite;
}

@keyframes spinRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Status Bar */
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.status-left,
.status-right {
  display: flex;
  align-items: center;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-dot.connected {
  background: #34C759;
  box-shadow: 0 0 8px rgba(52, 199, 89, 0.4);
  animation: connectedPulse 2s ease-in-out infinite;
}

.status-dot.disconnected {
  background: #86868B;
}

@keyframes connectedPulse {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 8px rgba(52, 199, 89, 0.4);
  }
  50% {
    opacity: 0.7;
    box-shadow: 0 0 4px rgba(52, 199, 89, 0.2);
  }
}

.status-label,
.hint-text {
  font-size: 11px;
  font-weight: 400;
  color: #86868B;
  letter-spacing: -0.1px;
}

.hint-text {
  opacity: 0.7;
}

/* ========================================
   History Sidebar - Apple Design
   ======================================== */
.history-sidebar {
  width: 280px;
  flex-shrink: 0;
  /* background: rgba(255, 255, 255, 0.95); */
  background: rgba(255, 255, 255, 1);

  backdrop-filter: blur(30px) saturate(180%);
  -webkit-backdrop-filter: blur(30px) saturate(180%);
  border-right: 0.5px solid rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 
    2px 0 16px rgba(0, 0, 0, 0.04),
    1px 0 4px rgba(0, 0, 0, 0.02);
}

/* History Slide Animation */
.history-slide-enter-active,
.history-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.32, 0.72, 0, 1);
}

.history-slide-enter-from,
.history-slide-leave-to {
  transform: translateX(-100%);
  opacity: 0;
}

/* History Header */
.history-header {
  padding: 16px 20px;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.history-title {
  font-size: 17px;
  font-weight: 600;
  color: #1D1D1F;
  letter-spacing: -0.3px;
  margin: 0;
}

.history-close-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868B;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.history-close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1D1D1F;
}

.history-close-btn:active {
  background: rgba(0, 0, 0, 0.08);
  transform: scale(0.95);
}

/* New Conversation Button */
.new-conversation-btn {
  margin: 12px 16px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #007AFF, #5AC8FA);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.25);
  flex-shrink: 0;
  /* border-radius: 4px; */
  background: #164FC9FF;
}

.new-conversation-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.35);
}

.new-conversation-btn:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(0, 122, 255, 0.2);
}

/* History Search */
.history-search {
  margin: 0 16px 12px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.04);
  border: 0.5px solid rgba(0, 0, 0, 0.06);
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.history-search svg {
  color: #86868B;
  flex-shrink: 0;
}

.history-search:focus-within {
  background: white;
  border-color: #007AFF;
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
}

.history-search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 13px;
  font-weight: 400;
  color: #1D1D1F;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
}

.history-search-input::placeholder {
  color: #86868B;
}

/* History List */
.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px 16px;
  overscroll-behavior: contain;
}

.history-list::-webkit-scrollbar {
  width: 6px;
}

.history-list::-webkit-scrollbar-track {
  background: transparent;
}

.history-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.15);
}

/* Loading State */
.history-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* padding: 40px 20px;
  gap: 12px; */
  color: #86868B;
  font-size: 13px;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(0, 122, 255, 0.2);
  border-top-color: #007AFF;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-spinner.small {
  width: 16px;
  height: 16px;
}

.history-load-more {
  padding: 10px 0;
  text-align: center;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 12px;
  gap: 8px;
}

.history-no-more {
  padding: 10px 0;
  text-align: center;
  color: #999;
  font-size: 12px;
}

.observer-target {
  height: 1px;
  width: 100%;
  margin: 5px 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Empty State */
.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
  color: #86868B;
}

.history-empty svg {
  opacity: 0.3;
}

.history-empty p {
  font-size: 13px;
  font-weight: 400;
  margin: 0;
}

/* History Groups */
.history-groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-label {
  font-size: 11px;
  font-weight: 600;
  color: #86868B;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  padding: 0 4px 4px;
  margin-bottom: 4px;
}

/* History Item */
.history-item {
  position: relative;
  padding: 12px 12px;
  /* background: rgba(0, 0, 0, 0.02); */
  border: 0.5px solid rgba(0, 0, 0, 0.04);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: flex-start;
  gap: 8px;
  /* border-radius: 4px; */
  background: #F7FAFFFF;
}

.history-item:hover {
  background: white;
  border-color: rgba(0, 122, 255, 0.15);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transform: translateX(2px);
}

.history-item.active {
  background: rgba(0, 122, 255, 0.08);
  border-color: rgba(0, 122, 255, 0.3);
}

.history-item.active .history-item-title {
  color: #007AFF;
  font-weight: 600;
}

.history-item:active {
  transform: scale(0.98);
}

.history-item-content {
  flex: 1;
  min-width: 0;
}

.history-item-title {
  font-size: 13px;
  font-weight: 500;
  color: #1D1D1F;
  letter-spacing: -0.1px;
  line-height: 1.4;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.history-item-time {
  font-size: 11px;
  font-weight: 400;
  color: #86868B;
  letter-spacing: -0.05px;
}

.history-item-delete {
  width: 24px;
  height: 24px;
  min-width: 24px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86868B;
  opacity: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.history-item:hover .history-item-delete {
  opacity: 1;
}

.history-item-delete:hover {
  background: rgba(255, 59, 48, 0.1);
  color: #FF3B30;
}

.history-item-delete:active {
  background: rgba(255, 59, 48, 0.15);
  transform: scale(0.9);
}

/* Responsive adjustments */
@media (max-width: 750px) {
  .agent-panel {
    width: 100%;
  }
  
  .history-sidebar {
    width: 260px;
  }
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
  .thinking-text{
    font-size: 13px;
    font-weight: 400;
    color: #86868B;
    margin-right: 8px;
  }
</style>
