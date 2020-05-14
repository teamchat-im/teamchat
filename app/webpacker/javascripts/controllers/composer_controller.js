import { Controller } from 'stimulus'
import Rails from "@rails/ujs"
import { Schema, DOMParser, DOMSerializer } from "prosemirror-model"
import { EditorState } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { keymap } from "prosemirror-keymap"
import { baseKeymap, setBlockType } from "prosemirror-commands"

const schema = new Schema({
  nodes: {
    doc: { content: "block+" },
    text: {
      group: "inline"
    },
    paragraph: {
      content: "inline*",
      group: "block",
      parseDOM: [{tag: "p"}],
      toDOM() { return ["p", 0] }
    },
    hard_break: {
      inline: true,
      group: "inline",
      selectable: false,
      parseDOM: [{tag: "br"}],
      toDOM() { return ["br"] }
    },
    code_block: {
      content: "text*",
      marks: "",
      group: "block",
      code: true,
      defining: true,
      parseDOM: [{tag: "pre", preserveWhitespace: "full"}],
      toDOM() { return ["pre", ["code", 0]] }
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
    this.restoreShotcut()
  }

  submit() {
    let body = this.inputValue()

    if (body == '<p></p>') {
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
    this.editorView.formatCode = setBlockType(this.editorView.state.schema.nodes.code_block)
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
            if (this.data.get('submitShotcut') == 'Enter') {
              this.submit()
            } else {
              enterCmd(state,dispatch)
            }
            return true
          },
          'Ctrl-Enter': (state, dispatch) => {
            if (this.data.get('submitShotcut') == 'Ctrl-Enter') {
              this.submit()
            } else {
              enterCmd(state,dispatch)
            }
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

  toggleSubmitShotCut(event) {
    this.data.set('submitShotcut', event.currentTarget.dataset.shotcut)
    this.storeShotCut()
  }

  storeShotCut() {
    localStorage.setItem('composer.submitShotcut', this.data.get('submitShotcut'))
  }

  restoreShotcut() {
    let shotcut = localStorage.getItem('composer.submitShotcut') || 'Enter'
    this.data.set('submitShotcut', localStorage.getItem('composer.submitShotcut'))
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
