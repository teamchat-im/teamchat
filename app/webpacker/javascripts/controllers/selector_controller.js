import { Controller } from 'stimulus'
import Rails from "@rails/ujs"

export default class extends Controller {
  static targets = ['input', 'output', 'item', 'option', 'options']

  connect() {
    this.init()
    this.inputTarget.addEventListener('keydown', this.keydown.bind(this))
    this.inputTarget.addEventListener('keyup', this.updateOptions.bind(this))

    this.index = 0
    this.updateSelected()
  }

  init() {
    this.element.insertAdjacentHTML('beforeEnd', `
    <div class="selector__input">
      <input type="text" value="" data-target="selector.input" placeholder="${this.data.get('placeholder')}">
    </div>
    <div class="selector__dropdown">
      <div class="list" data-target="selector.options">
    </div>
    `)
  }

  focus() {
    this.inputTarget.focus()
  }

  updateOutput() {
    this.outputTarget.value = this.itemTargets.map((item) => {
      return item.dataset.value
    }).join(',')
  }

  keydown(event) {
    console.log(event)
    if (!event.isComposing) {
      switch (event.keyCode) {
        case 13: // Enter
          this.addSelected()
          break;
        case 8: // Backspace
          this.removeLast()
          break;
        case 38: // ArrowUp
          this.selectPrev()
          break;
        case 40: // ArrowDown
          this.selectNext()
          break;
      }
    }
  }

  updateOptions() {
    const value = this.inputTarget.value
    if (value != '' && value != this.currentValue) {
      this.currentValue = value
      Rails.ajax({
        url: this.data.get('remoteUrl') + `?q=${encodeURIComponent(this.inputTarget.value)}`,
        type: 'get',
        accept: 'json',
        success:(data) => {
          console.log(data)
          let optionsHTML = ''

          data.users.forEach((user) => {
            optionsHTML += `
            <div class="list__item" data-target="selector.option" data-action="click->selector#addItem" data-name="${user.name}" data-value="${user.username}" data-thumb-url="${user.avatar_url}">
              <div class="list__avatar">
                <img src="${user.avatar_url}">
              </div>
              <div class="list__content">
                <div class="list__primary-text">
                  ${user.name}
                </div>
                <div class="list__secondary-text">
                  ${user.username}
                </div>
              </div>
            </div>
            `
          })

          this.optionsTarget.innerHTML = optionsHTML

          if (this.optionTargets.length > 0) {
            this.index = 0
            this.updateSelected()
          }
        }
      })
    }
  }

  selectPrev() {
    if (this.optionTargets.length > 0) {
      if (this.index > 0) {
        this.index--
      } else {
        this.index = this.optionTargets.length - 1
      }
      this.updateSelected()
    }
  }

  selectNext() {
    if (this.optionTargets.length > 0) {
      if (this.index < this.optionTargets.length - 1) {
        this.index++
      } else {
        this.index = 0
      }
      this.updateSelected()
    }
  }

  updateSelected() {
    this.optionTargets.forEach((element, index) => {
      element.classList.toggle('list__item--focus', this.index == index)
    })
  }

  cleanOptions() {
    this.optionsTarget.innerHTML = ''
  }

  addSelected() {
    const item = this.optionTargets[this.index]
    if (item) {
      this.appendChip(item.dataset.name, item.dataset.value, item.dataset.thumbUrl)
      this.cleanOptions()
    } else {
      let value = this.inputTarget.value
      if (value != '') {
        this.appendChip(value, value)
        this.cleanOptions()
      }
    }
  }

  addItem(event) {
    const item = event.currentTarget
    this.appendChip(item.dataset.name, item.dataset.value, item.dataset.thumbUrl)
    this.cleanOptions()
    this.focus()
  }

  appendChip(name, value, thumbUrl = null) {
    let thumb = ''
    if (thumbUrl) {
      thumb = `<img src="${thumbUrl}">`
    } else {
      thumb = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v1c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-1c0-2.66-5.33-4-8-4z"/></svg>'
    }

    this.inputTarget.insertAdjacentHTML('beforeBegin', `
      <div class="chip" data-controller="chip" data-target="selector.item" data-value="${value}">
        <div class="chip__icon">
          ${thumb}
        </div>
        ${name}
        <div class="chip__action">
          <button type="button" class="button button--icon" data-action="chip#remove selector#focus">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none" opacity=".87"/><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm4.3 14.3c-.39.39-1.02.39-1.41 0L12 13.41 9.11 16.3c-.39.39-1.02.39-1.41 0-.39-.39-.39-1.02 0-1.41L10.59 12 7.7 9.11c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0L12 10.59l2.89-2.89c.39-.39 1.02-.39 1.41 0 .39.39.39 1.02 0 1.41L13.41 12l2.89 2.89c.38.38.38 1.02 0 1.41z"/></svg>
          </button>
        </div>
      </div>
    `)
    this.inputTarget.value = ''
    this.updateOutput()
  }

  remove(event) {
    event.currentTarget.closest('.chip').remove()
    this.updateOutput()
  }

  removeLast() {
    if (this.inputTarget.value == '') {
      let lastItem = this.itemTargets[this.itemTargets.length - 1]
      if (lastItem) {
        lastItem.remove()
        this.updateOutput()
      }
    }
  }
}
