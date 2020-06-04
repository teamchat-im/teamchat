import { Controller } from 'stimulus'

export default class extends Controller {
  static targets = ['input', 'item']

  connect() {
    this.inputTarget.addEventListener('keydown', this.keydown.bind(this))
  }

  keydown(event) {
    console.log(event)
    if (!event.isComposing) {
      switch (event.keyCode) {
        case 13: // Enter
          this.add()
          break;
        case 8: // Backspace
          this.removeLast()
          break;
      }
    }
  }

  add() {
    let value = this.inputTarget.value

    if (value != '') {
      const chip = this.createChip(value, value)
      this.inputTarget.insertAdjacentHTML('beforeBegin', chip)
      this.inputTarget.value = ''
    }
  }

  createChip(name, value, thumbUrl = null) {
    let thumb = ''
    if (thumbUrl) {
      thumb = `<img src="${thumbUrl}">`
    } else {
      thumb = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1c0-2.66-5.33-4-8-4z"/></svg>'
    }
    return `
      <div class="chip" data-target="selector.item" data-value="${value}">
        <div class="chip__thumb">
          ${thumb}
        </div>
        ${name}
        <div class="chip__icon">
          <button type="button" class="button button--icon" data-action="selector#remove">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" opacity=".87"/><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm4.3 14.3c-.39.39-1.02.39-1.41 0L12 13.41 9.11 16.3c-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41L10.59 12 7.7 9.11c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0L12 10.59l2.89-2.89c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41L13.41 12l2.89 2.89c.38.38.38 1.02 0 1.41z"/></svg>
          </button>
        </div>
      </div>
    `
    let chip = document.createElement('div')
    chip.classList.add('chip')
    chip.textContent = name

    let removeButton = document.createElement('button')
    button.classList.add('button', 'button--icon')

    return chip
  }

  remove(event) {
    event.currentTarget.closest('.chip').remove()
  }

  removeLast() {
    let lastItem = this.itemTargets[this.itemTargets.length - 1]
    if (lastItem) {
      lastItem.remove()
    }
  }
}
