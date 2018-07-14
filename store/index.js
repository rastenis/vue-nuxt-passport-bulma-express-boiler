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
      return axios({
          method: 'post',
          url: '/login',
          credentials: "same-origin",
          data: {
            username,
            password,
          }
        })
        .then((res) => {
          if (res.data.meta.error === true) {
            throw res.data;
          }

          // if no errors, continue
          return res.data.user;
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
          if (res.data.meta.error === true) {
            throw res.data;
          }
          return res.data.user;
        })
        .then((authUser) => {
          commit("SET_USER", authUser)
        })
    },
    logout({
      commit
    }) {
      return axios({
          method: 'post',
          url: '/logout',
          credentials: "same-origin"
        })
        .then(() => {
          commit("SET_USER", null)
        })
    }
  }
})

export default store;