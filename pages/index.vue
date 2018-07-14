<template>
  <section class="container">
    <img src="~assets/img/logo.png" alt="Nuxt.js Logo" class="logo" />
    <h1 class="title">
      WELCOME
    </h1>
    <ul v-if="$store.state.user" class="users">
      <li v-for="(user, index) in users" :key="index" class="user">
        <nuxt-link :to="{ name: "id", params: { id: index }}">
          {{ user.name }}
        </nuxt-link>
      </li>
    </ul>
    <h4 v-else class="subTitle">
      Log in to see users.
    </h4>

  </section>
</template>

<script>
import axios from "~/plugins/axios";

export default {
  async asyncData () {
    let { data } = await axios.get("/api/users");
    return { users: data };
  },
  head () {
    return {
      title: "Users"
    };
  }
};
</script>

<style scoped>
.title {
  margin: 30px 0;
  text-align: center;
}

.subTitle {
  margin: 30px 0;
  text-align: center;
  font-size:15px;
}
.users {
  list-style: none;
  margin: 0;
  padding: 0;
}

.container {
  text-align: center;
}

.user {
  margin: 10px 0;
}
</style>
