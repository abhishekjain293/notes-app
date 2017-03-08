//<![CDATA[
window.onload=function(){

var STORAGE_KEY = 'notes'
var noteStorage = {
  fetch: function () {
    var notes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    notes.forEach(function (note, index) {
      note.id = index
    })
    noteStorage.uid = notes.length
    return notes
  },
  save: function (notes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  }
}

// visibility filters
var filters = {
  all: function (notes) {
    return notes
  },
  non_archive: function (notes) {
    return notes.filter(function (note) {
      return !note.archive
    })
  },
  archive: function (notes) {
    return notes.filter(function (note) {
      return note.archive
    })
  }
}

// app Vue instance
var app = new Vue({
  // app initial state
  data: {
    notes: noteStorage.fetch(),
    newNote: '',
    editedNote: null,
    visibility: 'all'
  },

  // watch notes change for localStorage persistence
  watch: {
    notes: {
      handler: function (notes) {
        noteStorage.save(notes)
      },
      deep: true
    }
  },

  // computed properties
  computed: {
    filteredNotes: function () {
      return filters[this.visibility](this.notes)
    },
    allDone: {
      get: function () {
        return this.remaining === 0
      },
      set: function (value) {
        this.notes.forEach(function (note) {
          note.archive = value
        })
      }
    }
  },

  filters: {
    pluralize: function (n) {
      return n === 1 ? 'item' : 'items'
    },
  	truncate: function(string, value) {
    	return string.substring(0, value) + '...';
    }
  },

  // methods that implement data logic.
  // note there's no DOM manipulation here at all.
  methods: {
    addNote: function () {
      var value = this.newNote && this.newNote.trim()
      if (!value) {
        return
      }
      this.notes.push({
        id: noteStorage.uid++,
        title: value,
        archive: false
      })
      this.newNote = ''
    },

    removeNote: function (note) {
      this.notes.splice(this.notes.indexOf(note), 1)
    },

    editNote: function (note) {
      this.beforeEditCache = note.title
      this.editedNote = note
    },

    doneEdit: function (note) {
      if (!this.editedNote) {
        return
      }
      this.editedNote = null
      note.title = note.title.trim()
      if (!note.title) {
        this.removeNote(note)
      }
    },

    cancelEdit: function (note) {
      this.editedNote = null
      note.title = this.beforeEditCache
    },

    
  },

  // a custom directive to wait for the DOM to be updated
  // before focusing on the input field.

  directives: {
    'note-focus': function (el, value) {
      if (value) {
        el.focus()
      }
    }
  }
})

// handle routing
function onHashChange () {
  var visibility = window.location.hash.replace(/#\/?/, '')
  if (filters[visibility]) {
    app.visibility = visibility
  } else {
    window.location.hash = ''
    app.visibility = 'all'
  }
}

window.addEventListener('hashchange', onHashChange)
onHashChange()

// mount
app.$mount('.noteapp')

}//]]> 
