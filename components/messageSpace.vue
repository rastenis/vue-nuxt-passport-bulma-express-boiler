<template>
  <div style="position:absolute;margin:auto;width:60vw;">
     <transition name="fade">
   <article v-if="messages.info.on" class="message is-info">
      <div class="message-header">
        <p>Information</p>
        <button class="delete" @click="msgOn('info',false)" aria-label="delete"></button>
      </div>
      <div class="message-body">
        {{messages.info.msg}}
      </div>
    </article>
     </transition>
     <transition name="fade">
        <article v-if="messages.error.on" class="message is-error">
      <div class="message-header">
        <p>Information</p>
        <button class="delete" @click="msgOn('error',false)" aria-label="delete"></button>
      </div>
      <div class="message-body">
        <p>
          {{messages.info.msg}}
        </p>
      </div>
    </article>
  </transition>


</div>
</template>


<style scoped>
.message {
  margin: auto;
  width: 40vw;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>

<script>
export default {
  data() {
    return {
      messages: {
        info: {
          on: false,
          msg: ""
        },
        error: {
          on: false,
          msg: ""
        }
      }
    };
  },
  methods: {
    msgOn(type, state, message) {
      if (type === "info") {
        this.messages.info.msg = message;
        this.messages.info.on = state;
      } else if (type === "error") {
        this.messages.error.msg = message;
        this.messages.error.on = state;
      } else {
        // wrong message type
        alert("no such message type!");
      }
    }
  }
};
</script>
