<template>
  <section class="container">
    <div class="textCentered">
      <h1 class="title">
        REGISTER
      </h1>
    </div>
    <hr>
    <form action="/register" method="POST">
      <div class="field">
        <label class="label">Username</label>
        <div class="control">
          <input class="input" type="text" name="username" v-model="form.username" placeholder="Username" value="">
        </div>
      </div>
      <div class="field">
        <label class="label">Password</label>
        <div class="control">
          <input class="input" type="password" placeholder="Password" name="password" v-model="form.password" value="">
        </div>
      </div>
      <div class="control">
        <input type="button" class="button is-primary" @click="register()" value="Register">
      </div>
    </form>
  </section>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  head () {
    return {
      title: 'Register'
    }
  },
  data(){
    return {
      form:{
        username:"",
        password:"",
        error:null
      },
      
    };
  },
  methods:{
    async register() {
      console.log("ok");
      try {
        await this.$store.dispatch('register', {
          username: this.form.username,
          password: this.form.password
        });
        this.form.username = '';
        this.form.password = '';
        this.form.error = null;
        this.msg( 'info', true,"You have successfully created an account!");
        this.$nuxt._router.push('/');
      } catch (err) {
        console.log("err is "+err);
        this.msg( 'error', true,err.msg);
      }
    },
    msg(type,state,msg){
      // TODO: clean this call up
      this.$parent.$parent.$children[1].msgOn( 'info',true, msg)
    }
  },
 mounted(){
   console.log(this.$store);
 }
}
</script>

<style scoped>
form {
  width: 15vw;
  margin: auto;
}
</style>
