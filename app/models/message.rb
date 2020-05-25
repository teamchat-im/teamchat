class Message < ApplicationRecord
  self.inheritance_column = :_type_disabled

  has_secure_token :uid
  has_one_attached :file

  belongs_to :room
  belongs_to :user

  enum type: {
    text: 0,
    image: 1,
    file: 2,
    audio: 3,
    video: 4,
    location: 5
  }

  validates :body, presence: true

  def broadcast
    renderer = ApplicationController.renderer.new(http_host: ENV['HOST'], https: ENV['FORCE_SSL'] == 'true')
    ChatChannel.broadcast_to(
      room,
      id: uid,
      username: user.username,
      type: 'create',
      html: renderer.render(partial: 'messages/message', object: self)
    )
  end
end
