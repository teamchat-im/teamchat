import { Controller } from 'stimulus'
import Rails from "@rails/ujs"
import consumer from '../channels/consumer'

export default class extends Controller {
  static targets = ['messages']

  connect() {
    this.subscribe_channel()
    this.element.roomController = this

    this.onScrollHandle = this.onScroll.bind(this)
    this.messagesTarget.addEventListener('scroll', this.onScrollHandle)
    this.postFormat()

    this.watchUpdates = true
    this.scrollToBottom()
    this.resizeObserver()
  }

  disconnect() {
    this.unsubscribe_channel()
    this.messagesTarget.removeEventListener('scroll', this.onScrollHandle)
  }

  resizeObserver() {
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        if (this.watchUpdates) {
          this.scrollToBottom()
        }
      }
    })
    observer.observe(this.messagesTarget)
  }

  scrollToBottom() {
    this.messagesTarget.scrollTop = this.messagesTarget.scrollHeight
  }

  subscribe_channel() {
    let _this = this
    this.channel = consumer.subscriptions.create({ channel: 'ChatChannel', room_id: this.data.get('id') }, {
      received(data) {
        switch (data.type) {
          case 'create':
            _this.appendMessage(data)
            break;
        }
      }
    })
  }

  unsubscribe_channel() {
    this.channel.unsubscribe()
  }

  appendMessage(data) {
    const existsMessageElement = document.querySelector(`#message-${data.id}`)
    if (existsMessageElement) {
      existsMessageElement.remove()
    }

    this.messagesTarget.insertAdjacentHTML('beforeend', data.html)
    let messageElement = document.querySelector(`#message-${data.id}`)
    let date = new Date(messageElement.dataset.time).toLocaleDateString()
    let dateDivider = this.messagesTarget.querySelector(`.message__date-divider[data-date="${date}"]`)
    if (!dateDivider) {
      messageElement.insertAdjacentHTML('beforeBegin', this.createDateDivider(date))
    }
    messageElement.dataset.formated = true
    const meta = document.querySelector('meta[name="username"]')
    if (data.username == (meta ? meta.content : null)) {
      messageElement.scrollIntoView();
    }
  }

  onScroll() {
    if (this.messagesTarget.scrollTop < 400) {
      this.loadBefore()
    }

    this.watchUpdates = (this.messagesTarget.scrollTop == this.messagesTarget.scrollHeight - this.messagesTarget.clientHeight)
  }

  loadBefore() {
    if (this.messagesTarget.dataset.reachedBegin == 'true') {
      return
    }

    if (!this.loadingBefore) {
      this.loadingBefore = true

      let beginId = parseInt(this.messagesTarget.dataset.beginId)
      Rails.ajax({
        url: `/rooms/${this.element.dataset.roomId}/messages?before=${beginId}`,
        type: 'get',
        accept: 'html',
        success: (data) => {
          let oldHeight = this.messagesTarget.scrollHeight
          let oldScrollTop = this.messagesTarget.scrollTop
          let messages = data.querySelector('.room__messsages')
          this.messagesTarget.insertAdjacentHTML('afterbegin', messages.innerHTML)
          this.messagesTarget.dataset.beginId = messages.dataset.beginId
          this.messagesTarget.dataset.reachedBegin = messages.dataset.reachedBegin
          this.messagesTarget.scrollTop = oldScrollTop + (this.messagesTarget.scrollHeight - oldHeight)
          this.postFormat()
        },
        complete: () => {
          this.loadingBefore = false
        }
      })
    }
  }

  postFormat() {
    let currentDate = null
    this.messagesTarget.querySelectorAll('.message:not([data-formated])').forEach((messageElement) => {
      let date = new Date(messageElement.dataset.time).toLocaleDateString()
      if (currentDate != date) {
        let dateDivider = this.messagesTarget.querySelector(`.message__date-divider[data-date="${date}"]`)
        if (dateDivider) {
          dateDivider.remove()
        }
        messageElement.insertAdjacentHTML('beforeBegin', this.createDateDivider(date))
      }
      currentDate = date
      messageElement.dataset.formated = 'true'
    })
  }

  createDateDivider(date) {
    return `
     <div class="message__date-divider" data-date="${date}">
       <span>${date}</span>
     </div>
    `
  }
}
