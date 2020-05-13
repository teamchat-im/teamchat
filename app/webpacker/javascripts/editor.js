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

const keymapSetting = Object.assign(baseKeymap, {
  'Enter': () => {
    this.submit()
    return true
  },
  'Shift-Enter': (state, dispatch) => {
    dispatch(state.tr.replaceSelectionWith(schema.nodes.hard_break.create()).scrollIntoView())
    return true
  }
})

class Editor {
  constructor(inputElement) {
    let state = this.initState()
    console.log(state)
    this.editorView = new EditorView(inputElement, { state: this.initState() })
    this.editorView.focus()
  }

  initState() {
    return EditorState.create({
      schema,
      plugins: [
        keymap(keymapSetting)
      ]
    })
  }

  reset() {
    this.editorView.updateState(this.initState())
    this.editorView.focus()
  }

  getContent() {
    let fragment = DOMSerializer.fromSchema(this.editorView.state.schema).serializeFragment(this.editorView.state.doc)
    let tmp = document.createElement('div')
    tmp.appendChild(fragment)
    return tmp.innerHTML
  }
}

export { Editor }
