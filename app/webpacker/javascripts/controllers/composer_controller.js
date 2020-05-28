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

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default class extends Controller {
  static targets = ['input', 'messageUploaderTemplate']

  connect() {
    this.initEditor()
    this.restoreSettings()
    this.roomController = this.element.closest('.room').roomController
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
      accept: 'json',
      data: formData,
      success: () => {
        this.reset()
      }
    })
    this.editorView.focus()
  }

  uploadFile(event) {
    const uploadUrl = this.data.get('directUploadUrl')
    const submitUrl = this.data.get('submitUrl')
    Array.from(event.target.files).forEach((file) => {
      let messageUploader = document.importNode(this.messageUploaderTemplateTarget.content, true)
      const uploaderElement = messageUploader.querySelector('.message')
      this.roomController.messagesTarget.insertAdjacentElement('beforeend', uploaderElement)
      uploaderElement.file = file
      uploaderElement.querySelector('.filename').textContent = file.name
      uploaderElement.querySelector('.size').textContent = formatBytes(file.size)
      uploaderElement.scrollIntoView()
      const progressBar = uploaderElement.querySelector('.progress__bar')
      const cancelButton = uploaderElement.querySelector('.cancel')
      const upload = new DirectUpload(file, uploadUrl, {
        directUploadWillStoreFileWithXHR: (xhr) => {
          xhr.upload.addEventListener('progress', (event) => {
            progressBar.style.width = `${event.loaded / event.total * 100}%`
          })

          cancelButton.addEventListener('click', () => {
            xhr.abort()
            uploaderElement.remove()
          })
        }
      })
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
            accept: 'json',
            data: formData,
            success: (data) => {
              // will be deleted by room appendMessage
              uploaderElement.id = `message-${data.id}`
            }
          })
        }
      })
    })
    event.target.value = ''
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
