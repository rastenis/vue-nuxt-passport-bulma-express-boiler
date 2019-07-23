import axios from "axios";

// using the new Module design. Old (classic) Vuex configuration can be viewed in this project's pre-release versions (<1.0.0)
// modules can be exported into separate files. Also, multiple stores can be described this way.
// read more: https://nuxtjs.org/guide/vuex-store/

export const state = () => ({
  user: null,
  flash: null
});

export const mutations = {
  SET_USER(state, user) {
    state.user = user;
  },
  SET_FLASH(state, flash) {
    state.flash = flash;
  },
  CLEAR_MESSAGE(state) {
    state.flash = state.flash.slice(1);
  }
};

export const actions = {
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
};
