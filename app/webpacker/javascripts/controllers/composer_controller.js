import { Controller } from 'stimulus'
import Rails from "@rails/ujs"
import { DirectUpload } from "@rails/activestorage"
import { Schema, DOMParser, DOMSerializer } from "prosemirror-model"
import { EditorState } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { keymap } from "prosemirror-keymap"
import { baseKeymap, setBlockType } from "prosemirror-commands"

const schema = new Schema({
  nodes: {
    doc: { content: "inline*" },
    text: {
      group: "inline"
    },
    hard_break: {
      inline: true,
      group: "inline",
      selectable: false,
      parseDOM: [{tag: "br"}],
      toDOM() { return ["br"] }
    }
  }
})

const setCodeBlock = setBlockType(schema.nodes.code_block)
const setParagraph = setBlockType(schema.nodes.paragraph)
const hasBlockType = function(state, nodeType) {
  const { $from, to, node } = state.selection
  if (node) {
    return node.hasMarkup(nodeType)
  } else {
    return to <= $from.end() && $from.parent.hasMarkup(nodeType)
  }
}

export default class extends Controller {
  static targets = ['input']

  connect() {
    this.initEditor()
    this.restoreSettings()
  }

  submit() {
    let body = this.inputValue()
    console.log(body)

    if (body == '') {
      return
    }

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
    this.editorView.focus()
  }

  imageSubmit(event) {
    const uploadUrl = this.data.get('directUploadUrl')
    const submitUrl = this.data.get('submitUrl')
    Array.from(event.target.files).forEach((file) => {
      const upload = new DirectUpload(file, uploadUrl)
      upload.create((error, blob) => {
        if (error) {
        } else {
          let formData = new FormData()
          formData.set('message[type]', 'image')
          formData.set('message[body]', blob.filename)
          formData.set('message[file]', blob.signed_id)
          Rails.ajax({
            url: this.data.get('submitUrl'),
            type: 'post',
            accept: 'script',
            data: formData,
            success: () => {
            }
          })
        }
      })
    })
    this.editorView.focus()
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
    let keymapSetting = Object.assign({}, baseKeymap)
    let enterCmd = keymapSetting.Enter
    delete keymapSetting.Enter
    let state = EditorState.create({
      schema,
      plugins: [
        keymap(keymapSetting),
        keymap({
          'Enter': (state, dispatch) => {
            this.submit()
            return true
          },
          'Shift-Enter': (state, dispatch) => {
            dispatch(state.tr.replaceSelectionWith(schema.nodes.hard_break.create()).scrollIntoView())
            return true
          }
        })
      ]
    })
    return state
  }

  toggleFormatting() {
    this.element.classList.toggle('composer--formatting')
    localStorage.setItem('composer.enableFormatting', this.element.classList.contains('composer--formatting'))
    this.editorView.focus()
  }

  toggleSubmitShortcut(event) {
    let shortcut = event.currentTarget.dataset.shortcut
    this.data.set('submitShortcut', shortcut)
    localStorage.setItem('composer.submitShortcut', shortcut)
  }

  restoreSettings() {
    let shortcut = localStorage.getItem('composer.submitShortcut') || 'Enter'
    this.data.set('submitShortcut', shortcut)

    if (localStorage.getItem('composer.enableFormatting') == 'true') {
      this.element.classList.add('composer--formatting')
    }
  }

  toggleCodeBlock() {
    if (hasBlockType(this.editorView.state, schema.nodes.code_block)) {
      setParagraph(this.editorView.state, this.editorView.dispatch)
    } else {
      setCodeBlock(this.editorView.state, this.editorView.dispatch)
    }
    this.editorView.focus()
  }
}
