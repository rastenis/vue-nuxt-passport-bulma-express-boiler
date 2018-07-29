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
        <label class="label">Email</label>
        <div class="control">
          <input v-bind:class="getInputStyle('email')" type="email" name="username" v-model="form.email.value" placeholder="Email" value="">
          <p v-if="form.email.error" class="help is-danger">{{form.email.errorMsg}}</p>
        </div>
      </div>
      <div class="field">
        <label class="label">Password</label>
        <div class="control">
          <input v-bind:class="getInputStyle('password')" type="password" placeholder="Password" name="password" v-model="form.password.value" value="">
          <p v-if="form.password.error" class="help is-danger">{{form.password.errorMsg}}</p>
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
        email:{
          error:false,
          errorMsg:null,
          value:""
        },
        password:{
          error:false,
          errorMsg:null,
          value:""
        }
      },
      
    };
  },
  methods:{
    getInputStyle:function getInputStyle(type){
      let classes="input ";
      if (this.form[type].error) {
        // setting as error
        classes+="is-danger";
      }
      return classes;
    },
    resetErrors(){
      for (const key in this.form) {
        if (this.form.hasOwnProperty(key) ||typeof this.form[key].error !=="undefined") {
          this.form[key].error=false;
        }
      }
    },
    async register() {
      this.resetErrors();
      // simple local checks first
      // basic email check
      if (!(/\S+@\S+\.\S+/.test(this.form.email.value))) {
        this.form.email.error=true;
        this.form.email.errorMsg="Enter a valid email address.";
        return;
      }else if (this.form.password.value.length<5 || his.form.password.value.length>100) { // arbitrary
        this.form.password.error=true;
        this.form.password.errorMsg="Password must be between 5 and a 100 characters.";
        return;
      }

      // attempting to proceed with the registration
      try {
        await this.$store.dispatch('register', {
          email: this.form.email,
          password: this.form.password
        });
        this.form.email = '';
        this.form.password = '';
        this.form.error = null;
        this.msg( 'info', true, "You have successfully created an account!");
        this.$nuxt._router.push('/');
      } catch (err) {
        this.msg( 'error', true,err.meta.msg);
      }
    },
    msg(type,state,msg){
      // TODO: clean this call up
      this.$parent.$parent.$children[1].msgOn( 'info',true, msg)
    }
  },
}
</script>

<style scoped>
form {
  width: 15vw;
  margin: auto;
}
</style>
