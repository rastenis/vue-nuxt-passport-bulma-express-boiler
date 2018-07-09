import Vue from "vue"
import Vuex from "vuex"
import axios from "axios"

Vue.use(Vuex);

// Polyfill for window.fetch()
require("whatwg-fetch");

const store = () => new Vuex.Store({
    state: {
        user: null,
        activeTab: "1",
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
            return fetch("/api/login", {
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
                    if (res.status === 556) {
                        throw new Error("Bad credentials.")
                    } else if (res.status === 555) {
                        throw new Error("No user with those credentials found.")
                    } else if (res.status === 557) {
                        throw new Error("Server error.")
                    } else {
                        return res.json()
                    }
                })
                .then((authUser) => {
                    commit("SET_USER", authUser);

                })
        },

        register({
            commit
        }, {
            username,
            password,
            passconf,
            email,
            code
        }) {
            return fetch("/api/register", {
                    // Send the client cookies to the server
                    credentials: "same-origin",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        username,
                        password,
                        passconf,
                        email,
                        code
                    })
                })
                .then((res) => {
                    switch (res.status) {
                        case 599:
                            throw {
                                msg: "An account with that username already exists."
                            }
                            break;
                        case 598:
                            throw {
                                msg: "The server cannot accept new registrations at this moment."
                            }
                            break;
                        case 597:
                            throw {
                                msg: "An account with that email already exists."
                            }
                            break;
                        default:
                            return res.json()
                            break;
                    }
                })
                .then((authUser) => {
                    commit("SET_USER", authUser)
                })
        },
        logout({
            commit
        }) {
            return fetch("/api/logout", {
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