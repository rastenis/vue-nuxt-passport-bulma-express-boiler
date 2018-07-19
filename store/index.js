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
        console.log("clearing.......");
        state.flash = state.flash.slice(1);
      }
    },
    actions: {
      nuxtServerInit({ commit }, { req }) {
        if (req.session && typeof req.user !== "undefined") {
          commit("SET_USER", req.user);
        }
        if (req.session.flash) {
          commit("SET_FLASH", req.session.flash);
          req.session.flash = [];
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
