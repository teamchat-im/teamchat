import { Controller } from 'stimulus'
import Rails from "@rails/ujs"

export default class extends Controller {
  static targets = ['input', 'form']

  connect() {
    this.inputTarget.addEventListener('keypress', this.keypress.bind(this))
    this.formTarget.addEventListener('ajax:success', this.reset.bind(this))
  }

  keypress(event) {
    if (event.which == 13 && !event.shiftKey) {
      Rails.fire(this.formTarget, 'submit')
    }
  }

  reset() {
    this.formTarget.reset()
  }
}
