<template>
  <div class="mainCont">
    <mainHeader/>
    <nuxt/> 
    <mainFooter/>
  </div>
</template>

<script>
import mainFooter from '~/components/Footer.vue'
import mainHeader from '~/components/Header.vue'


export default {
  components: {
    mainFooter,
    mainHeader
  }
}
</script>

<style>
.mainCont {
  justify-content: center;
  height: 100vh;
}

.button,
.button:visited {
  display: inline-block;
  color: black;
  letter-spacing: 1px;
  background-color: #fff;
  border: 2px solid #000;
  text-decoration: none;
  text-transform: uppercase;
  padding: 15px 45px;
}

.button:hover,
.button:focus {
  color: #fff;
  background-color: #000;
}

.title {
  color: #000;
  font-weight: 300;
  font-size: 2.5em;
  margin: 0;
}
</style>
