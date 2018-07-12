<template>
  <div class="mainCont">
    <mainHeader/>
    <messageSpace/>
    <nuxt/> 
    <mainFooter/>
  </div>
</template>

<script>
import messageSpace from '~/components/messageSpace.vue'
import mainFooter from '~/components/footer.vue'
import mainHeader from '~/components/header.vue'


export default {
  components: {
    mainFooter,
    mainHeader,
    messageSpace
  }
}
</script>


<style scoped>
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
</style>


<style>
.mainCont {
  justify-content: center;
  height: 100vh;
  width: 70vw;
  display: block;
  margin: auto;
}

mainHeader {
  width: 100vh;
}
.container {
  margin: 0;
  width: 100%;
  padding: 100px 0;
  align-self: center;
}

.textCentered {
  text-align: center;
}

.title {
  color: #000;
  font-weight: 300;
  font-size: 2.5em;
  margin: 0;
}
</style>
