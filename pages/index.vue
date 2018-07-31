<template>
  <section class="container">
    <img src="~assets/img/logo.png" alt="Nuxt.js Logo" class="logo" />
    <h1 class="title">
      WELCOME
    </h1>
    <ul v-if="$store.state.user && users!=null" class="users">
      <li v-for="(user, index) in users" :key="index" class="user">
        <nuxt-link :to="userPath(index)">
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
  head() {
    return {
      title: "Users"
    };
  },
  data(){
    return {
      users:null
    };
  },
  methods: {
    userPath(index) {
      return `/${index}`;
    }
  },
  created(){
     this.$nextTick(() => {
       if (!this.$nuxt.$loading) {
         return;
       }

      this.$nuxt.$loading.start()
      if (this.$store.state.user) {
      let {data} = axios.get("/api/users").then( (response)=> {
        this.$nuxt.$loading.finish();
        this.users=response.data;
      });
      }else{
        this.$nuxt.$loading.finish();
      }
    })
  
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
  font-size: 15px;
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
