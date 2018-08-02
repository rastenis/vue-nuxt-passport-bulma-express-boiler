<template>
  <section class="container">
    <div class="textCentered">
      <h1 class="title">
        PROFILE
      </h1>
    </div>
    <hr>
    <div v-if="meta.hasPassword" class="profileSetting">
      <div class="box">
        Change password
      </div> 
        <form action="/register" method="POST">
          <div class="field">
            <label class="label">Current Password</label>
            <div class="control">
              <input v-bind:class="getPasswordResetInputStyle('password')" type="password" name="password" v-model="form.password.value" placeholder="Current Password" value="">
              <p v-if="form.password.error" class="help is-danger">{{form.password.errorMsg}}</p>
            </div>
          </div>
          <div class="field">
            <label class="label">New Password</label>
            <div class="control">
              <input v-bind:class="getPasswordResetInputStyle('newPassword')" type="password" placeholder="New Password" name="newPassword" v-model="form.newPassword.value" value="">
              <p v-if="form.newPassword.error" class="help is-danger">{{form.newPassword.errorMsg}}</p>
            </div>
          </div>
          <div class="field">
            <label class="label">Repeat New Password</label>
            <div class="control">
              <input v-bind:class="getPasswordResetInputStyle('newPasswordRep')" type="password" placeholder="Repeat New Password" name="newPasswordRep" v-model="form.newPasswordRep.value" value="">
              <p v-if="form.newPasswordRep.error" class="help is-danger">{{form.newPasswordRep.errorMsg}}</p>
            </div>
          </div>
          <div class="control">
            <input type="button" class="button is-primary" @click="register()" value="Register">
          </div>
        </form>
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
       form:{
        password:{
          error:false,
          errorMsg:null,
          value:""
        },
        newPassword:{
          error:false,
          errorMsg:null,
          value:""
        },
          newPasswordRep:{
          error:false,
          errorMsg:null,
          value:""
        }
      },
      meta:{
        hasPassword:false
      }
    };
  },
  created(){
    if (!this.$store.state.user) {
      return this.$router.replace({ path: 'login' });
    }

    // checking if account contains password i.e isn't created form a token of some sort
    // checking for hashed pw
    if (this.$store.state.user.data.password!==null&&typeof this.$store.state.user.data.password!=='undefined') {
      this.meta.hasPassword=true;
    }
  },
  methods: {
    msg(type, state, msg) {
      //todo cleanup
      this.$parent.$parent.$children[1].msgOn(type, true, msg);
    },
    getPasswordResetInputStyle:function getPasswordResetInputStyle(type){
      let classes="input ";
      if (this.form[type].error) {
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
    clearValues(){
      for (const key in this.form) {
        if (this.form.hasOwnProperty(key) ||typeof this.form[key].error !=="undefined") {
          this.form[key].value="";
        }
      }
    },
    async register() {
      this.resetErrors();
      
      if (this.form.newPassword.value.length<5 || this.form.newPassword.value.length>100) { // arbitrary
        this.form.password.error=true;
        this.form.password.errorMsg="Password must be between 5 and a 100 characters.";
        return;
      }

      if (this.form.newPassword!==this.form.newPasswordRep) {
        this.form.newPasswordRep.error=true;
        this.form.newPasswordRep.errorMsg="Passwords do not match!";
        return;
      }

      try {
        await this.$store.dispatch('passwordChange', {
          password: this.form.password.value,
          password: this.form.password.value
        });
        this.clearValues();
        this.msg( 'info', true, "You have successfully changed your password!");
        this.$router.push('/');
      } catch (err) {
        this.msg( 'error', true,err.meta.msg);
      }
    },

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


</style>
