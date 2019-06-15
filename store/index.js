import Vuex from "vuex";
import axios from "axios";

const util = require("util");

const store = () =>
  new Vuex.Store({
    state: {
      user: null,
      flash: null
    },
    mutations: {
      SET_USER: function SET_USER(state, user) {
        state.user = user;
      },
      SET_FLASH: function SET_FLASH(state, flash) {
        state.flash = flash;
      },
      CLEAR_MESSAGE: function CLEAR_MESSAGE(state) {
        state.flash = state.flash.slice(1);
      }
    },
    actions: {
      nuxtServerInit({ commit }, { req }) {
        if (req) {
          // req doesn't exist when running tests
          if (
            typeof req.session !== "undefined" &&
            typeof req.user !== "undefined"
          ) {
            commit("SET_USER", req.user);
          }
          if (
            typeof req.session !== "undefined" &&
            typeof req.session.flash !== "undefined"
          ) {
            commit("SET_FLASH", req.session.flash);
            req.session.flash = [];
          }
        }
      },
      login({ commit }, { email, password }) {
        return axios({
          method: "post",
          url: "/login",
          credentials: "same-origin",
          data: {
            email,
            password
          }
        })
          .then(res => {
            if (res.data.meta.error === true) {
              throw res.data;
            }

            // if no errors, continue
            return res.data.user;
          })
          .then(authUser => {
            commit("SET_USER", authUser);
          });
      },
      register({ commit }, { email, password }) {
        return axios({
          method: "post",
          url: "/register",
          credentials: "same-origin",
          data: {
            email,
            password
          }
        })
          .then(res => {
            if (res.data.meta.error === true) {
              throw res.data;
            }
            return res.data.user;
          })
          .then(authUser => {
            commit("SET_USER", authUser);
          });
      },
      changePassword({ commit }, { password, newPassword, newPasswordRep }) {
        return axios({
          method: "patch",
          url: "/changePassword",
          credentials: "same-origin",
          data: {
            password,
            newPassword,
            newPasswordRep
          }
        })
          .then(res => {
            if (res.data.meta.error === true) {
              throw res.data;
            }
            // server returns user with adjusted data,
            // so we just SET_USER it
            return res.data.user;
          })
          .then(modifiedUser => {
            commit("SET_USER", modifiedUser);
          });
      },
      unlink({ commit }, { toUnlink }) {
        return axios({
          method: "post",
          url: "/unlink",
          credentials: "same-origin",
          data: {
            toUnlink
          }
        })
          .then(res => {
            if (res.data.meta.error === true) {
              throw res.data;
            }
            return res.data.user;
          })
          .then(modifiedUser => {
            commit("SET_USER", modifiedUser);
          });
      },
      deleteAccount({ commit }) {
        return axios({
          method: "post",
          url: "/deleteAccount",
          credentials: "same-origin"
        }).then(() => {
          commit("SET_USER", null);
        });
      },
      logout({ commit }) {
        return axios({
          method: "post",
          url: "/logout",
          credentials: "same-origin"
        }).then(() => {
          commit("SET_USER", null);
        });
      }
    }
  });

export default store;
