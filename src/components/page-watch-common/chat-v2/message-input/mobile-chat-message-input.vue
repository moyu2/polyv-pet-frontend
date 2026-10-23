<!-- 移动端聊天室输入框 -->
<template>
  <div class="c-mobile-chat-message-input">
    <chat-message-input-control>
      <template #suffix>
        <!-- 更多 -->
        <mobile-more-entrance />

        <!-- 打赏 -->
        <mobile-donate-entrance />

        <!-- 商品库入口 -->
        <mobile-product-pendant
          v-if="
            interactSetting.productEnabled &&
            iarSdkLoaded &&
            productEntryLandscapePosition === 'chat'
          "
        />

        <!-- 点赞 -->
        <mobile-chat-like v-if="likeFeatureEnabled" />
      </template>
    </chat-message-input-control>
  </div>
</template>

<script setup lang="ts">
import MobileChatLike from '@/components/page-watch-common/chat-v2/chat-like/index.vue';
import MobileDonateEntrance from '@/components/page-watch-common/donate/donate-entrance/mobile-donate-entrance.vue';
import MobileMoreEntrance from '@/components/page-watch-common/more-popup/mobile-more-entrance/mobile-more-entrance.vue';
import MobileProductPendant from '@/components/page-watch-common/product/product-pendant/mobile-product-pendant.vue';
import { getChatUIV2Pkg } from '@/plugins/external-lib-loaders/load-chat-ui-v2';
import { storeDefinitionToRefs } from '@/plugins/pinia/util';
import { useChannelStore } from '@/store/use-channel-store';
import { useChatStore } from '@/store/use-chat-store';
import { useInteractReceiveStore } from '@/store/use-interact-receive-store';

const PolyvChatUI = getChatUIV2Pkg();

const { ChatMessageInputControl } = PolyvChatUI;

const { likeFeatureEnabled } = storeDefinitionToRefs(useChatStore);

const { interactSetting, iarSdkLoaded } = storeDefinitionToRefs(useInteractReceiveStore);

const { productEntryLandscapePosition } = storeDefinitionToRefs(useChannelStore);
</script>

<style lang="scss">
.c-mobile-chat-message-input {
  padding: 8px 16px 24px;
}
</style>
