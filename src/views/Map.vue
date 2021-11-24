<template>
  <div>
    <div ref="container" class="map"></div>
    <div id="features">
      <section
        v-for="chapter in chapters"
        :key="chapter"
        v-bind:id="chapter.name"
      >
        <h1>{{ chapter.name }}</h1>
        <h3>{{ chapter.lauftext }}</h3>
        <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
        <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
        <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
      </section>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import contentful from "@/modules/contentful.js";
import mapboxgl from "mapbox-gl";
import route from "@/modules/route.js";

console.log(contentful);

export default {
  name: "Map",
  components: {
    //Commute
  },
  data: function () {
    return {
      chapters: [],
    };
  },
  mounted: async function () {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiYW5keWdydXR0ZXIiLCJhIjoiY2t3M2M1N3I2MjRiODJ2cWkyeXRkMWVxcyJ9.tVYdD1yihuyo6Xbu-dRaag";
    let map = new mapboxgl.Map({
      container: this.$refs.container, // container ID
      style: "mapbox://styles/andygrutter/ckw3dqzum0zlt14mw28a73v3b", // My custom style
      center: [8.546385, 47.190093], // starting position [lng, lat]
      zoom: 9, // starting zoom
    });

    console.log("Chapters");
    console.log(this.chapters);

    var posts = await contentful.getPosts();

    for (var post of posts) {
      var coords = [post.fields.posten.lon, post.fields.posten.lat];
      const chapter = {
        name: post.fields.title,
        lauftext: post.fields.lauftext,
        center: coords,
        bearing: 27,
        zoom: 15.5,
        pitch: 20,
        duration: 6000,
      };

      new mapboxgl.Marker()
        .setLngLat(coords)
        .setPopup(new mapboxgl.Popup().setHTML("<h1>" + chapter.name + "</h1>"))
        .addTo(map);

      this.chapters.push(chapter);
    }

    let activeChapterName = "Ehrgraben";

    function setActiveChapter(chapterName, chapters) {
      if (chapterName === activeChapterName) return;

      for (var chapter of chapters) {
        if (chapter.name == chapterName) {
          map.flyTo({
            center: chapter.center,
            zoom: 15,
            essential: true,
          });
        }
      }

      document.getElementById(chapterName).classList.add("active");
      document.getElementById(activeChapterName).classList.remove("active");

      activeChapterName = chapterName;
    }

    function isElementOnScreen(id) {
      const element = document.getElementById(id);
      const bounds = element.getBoundingClientRect();
      return bounds.top < window.innerHeight && bounds.bottom > 0;
    }

    // On every scroll event, check which element is on screen
    window.onscroll = () => {
      for (const chapter of this.chapters) {
        if (isElementOnScreen(chapter.name)) {
          setActiveChapter(chapter.name, this.chapters);
          break;
        }
      }
    };

    map.on("load", () => {
      map.addSource("route", {
        type: "geojson",
        data: route.path
      });
      map.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#888",
          "line-width": 8,
        },
      });
    });
  },
};
</script>
<style src='mapbox-gl/dist/mapbox-gl.css'></style>

<style scoped >
.map {
  position: fixed;
  top: 10vh;
  bottom: 0;
  width: 50%;
}
#features {
  width: 50%;
  margin-left: 50%;
  font-family: sans-serif;
  overflow-y: scroll;
  background-color: #fafafa;
}
</style>
