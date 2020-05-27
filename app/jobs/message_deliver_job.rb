class MessageDeliverJob < ApplicationJob
  queue_as :default

  def perform(message)
    renderer = ApplicationController.renderer.new(http_host: ENV['HOST'], https: ENV['FORCE_SSL'] == 'true')

    if message.file.attached?
      message.file.analyze
    end

    ChatChannel.broadcast_to(
      message.room,
      id: message.uid,
      username: message.user.username,
      type: 'create',
      html: renderer.render(partial: 'messages/message', object: message)
    )
  end
end
