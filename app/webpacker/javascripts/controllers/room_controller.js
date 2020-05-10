import { Controller } from 'stimulus'
import consumer from '../channels/consumer'

export default class extends Controller {
  static targets = ['messages']

  connect() {
    this.subscribe_channel()
    this.element.roomController = this
  }

  disconnect() {
    this.unsubscribe_channel()
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
}
