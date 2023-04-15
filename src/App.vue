<script>
import { set } from 'lodash'
import { darkTheme } from 'naive-ui'

export default {
  data() {
    return {
      // tmp: localStorage.getItem('storedSetting'),
      setting: localStorage.getItem('storedSetting')? JSON.parse(localStorage.getItem('storedSetting')): {
        'theme': {
          'current': 'light',
        },
        'token': {
          'dict': {
            'my1': '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',
            'custom': '',
          },
          'current': 'custom',
        },
        'url': {
          'dict': {
            'official': 'https://api.openai.com/',
            'my1': 'https://api.openai.sitdownkevin.xyz/',
            'my2': 'https://api.openai.aoaojiao.icu/'
          },
          'current': 'my1'
        },
        'mode': {
          'current': 'continuous'
        }
      },

      showTokenModal: false,
      showCustomTokenBtn: false,
    }
  },
  computed: {
    token() {
      return this.setting.token.dict[this.setting.token.current]
    },
    theme() {
      return this.setting.theme.current == 'light'? null: darkTheme
    },
    url() {
      return this.setting.url.dict[this.setting.url.current]
    },
    mode() {
      return this.setting.mode.current
    }
  },
  setup () {
    return {
      darkTheme,
      setting_options: [
        {'value': 'my1', 'label': '我的Token', 'disabled': true},
        {'value': 'custom', 'label': '自定义Token', 'disabled': false}
      ],
      theme_options: [
        {'value': 'light', 'label': '浅色', 'disabled': false},
        {'value': 'dark', 'label': '深色', 'disabled': false}
      ],
      url_options: [
        {'value': 'official', 'label': '官方', 'disabled': false},
        {'value': 'my1', 'label': '节点 1', 'disabled': false},
        {'value': 'my2', 'label': '节点 2', 'disabled': false},
        {'value': 'custom', 'label': '自定义节点', 'disabled': true}
      ],
      mode_options: [
        {'value': 'continuous', 'label': '连续对话', 'disabled': false},
        {'value': 'one', 'label': '单句模式', 'disabled': false}
      ],
    }
  },
  mounted() {
    // this.token = this.tokens[this.cur_token]
    // this.url = this.urls[this.cur_url]
  },
  watch: {
    setting: {
      handler: function(val, oldVal) {
        console.log(this.setting)
        console.log('Setting Saved Locally')
        localStorage.setItem('storedSetting', JSON.stringify(this.setting))
      },
      deep: true
    }

  }
}
</script>
<template>
    <n-config-provider :theme="theme">
    <n-watermark
      content="beta@sitdownkevin"
      cross
      fullscreen
      :font-size="16"
      :line-height="16"
      :width="384"
      :height="384"
      :x-offset="12"
      :y-offset="60"
      :rotate="-15"
    />
    <n-message-provider placement="bottom-left">


    <n-layout position="absolute" has-sider>
      <n-layout-sider collapse-mode="transform" :collapsed-width="70" :width="240" show-trigger="bar"
        content-style="padding: 24px;" bordered :default-collapsed=true refs="siderBar">
        <router-link to="/">
          <n-h2><n-image width="100" src="./vite.svg" preview-disabled/></n-h2>
        </router-link>
        <router-link to="/"><n-h2>对话模式</n-h2></router-link>
        <!-- <router-link to="/pro"><n-h2>......</n-h2></router-link> -->

        <n-card>
          <n-space vertical>
            <n-h5>{{ '设置' }}</n-h5>
            <!-- <n-h5>{{ tmp }}</n-h5> -->
            <!-- token 设置 -->
            <n-button :disabled="showCustomTokenBtn" @click="() => {showTokenModal = !showTokenModal}">
              自定义Token
            </n-button>

            <n-modal v-model:show="showTokenModal">
              <n-card style="width: 600px" title="自定义Token" :bordered="false" size="small" role="dialog" aria-modal="true">
                <template #header-extra>Opps</template>
                <n-card>
                  <!-- Token输入区域 -->
                  <n-input type="text" v-model:value="setting.token.dict.custom" placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"/>
               </n-card>
              </n-card>
            </n-modal>


            <n-cascader
              v-model:value="setting.token.current"
              placeholder="自定义Token"
              :options="setting_options"
              check-strategy="child"
              size="medium"
            />


            <!-- 代理设置 -->
            <n-cascader
              v-model:value="setting.url.current"
              placeholder="节点"
              :options="url_options"
              check-strategy="child"
              size="medium"
            />
            <!-- 主题设置 -->
            <n-cascader
              v-model:value="setting.mode.current"
              placeholder="对话模式"
              :options="mode_options"
              check-strategy="child"
              size="medium"
            />
            <!-- 对话模式设置 -->
            <n-cascader
              v-model:value="setting.theme.current"
              placeholder="主题"
              :options="theme_options"
              check-strategy="child"
              size="medium"
            />
          </n-space>
        </n-card>
      </n-layout-sider>

      <n-layout content-style="padding: 24px;">
        <router-view :url="url" :token="token" :mode="mode"></router-view>
      </n-layout>

    </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<style scoped>


</style>
