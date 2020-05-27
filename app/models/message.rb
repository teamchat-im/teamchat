class Message < ApplicationRecord
  has_secure_token :uid
  has_one_attached :file

  belongs_to :room
  belongs_to :user

  validates :body, presence: true

  PREVIEW_SIZE = 400
  def file_thumb_metadata
    width = file.blob.metadata['width']
    height = file.blob.metadata['height']
    if width > height
      { 'width' => PREVIEW_SIZE, 'height' => (height.to_f / width * PREVIEW_SIZE) }
    else
      { 'width' => (width.to_f / height * PREVIEW_SIZE), 'height' => PREVIEW_SIZE }
    end
  end

  after_create_commit :deliver_later

  def deliver_later
    MessageDeliverJob.perform_later(self)
  end
end
