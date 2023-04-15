<script>
import { useThemeVars } from 'naive-ui'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import axios from 'axios'
import { useMessage } from "naive-ui";


export default {
    name: 'ChatRoom',
    data() {
        return {
            cur_input: "你好",
            chat_buffer: [],
            chat_history: [],
            avoid_freq_req: {
                'isAllow': true,
                'lastTime': Date.parse(new Date()) - 10000,
                'count': 0,
            },
            isWrite: false,
        }
    },
    created() {
    },
    setup() {
        return {
            themeVars: useThemeVars(),
            allowTimeSeg: 10000,
            allowQstionNums: 7,
            message: useMessage(),
        }
    },
    methods: {
        // 判断是否花钱
        doSpendMoneyCurReq: function() {
            var now = Date.parse(new Date())
            if ((now - this.avoid_freq_req.lastTime < this.allowTimeSeg)) {
                // 发送过于频繁
                this.message.warning('发送过于频繁 10秒后尝试')
                return false
            }
            else {
                // 在avoid_freq_req中记录本次发送
                this.avoid_freq_req.count += 1
                this.avoid_freq_req.lastTime = now
                return true
            }  
        },
        sendQuestion: function () {
            if (this.cur_input.length == 1) {
                // 空白消息检测
                this.cur_input = null
                this.message.warning('不要发送空白消息')
                return
            }
            if (!this.doSpendMoneyCurReq()) {
                // 判断是否为本次花钱
                this.cur_input = this.cur_input.substring(0, this.cur_input.length - 1)
                return
            }
            // 模式检测 -> 单句模式 or 连续对话
            if (this.$props.mode == 'one') {
                this.avoid_freq_req.count = 1
                this.chat_buffer = [{"role": "user", "content": this.cur_input}]
            }
            else if (this.$props.mode == 'continuous' && this.avoid_freq_req.count > this.allowQstionNums) {
                // debug: console.log(this.avoid_freq_req.count)
                this.chat_buffer.reverse().pop() 
                this.chat_buffer.reverse().pop()
                this.chat_buffer.push(
                    {"role": "user", "content": this.cur_input}
                )
            }
            else {
                this.chat_buffer.push(
                    {"role": "user", "content": this.cur_input}
                )
            }

            this.chat_history.push({"role": "user", "content": this.cur_input})
            this.useOpenApi()
            this.cur_input = null
        },
        writeMsgIntoBubble: function(msg) {
            this.toBottom()
            this.chat_buffer[this.chat_buffer.length - 1]['content'] = this.chat_buffer[this.chat_buffer.length - 1]['content'] + msg
            this.chat_history[this.chat_history.length - 1]['content'] = this.chat_history[this.chat_history.length - 1]['content'] + msg
        },
        useOpenApi: async function () {
            const headers = {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.$props.token,
            }
            const payload = {
                "model": "gpt-3.5-turbo",
                "messages": this.chat_buffer,
                "stream": true
            }
            // class RetriableError extends Error { }
            // class FatalError extends Error { }
            fetchEventSource(
                this.$props.url + 'v1/chat/completions',
                {
                    method: 'post',
                    headers: headers,
                    body: JSON.stringify(payload),
                    onopen: (res) => {
                        console.log(res)
                        this.chat_buffer.push(
                            {"role": "assistant", "content": ""}
                        )
                        this.chat_history.push(
                            {"role": "assistant", "content": ""}
                        )
                        this.$refs.scrollBar.scrollTop = this.$refs.scrollBar.scrollHeight;
                    },
                    onmessage: (msg) => {
                        // if the server emits an error message, throw an exception
                        // so it gets handled by the onerror callback below:
                        // if (msg.event === 'FatalError') {
                        //     throw new FatalError(msg.data);
                        // }
                        try {
                            var info = JSON.parse(msg.data)['choices'][0]['delta']
                            if (Object.keys(info)[0] == 'content') {
                                this.writeMsgIntoBubble(info['content'])
                            }
                        }
                        catch {
                            // console.log(msg)
                            if (msg.data == '[DONE]') {
                                var timeSpend = Date.parse(new Date()) - this.avoid_freq_req.lastTime
                                this.message.success('回答完毕 用时' + parseFloat(timeSpend / 1000) + '秒')
                            }
                            // this.message.error(msg)
                        }
                    },
                    onclose() {
                        // if the server closes the connection unexpectedly, retry:
                        // throw new RetriableError();
                        // this.message.error('连接断开')
                    },
                    onerror(err) {
                        // if (err instanceof FatalError) {
                        //     throw err; // rethrow to stop the operation
                        // } else {
                        //     // do nothing to automatically retry. You can also
                        //     // return a specific retry interval here.
                        // }
                        // this.message.error('发生错误')
                    }
                }
            )
            // 
        },
        useOpenApiNotStream: async function() {
            const headers = {
                "Content-Type": "application/json",
                "Authorization": "Bearer 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",
            }
            const payload = {
                "model": "gpt-3.5-turbo",
                "messages": this.chat_buffer,
            }
            // 创建axios实例
            const aa = axios.create({
                baseURL: 'https://api.openai.sitdownkevin.xyz/',
                headers: headers,
            })
            aa.post(
                'v1/chat/completions',
                payload
            )
                .then((res) => {
                    console.log(res.data)
                    var ans = res.data["choices"][0]["message"]
                    this.chat_buffer.push(ans)
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        // 滚动到最底部
        toBottom(){
            this.$refs.scrollBar.scrollTop = this.$refs.scrollBar.scrollHeight;
        },
    },
    props: {
        'url': String,
        'token': String,
        'mode': String,
    },
    watch: {
        url: function (before, after) {
            this.message.info('节点切换至 ' + before)
        },
        mode: function (before, after) {
            this.message.info('模式切换至 ' + {'one': '单句模式', 'continuous': '连续模式'}[before])
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.$refs.inputArea.focus()
        })
        this.message.info('这是一个调用了OpenAI API的ChatGPT聊天机器人')
    }
}
</script>

<template>
    <!-- <n-h1>{{ chat_buffer }}</n-h1> -->
    <div id="chat-history" style="position: absolute; max-height: calc(100% - 180px); width: calc(100% - 48px);" ref="scrollBar">
        <n-space vertical>
            <div
                v-for="chat in chat_history" class="chat-bubble" :id="chat.role"
                style="color: var(--primary-color); transition: .3s var(--cubic-bezier-ease-in-out); display: inline-block; overflow-wrap: break-word;"
                :style="chat.role == 'user'? 
                'background-color: ' + themeVars['clearColor'] + '; color: ' + themeVars['textColorBase']:
                'background-color: ' + themeVars['buttonColor2'] + '; color: ' + themeVars['textColorBase']"
            >
                <span>{{ chat.content }}</span>
            </div>
        </n-space>
    </div>


    <div id="bottom-input" style="position: absolute; bottom: 10px; width: calc(100% - 48px); height: 100px;">
        <n-input
            type="textarea"
            placeholder="回车键发送"
            style="width: 61%; position: absolute; bottom: 36px; text-align: left;"
            :autosize="{
                minRows: 3
            }"
            clearable
            maxlength="1400" show-count
            v-model:value="cur_input"
            ref="inputArea"
            @keyup="(e) => {if (e.keyCode == 13) sendQuestion();}"
        />
        <!-- <n-button 
            type="primary" style="position: absolute; right: 10%; bottom: 36px; width: 60px; background-color: #2782D7; color: white"
        >
            发送
        </n-button> -->
    </div>

</template>


<style scoped>
#chat-history {
    overflow-y: scroll;
    width: calc(100%);
    height: auto;
    /* border: 1px solid black; */
}

#bottom-input {
    display: flex;
    flex-direction: column;
    align-items: center;
    /* justify-content: center; */
}

.chat-bubble {
    margin-top: 10px;
    margin-bottom: 10px;
    max-width: 55%;
    padding: 10px;
    border-radius: 12px;
    text-align: left;
    /* min-height: 12px; */
}

#user.chat-bubble {
    float: right;
    margin-right: 70px;
    /* background-color: #2782D7; */
    /* color: black; */
}

#assistant.chat-bubble {
    float: left;
    margin-left: 70px;
    /* background-color: #EA6853; */
    /* color: white; */
}

</style>