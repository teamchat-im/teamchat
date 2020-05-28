import { Controller } from 'stimulus'
import Rails from "@rails/ujs"

export default class extends Controller {
  static targets = ['filename', 'size']

  connect() {
    this.upload()
  }

  upload() {
    if (this.file) {
    }
  }

  cancel() {
  }
}
