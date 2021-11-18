<template>
  <div class="home">
    <img alt="Zurich Image" src="../assets/zurich.jpg" />
    <Commute person="Andy" start="Earth" destination="Mars" />
    <h1>Welcome to our</h1>
    <h1>AWESOME website!</h1>
  </div>
</template>

<script>
// @ is an alias to /src
/*
import Commute from '@/components/Commute.vue'

export default {
  name: 'Home',
  components: {
    Commute
  },
  data: function() {
    return {
      person: "Andy",
      start: "Earth",
      destination: "Mars"
    }
  }
}
*/
</script>

<style scoped>
img {
  max-width: 20%;
  height: auto;
}
</style>