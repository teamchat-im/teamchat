import { Controller } from 'stimulus'
import Rails from "@rails/ujs"
import consumer from '../channels/consumer'

export default class extends Controller {
  static targets = ['messages']

  connect() {
    this.subscribe_channel()
    this.element.roomController = this
    this.messagesTarget.scrollTop = this.messagesTarget.scrollHeight

    this.onScrollHandle = this.onScroll.bind(this)
    this.messagesTarget.addEventListener('scroll', this.onScrollHandle)
  }

  disconnect() {
    this.unsubscribe_channel()
    this.messagesTarget.removeEventListener('scroll', this.onScrollHandle)
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
    if (!document.querySelector(`#message-${data.id}`)) {
      this.messagesTarget.insertAdjacentHTML('beforeend', data.html)
      document.querySelector(`#message-${data.id}`).scrollIntoView();
    }
  }

  onScroll() {
    if (this.messagesTarget.scrollTop < 400) {
      this.loadBefore()
    }
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
        },
        complete: () => {
          this.loadingBefore = false
        }
      })
    }
  }
}
