<template>
  <div class="container">
    <h1>话费充值</h1>
    <input v-model="phone" placeholder="请输入手机号" />
    <input v-model="amount" placeholder="请输入充值金额" />
    <button @click="recharge">充值</button>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const phone = ref('')
const amount = ref('')
const message = ref('')

const recharge = async () => {
  try {
    const res = await axios.post('https://api.example.com/recharge', {
      phone: phone.value,
      amount: amount.value
    })
    message.value = res.data.message || '充值成功'
  } catch (err) {
    message.value = '充值失败，请稍后再试'
  }
}
</script>

<style scoped>
.container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  text-align: center;
}
input {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 8px;
}
button {
  padding: 10px 20px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
}
</style>
