import Vuex from "vuex"
import axios from "axios"

const util = require('util');

const store = () => new Vuex.Store({
  state: {
    user: null,
  },
  mutations: {
    SET_USER: function SET_USER(state, user) {
      state.user = user;
    }
  },
  actions: {
    nuxtServerInit({
      commit
    }, {
      req
    }) {
      if (req.session && req.session.user) {
        commit("SET_USER", req.session.user)
      }
    },
    login({
      commit
    }, {
      username,
      password
    }) {
      return fetch("/login", {
          credentials: "same-origin",
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username,
            password
          })
        })
        .then((res) => {
          if (res.status !== 200) {
            console.log(res);
            throw new Error(res.data)
          }

          // if no errors, continue
          return res.json()

        })
        .then((authUser) => {
          commit("SET_USER", authUser);
        });
    },
    register({
      commit
    }, {
      username,
      password
    }) {
      return axios({
          method: 'post',
          url: '/register',
          credentials: "same-origin",
          data: {
            username,
            password,
          }
        })
        .then((res) => {
          console.log(res);
          if (res.data.meta.error === true) {
            throw res.data;
          }
          return res.data;
        })
        .then((authUser) => {
          commit("SET_USER", authUser)
        })
    },
    logout({
      commit
    }) {
      return fetch("/logout", {
          // Send the client cookies to the server
          credentials: "same-origin",
          method: "POST"
        })
        .then(() => {
          commit("SET_USER", null)
        })
    }
  }
})

export default store;