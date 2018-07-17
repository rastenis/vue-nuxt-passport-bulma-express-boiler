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
        <div class="button" type="link" style="margin-top:2vh;">
          <ion-icon size="small" name="logo-google"></ion-icon>
          <a href="/auth/google" class="icon-adjusted">Log in with Google</a>
        </div>
         <div class="button" type="link" style="margin-top:2vh;">
          <ion-icon size="small" name="logo-twitter"></ion-icon>
          <a href="/auth/twitter" class="icon-adjusted">Log in with Twitter</a>
        </div>
      </div>
    </form>
  </section>
</template>

<script>
import axios from "~/plugins/axios";

export default {
  head() {
    return {
      title: "Login",
      // the dinamically loading icons must be imported separately on each page that requires them.
      // global loading is not possible unless all icons are loaded
      script: [{ src: "https://unpkg.com/ionicons@4.2.4/dist/ionicons.js" }]
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
  }
};
</script>

<style scoped>
form {
  width: 15vw;
  margin: auto;
}

.icon-adjusted {
  padding-left: 6px;
}
</style>
