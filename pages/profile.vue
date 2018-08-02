<template>
  <section class="container">
    <div class="textCentered">
      <h1 class="title">
        PROFILE
      </h1>
    </div>
    <hr>
    <div class="profileSetting">
      <div class="box" @click="expand('profileChangePassTab')">
        Change password
      </div> 
      <transition name="expand">
        <div v-if="expands.profileChangePassTab" class="profileSettingContent" ref="profileChangePassTab">
          <form>
            the form
          </form>
        </div> 
      </transition>
    </div>
  </section>
</template>

<script>
import axios from "~/plugins/axios";

export default {
  head() {
    return {
      title: "Login",
    };
  },
  data() {
    return {
      expands:{
        profileChangePassTab:false
      }
    };
  },
  created(){
    if (!this.$store.state.user) {
      return this.$router.replace({ path: 'login' });
    }
  },
  methods: {
    expand(item){
      this.expands[item]=!this.expands[item];
    },
    msg(type, state, msg) {
      //todo cleanup
      this.$parent.$parent.$children[1].msgOn(type, true, msg);
    },
    itemMouseOver(item){
      
    }
  }
};
</script>

<style scoped>
.profileSetting{
  width:40%;
  margin:auto;
  margin-bottom:0px;
  cursor:pointer;
}

.expand-enter-active, .expand-leave-active {
  transition: opacity .1s;
}
.expand-enter{
  opacity:100%;
}

.expand-leave-to{
  opacity:0%;
}

.profileSettingContent{
  background:#dddddd;
}

</style>
