<template>
  <div class="mainCont">
    <mainHeader/>
    <messageSpace/>
    <nuxt/> 
    <mainFooter/>
  </div>
</template>

<script>
import messageSpace from "~/components/messageSpace.vue";
import mainFooter from "~/components/footer.vue";
import mainHeader from "~/components/header.vue";

export default {
  components: {
    mainFooter,
    mainHeader,
    messageSpace
  }
};
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
.icon-adjusted {
  padding-left: 6px;
}

.ic{
  width:22px;
  height:22px;
}
</style>
