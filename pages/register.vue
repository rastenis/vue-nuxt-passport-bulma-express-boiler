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
          <input class="input" type="text" placeholder="Username" value="">
        </div>
      </div>
      <div class="field">
        <label class="label">Password</label>
        <div class="control">
          <input class="input" type="password" placeholder="Password"  value="">
        </div>
      </div>
      <div class="control">
        <input type="submit" class="button is-primary" value="Register">
      </div>
    </form>
  </section>
</template>

<script>
import axios from '~/plugins/axios'

export default {
  head () {
    return {
      title: 'Login'
    }
  }
}
</script>

<style scoped>
form {
  width: 15vw;
  margin: auto;
}
</style>
