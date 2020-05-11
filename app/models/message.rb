class Message < ApplicationRecord
  self.inheritance_column = :_type_disabled

  has_secure_token :uid

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
    ChatChannel.broadcast_to(
      room,
      id: uid,
      type: 'create',
      html: ApplicationController.render(partial: 'messages/message', object: self)
    )
  end
end
