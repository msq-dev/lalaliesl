Vue.component("current-track", {
  props: {
    currentTrack: Object
  },
  computed: {
    artistsString() {
      return this.currentTrack.item.artists.map(a => a.name).join(", ")
    }
  },
  template: `
            <div>
              <div class="title">{{ currentTrack.item.name }}</div>
              <div class="artists">{{ artistsString }}</div>            
            </div>
            `
})


Vue.component("searched-track", {
  props: {
    title: String,
    artists: Array,
  },
  computed: {
    artistsString() {
      return this.artists.map(a => a.name).join(", ")
    }
  },
  template: `<div class="searched-track">
               <div class="title">{{ title }}</div>
               <div class="artists">{{ artistsString }}</div>
             </div>`
})


let app = new Vue({
  el: "#app",
  data: {
    access_token: "",
    refresh_token: "",
    loggedIn: false,
    query: "",
    searchResults: {},
    currentTrack: {},
    updateCurrentTrack: null
  },
  methods: {
    searchSpoti() {
      let params = {q: this.query, type: "track,album,artist", limit: 50}
      fetch("https://api.spotify.com/v1/search?" + new URLSearchParams(params), {
        headers: {
          "Authorization": "Bearer " + this.access_token
        }
      }).then(res => res.json())
        .then(data => this.searchResults = data)
        .catch(err => console.error(err))
    },

    getCurrentTrack() {
      fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        headers: {
          "Authorization": "Bearer " + this.access_token
        }
      }).then(res => res.json())
        .then(data => this.currentTrack = data)
        .catch(() => {
          this.currentTrack = {}
          clearInterval(this.updateCurrentTrack)
        })
    }
  },

  mounted() {
    let hashParams = {}
    let e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1)
    while (e = r.exec(q)) {
      hashParams[e[1]] = decodeURIComponent(e[2])
    }
    
    if (hashParams.error) {
      alert('There was an error during the authentication')
    } else {
      if (hashParams.access_token) {
        this.access_token = hashParams.access_token
        this.refresh_token = hashParams.refresh_token
        this.loggedIn = true
      }

      this.getCurrentTrack()
      this.updateCurrentTrack = setInterval(() => {
        this.getCurrentTrack()
      }, 3000)
    }
  },
  beforeDestroy() {
    clearInterval(this.updateCurrentTrack)
  }
})