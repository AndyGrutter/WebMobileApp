<template>
  <div>
    <div ref="container" id="map"></div>
    <div id="features">
      <section
        v-for="chapter in chapters"
        :key="chapter"
        v-bind:id="chapter.name"
      >
        <h1>{{ chapter.name }}</h1>
        <h3>{{ chapter.lauftext }}</h3>
      </section>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import contentful from "@/modules/contentful.js";
import mapboxgl from "mapbox-gl";
import route from "@/modules/route.js";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import * as turf from "@turf/helpers";
import bearing from "@turf/bearing";
import distance from "@turf/distance";

console.log(contentful);

export default {
  name: "Map",
  components: {
    //Commute
  },
  data: function () {
    return {
      currentWaypoint: {},
    };
  },
  mounted: async function () {
    mapboxgl.accessToken =
      "pk.eyJ1IjoidmFudmFuOTQiLCJhIjoiY2t2dGllZ2txMHJxMDJubHl3ajhkZG5ydiJ9.eliDbpJIW8GIoV7luqZuNw";
    let map = new mapboxgl.Map({
      container: this.$refs.container, // container ID
      style: "mapbox://styles/vanvan94/ckw7oc71n3e3q15t6bgd53o53", // My custom style
      center: [8.546385, 47.190093], // starting position [lng, lat]
      zoom: 17, // starting zoom

        //center: aareCoordinates[0],
      attributionControl: false,
      interactive: false,
    });

    console.log("Chapters");
    console.log(this.chapters);

    var wayPoints = await contentful.getPosts();

    for (var post of wayPoints) {
      var coords = [post.fields.posten.lon, post.fields.posten.lat];
      const chapter = {
        name: post.fields.title,
        lauftext: post.fields.lauftext,
        center: coords,
        bearing: 0,
        duration: 6000,
      };

      new mapboxgl.Marker()
        .setLngLat(coords)
        .setPopup(new mapboxgl.Popup().setHTML("<h1>" + chapter.name + "</h1>"))
        .addTo(map);
    }

    // On every scroll event, check which element is on screen
    /*
    window.onscroll = () => {
      map.easeTo({
        center:
          route.path.geometry.coordinates[Math.floor(window.scrollY / 50)],
        zoom: 17,
        essential: true,
      });
      console.log(route.path.geometry.coordinates[0]);
    };*/

    var aareCoordinates = route.path.geometry.coordinates;

    // Calculate Nearest Coordinates on Path for specified Locations
    wayPoints.forEach((wayPoint) => writeNearestAareIndex(wayPoint));

    // Save Numbers into Waypoints
    wayPoints.sort((a, b) => a.nearestAareIndex - b.nearestAareIndex);
    wayPoints.forEach((wayPoint, index) => (wayPoint.number = index + 1));

    // Activate first wayPoint right away and hide its marker
    this.currentWaypoint = wayPoints[0];
    wayPoints[0].markerInvisible = true;

    // Store this for function calls
    const self = this;

    map.on("load", () => {
      addEmptyRoute();
    });

    // Configure GSAP Animation with ScrollTrigger
    const timeline = configureAnimation();
    console.log(timeline);

    //------------Helper Functions-------------

    function getCoord(wayPoint) {
      return [wayPoint[0], wayPoint[1]];
    }

    function writeNearestAareIndex(wayPoint) {
      const from = getCoord(wayPoint);
      let min = 1000;
      let minIndex = -1;
      aareCoordinates.forEach((to, index) => {
        const dist = distance(from, to);
        if (dist < min) {
          min = dist;
          minIndex = index;
        }
      });
      wayPoint.nearestAareIndex = minIndex;
    }

    // Funktion um Punkt auf Route anzusteuern
    // t: Wert zwischen 0 und 1
    function setProgress(t) {
      const index = Math.round(t * aareCoordinates.length);

      const p1 = turf.point(aareCoordinates[index]);
      const p2 = turf.point(aareCoordinates[index + 1]);
      var calculatedBearing = bearing(p1, p2);
      calculatedBearing = 0

      map.jumpTo({
        center: aareCoordinates[index],
        bearing: calculatedBearing,
        essential: true
      });

      // Route updaten
      const slicedAareCoordinates = aareCoordinates.slice(
        0,
        Math.max(2, index)
      ); // at least two elements two preserve Errors
      const featureCollection = turf.lineString(slicedAareCoordinates);
      map.getSource("route").setData(featureCollection);

      // Markers updaten
      wayPoints.forEach((wayPoint) => {
        if (index > wayPoint.nearestAareIndex) {
          addMarker(wayPoint);
        } else {
          removeMarker(wayPoint);
        }
      });
    }

    function addEmptyRoute() {
      map.addSource("route", {
        type: "geojson",
        data: turf.lineString([
          [0, 0],
          [0, 0],
        ]),
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
          "line-color": "#f05a2f",
          "line-width": 3,
        },
      });
    }

    function addMarker(wayPoint) {
      if (!wayPoint.marker) {
        console.log("Added wayPoint", wayPoint);
        self.currentWaypoint = wayPoint;

        var el = document.createElement("div");
        el.className = "marker";

        const coord = aareCoordinates[wayPoint.nearestAareIndex];
        wayPoint.marker = new mapboxgl.Marker(el);

        if (!wayPoint.markerInvisible)
          wayPoint.marker.setLngLat(coord).addTo(map);
      }
    }

    function removeMarker(wayPoint) {
      // console.log("removeMarker -> wayPoint", wayPoint)
      if (wayPoint.marker) {
        console.log("Removed wayPoint", wayPoint);
        self.currentWaypoint = wayPoint;

        wayPoint.marker.remove();
        wayPoint.marker = undefined;
      }
    }

    function configureAnimation() {
      gsap.registerPlugin(ScrollTrigger);
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#map",
          start: "center center",
          end: function () {
            return "+=" + window.innerHeight * 6 + " bottom";
          },
          toggleActions: "restart pause reverse pause",
          markers: false,
          scrub: 1,
          pin: true,
        },
      });
      tl.set("#map", { opacity: 1 });
      tl.to(".end", { duration: 1 });
      tl.to("#map", {
        duration: 0,
        ease: "steps(200)",
        width: "110vw",
        maxWidth: "110vw",
        height: "110vh",
        maxHeight: "110vh",
        y: "-50vh",
        x: "0vw",
        onUpdate: function () {
          map.resize();
        },
      });
      const progressState = { value: 0.0 };
      tl.to(progressState, {
        duration: 25,
        value: 1.0,
        ease: "steps(" + aareCoordinates.length + ")",
        onUpdate: function () {
          setProgress(progressState.value);
        },
      });

      tl.set(".end", { display: "block" });
      tl.to(".end", { duration: 1 });
      tl.to("#map", {
        duration: 4,
        ease: "steps(200)",
        width: "50vw",
        maxWidth: "50vw",
        height: "60vh",
        maxHeight: "60vh",
        y: "2.5vw",
        x: "5vw",
        onUpdate: function () {
          map.resize();
        },
      });
      tl.to(".end", { duration: 1 });
      tl.to(".end", {
        opacity: 1,
        duration: 1,
      });

      tl.to(".end", { duration: 2 });
      return tl;
    }
  },
};
</script>
<style src='mapbox-gl/dist/mapbox-gl.css'></style>

<style scoped >
.map {
}
#features {
  width: 50%;
  margin-left: 50%;
  font-family: sans-serif;
  overflow-y: scroll;
  background-color: #fafafa;
}
</style>
