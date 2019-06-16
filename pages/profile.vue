<template>
  <section v-if="$store.state.user" class="container">
    <div class="has-text-centered">
      <h1 class="title">PROFILE</h1>
    </div>
    <hr>
    <div class="modal" v-bind:class="{'is-active':modals.main.open}">
      <div class="modal-background"></div>
      <div class="modal-content">
        <div class="box has-text-centered">
          <p>{{modals.main.msg}}</p>
          <hr>
          <div class="has-text-centered">
            <button class="button" @click="askConfirmation(false)">Cancel</button>
            <button
              class="button is-danger"
              @click="modals.main.callback(); askConfirmation(false)"
            >Yes</button>
          </div>
        </div>
      </div>
      <button class="modal-close is-large" aria-label="close"></button>
    </div>
    <div v-if="meta.hasPassword" class="profileSetting">
      <div class="box">Change password</div>
      <form>
        <div class="field">
          <label class="label">Current Password</label>
          <div class="control">
            <input
              v-bind:class="getPasswordResetInputStyle('password')"
              type="password"
              name="password"
              v-model="form.password.value"
              placeholder="Current Password"
              value
            >
            <p v-if="form.password.error" class="help is-danger">{{form.password.errorMsg}}</p>
          </div>
        </div>
        <div class="field">
          <label class="label">New Password</label>
          <div class="control">
            <input
              v-bind:class="getPasswordResetInputStyle('newPassword')"
              type="password"
              placeholder="New Password"
              name="newPassword"
              v-model="form.newPassword.value"
              value
            >
            <p v-if="form.newPassword.error" class="help is-danger">{{form.newPassword.errorMsg}}</p>
          </div>
        </div>
        <div class="field">
          <label class="label">Repeat New Password</label>
          <div class="control">
            <input
              v-bind:class="getPasswordResetInputStyle('newPasswordRep')"
              type="password"
              placeholder="Repeat New Password"
              name="newPasswordRep"
              v-model="form.newPasswordRep.value"
              value
            >
            <p
              v-if="form.newPasswordRep.error"
              class="help is-danger"
            >{{form.newPasswordRep.errorMsg}}</p>
          </div>
        </div>
        <div class="control">
          <input
            type="button"
            class="button is-primary"
            @click="changePassword()"
            value="Change password"
          >
        </div>
      </form>
    </div>
    <div class="profileSetting">
      <div class="box">Manage linked accounts</div>
      <div class="field">
        <label class="label">Google</label>
        <p v-if="$store.state.user?$store.state.user.data.google:false">
          You have already linked your Google account.
          <!-- showing unlink button only if user can sign in via email/password OR has another social sign in -->
          <a
            v-if="meta.hasPassword ||($store.state.user?$store.state.user.data.tokens.length>1:false)"
            @click="unlink('google')"
          >Unlink.</a>
        </p>
        <div v-else>
          <div class="button" type="link" style="margin-top:2vh;">
            <img class="ic" src="/i/google.svg">
            <a href="/auth/google" class="icon-adjusted">Link Google account</a>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label">Twitter</label>
        <p v-if="$store.state.user?$store.state.user.data.twitter:false">
          You have already linked your Twitter account.
          <!-- showing unlink button only if user can sign in via email/password OR has another social sign in -->
          <a
            v-if="meta.hasPassword ||($store.state.user?$store.state.user.data.tokens.length>1:false)"
            @click="unlink('twitter')"
          >Unlink.</a>
        </p>
        <div v-else>
          <div class="button" type="link" style="margin-top:1vh;">
            <img class="ic" src="/i/twitter.svg">
            <a href="/auth/twitter" class="icon-adjusted">Log in with Twitter</a>
          </div>
        </div>
      </div>
      <hr>
      <div style="text-align: center;">
        <a
          style="color:DarkRed;"
          @click="askConfirmation(true, 'Are you sure? This is irreversible.', deleteAccount)"
        >Delete account</a>
      </div>
    </div>
  </section>
</template>

<script>
import axios from "~/plugins/axios";

export default {
  head() {
    return {
      title: "Login"
    };
  },
  data() {
    return {
      form: {
        password: {
          error: false,
          errorMsg: null,
          value: ""
        },
        newPassword: {
          error: false,
          errorMsg: null,
          value: ""
        },
        newPasswordRep: {
          error: false,
          errorMsg: null,
          value: ""
        }
      },
      meta: {
        hasPassword: false
      },
      modals: {
        main: {
          open: false,
          msg: "",
          callback: null
        }
      }
    };
  },
  created() {
    if (!this.$store.state.user) {
      this.$router.push("/");
      return;
    }

    // checking if account contains password i.e isn't created form a token of some sort
    // checking for hashed pw

    if (this.$store.state.user.data.password) {
      this.meta.hasPassword = true;
    }
  },
  methods: {
    msg(type, state, msg) {
      //todo cleanup
      this.$parent.$parent.$children[1].msgOn(type, true, msg);
    },
    askConfirmation(show, msg, cb) {
      this.modals.main.msg = msg;
      this.modals.main.open = show;
      this.modals.main.callback = cb;
    },
    getPasswordResetInputStyle: function getPasswordResetInputStyle(type) {
      let classes = "input ";
      if (this.form[type].error) {
        classes += "is-danger";
      }
      return classes;
    },
    resetErrors() {
      for (const key in this.form) {
        if (
          this.form.hasOwnProperty(key) ||
          typeof this.form[key].error !== "undefined"
        ) {
          this.form[key].error = false;
        }
      }
    },
    clearValues() {
      for (const key in this.form) {
        if (
          this.form.hasOwnProperty(key) ||
          typeof this.form[key].error !== "undefined"
        ) {
          this.form[key].value = "";
        }
      }
    },
    async changePassword() {
      this.resetErrors();

      if (
        this.form.newPassword.value.length < 5 ||
        this.form.newPassword.value.length > 100
      ) {
        // arbitrary
        this.form.password.error = true;
        this.form.password.errorMsg =
          "Password must be between 5 and a 100 characters.";
        return;
      }

      if (this.form.newPassword.value !== this.form.newPasswordRep.value) {
        this.form.newPasswordRep.error = true;
        this.form.newPasswordRep.errorMsg = "Passwords do not match!";
        return;
      }

      try {
        await this.$store.dispatch("changePassword", {
          password: this.form.password.value,
          newPassword: this.form.newPassword.value,
          newPasswordRep: this.form.newPasswordRep.value
        });
        this.clearValues();
        this.msg("info", true, "You have successfully changed your password!");
        this.$router.push("/");
      } catch (err) {
        this.msg("error", true, err.meta.msg);
      }
    },
    async unlink(target) {
      this.resetErrors();

      try {
        await this.$store.dispatch("unlink", {
          toUnlink: target
        });
        this.msg(
          "info",
          true,
          `You have successfully unlinked your ${target} account!`
        );
      } catch (err) {
        this.msg("error", true, err.meta.msg);
      }
    },
    async deleteAccount() {
      try {
        await this.$store.dispatch("deleteAccount", {});
        this.msg("info", true, `You have successfully deleted your account!`);
        this.$router.push("/");
      } catch (err) {
        this.msg("error", true, err.meta.msg);
      }
    }
  }
};
</script>

<style scoped>
.profileSetting {
  width: 40%;
  margin: auto;
  margin-bottom: 2vh;
  cursor: pointer;
}
</style>
