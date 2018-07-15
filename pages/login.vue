<template>
  <section class="container">
    <div class="textCentered">
      <h1 class="title">
        LOGIN
      </h1>
    </div>
    <hr>
    <form action="/login" method="POST">
      <div class="field">
        <label class="label">Email</label>
        <div class="control">
          <input class="input" type="text" v-model="form.email" placeholder="Email" value="">
        </div>
      </div>
      <div class="field">
        <label class="label">Password</label>
        <div class="control">
          <input class="input" type="password" v-model="form.password" placeholder="Password"  value="">
        </div>
      </div>
      <div class="control">
        <input type="button" class="button is-link" @click="login()" value="Log in">
      </div>
      <div class="control">
        <input type="button" class="button" href="/auth/google" value="Log in with Google">
      </div>
    </form>
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
        email: "",
        password: "",
        error: null
      }
    };
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
      // TODO: clean this call up
      this.$parent.$parent.$children[1].msgOn("info", true, msg);
    }
  },
  mounted() {
    console.log(this.$store);
  }
};
</script>

<style scoped>
form {
  width: 15vw;
  margin: auto;
}
</style>
