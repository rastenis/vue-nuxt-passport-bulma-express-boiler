<template>
  <section v-if="!$store.state.user" class="container">
    <div class="has-text-centered">
      <h1 class="title">LOGIN</h1>
    </div>
    <hr>
    <form action="/login" method="POST">
      <div class="field">
        <label class="label">Email</label>
        <div class="control">
          <input class="input" type="text" v-model="form.email" placeholder="Email" value>
        </div>
      </div>
      <div class="field">
        <label class="label">Password</label>
        <div class="control">
          <input
            class="input"
            type="password"
            v-model="form.password"
            placeholder="Password"
            @keyup.enter="login()"
            value
          >
        </div>
      </div>

      <div class="control">
        <input type="button" class="button is-link" @click="login()" value="Log in">
      </div>
      <div class="control">
        <div class="button" type="link" style="margin-top:2vh;">
          <img class="ic" src="/i/google.svg">
          <a href="/auth/google" class="icon-adjusted">Log in with Google</a>
        </div>
        <div class="button" type="link" style="margin-top:1vh;">
          <img class="ic" src="/i/twitter.svg">
          <a href="/auth/twitter" class="icon-adjusted">Log in with Twitter</a>
        </div>
      </div>
    </form>
  </section>
</template>

<script>
import axios from "axios";

export default {
  head() {
    return {
      title: "Login"
    };
  },
  data() {
    return {
      form: {
        email: "",
        password: "",
        error: null
      }
    };
  },
  created() {
    if (this.$store.state.user) {
      this.$router.push("/");
      return;
    }
  },
  methods: {
    async login() {
      try {
        await this.$store.dispatch("login", {
          email: this.form.email,
          password: this.form.password
        });
        this.form.email = "";
        this.form.password = "";
        this.form.error = null;
        this.msg("info", true, "You have successfully logged in!");
        this.$nuxt._router.push("/");
      } catch (err) {
        console.log(err);
        this.msg("error", true, err.meta.msg);
      }
    },
    msg(type, state, msg) {
      //todo cleanup
      this.$parent.$parent.$children[1].msgOn(type, true, msg);
    }
  }
};
</script>

<style scoped>
form {
  width: 15vw;
  margin: auto;
}
</style>
