<template>
  <div class="commute">
    <h1>{{person}}'s awesome commute thingy </h1>
    <div>{{person}}'s awesome cummute from {{start}} to {{destination}}</div>
  </div>
</template>

<script>
export default {
  name: 'Commute',
  props: {
    person: String,
    start: String,
    destination: String
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  margin: 40px 0 0;
  color: blanchedalmond;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
