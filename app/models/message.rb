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

  SIZE_LIMIT = 1024
  def file_thumb
    file.variant(resize_to_limit: [SIZE_LIMIT, SIZE_LIMIT], loader: { page: nil })
  end

  PREVIEW_SIZE = 200
  def file_thumb_metadata
    width = file.blob.metadata['width']
    height = file.blob.metadata['height']
    if width > height
      { 'width' => PREVIEW_SIZE, 'height' => (height.to_f / width * PREVIEW_SIZE) }
    else
      { 'width' => (width.to_f / height * PREVIEW_SIZE), 'height' => PREVIEW_SIZE }
    end
  end

  def broadcast
    renderer = ApplicationController.renderer.new(http_host: ENV['HOST'], https: ENV['FORCE_SSL'] == 'true')

    file&.analyze

    ChatChannel.broadcast_to(
      room,
      id: uid,
      username: user.username,
      type: 'create',
      html: renderer.render(partial: 'messages/message', object: self)
    )
  end
end
