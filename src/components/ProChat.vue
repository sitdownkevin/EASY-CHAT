<script>

import { darkTheme } from 'naive-ui'
import katex from "katex"
import 'katex/dist/katex.css'


export default {
    name: "ProChat",
    data() {
        return {
            theme: null
        }
    },
    setup() {
        const equation = "\\displaystyle= \\frac{k(k+1)}{2}+k+1";
        console.log()
        return {
            katex,
            equation,
            darkTheme
        };
    }
}
</script>
<template>
      <n-config-provider :theme="theme">
        <n-card>
        <n-space>
            <n-button @click="theme = darkTheme">
            深色
            </n-button>
            <n-button @click="theme = null">
            浅色
            </n-button>
        </n-space>
        </n-card>
    </n-config-provider>

    <n-config-provider :katex="katex" style="margin-top: 20px;">
        <n-equation :value="equation"/>
    </n-config-provider>

</template>
<style scoped>


</style>