<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <Commute person="Andy" start="Earth" destination="Mars"/>
  </div>
</template>

<script>
// @ is an alias to /src
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
</script>
