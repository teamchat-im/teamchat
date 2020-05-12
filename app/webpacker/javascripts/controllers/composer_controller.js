import { Controller } from 'stimulus'
import Rails from "@rails/ujs"
import { Schema, DOMParser, DOMSerializer } from "prosemirror-model"
import { EditorState } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { keymap } from "prosemirror-keymap"

export default class extends Controller {
  static targets = ['input']

  connect() {
    this.initEditor()
  }

  submit() {
    let formData = new FormData()
    formData.set('message[body]', this.inputValue())
    Rails.ajax({
      url: this.data.get('submitUrl'),
      type: 'post',
      accept: 'script',
      data: formData,
      success: () => {
        this.reset()
      }
    })
  }

  reset() {
    let state = this.createState()
    this.editorView.updateState(state)
    this.editorView.focus()
  }

  inputValue() {
    let fragment = DOMSerializer.fromSchema(this.editorView.state.schema).serializeFragment(this.editorView.state.doc)
    let tmp = document.createElement('div')
    tmp.appendChild(fragment)
    return tmp.innerHTML
  }

  initEditor() {
    let state = this.createState()
    this.editorView = new EditorView(this.inputTarget, { state })
    this.editorView.focus()
  }

  createState() {
    let schema = new Schema({
      nodes: {
        doc: { content: "text*" },
        text: {},
      }
    })
    let state = EditorState.create({
      schema,
      plugins: [
        keymap({
          'Enter': this.submit.bind(this)
        })
      ]
    })
    return state
  }
}
