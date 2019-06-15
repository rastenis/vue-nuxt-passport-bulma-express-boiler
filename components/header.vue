<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <nuxt-link to="/" class="navbar-item"><h1>vue-nuxt-passport-bulma-express-boiler</h1></nuxt-link>
    </div>
      <div class="navbar-end" v-if="$store.state.user">
        <nuxt-link to="/profile"  class="navbar-item">Profile</nuxt-link>
        <a @click="logout()"  class="navbar-item" style="color:darkRed;">Logout</a>
      </div>
      <div class="navbar-end" v-else>
        <nuxt-link to="/login" class="navbar-item">Login</nuxt-link>
        <nuxt-link to="/register" class="navbar-item">Register</nuxt-link>
      </div>
  </nav>
</template>
 
<script>
import axios from "~/plugins/axios";

export default {
  methods:{
    async logout() {
      try {
        await this.$store.dispatch("logout", {});
        this.msg( "info", true,"You have successfully logged out!");
        this.$nuxt._router.push("/");
      } catch (err) {
        this.msg("error", true,err.meta.msg);
      }
    },
    msg(type,state,msg){
      // TODO: clean this call up
      this.$parent.$children[1].msgOn( "info",true, msg);
    },
  },
};
</script>
