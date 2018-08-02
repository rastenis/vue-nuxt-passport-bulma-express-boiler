<template>
  <section class="container">
    <div class="textCentered">
      <h1 class="title">
        PROFILE
      </h1>
    </div>
    <hr>
    <div class="profileSetting">
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
    };
  },
  created(){
    if (!this.$store.state.user) {
      return this.$router.replace({ path: 'login' });
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
