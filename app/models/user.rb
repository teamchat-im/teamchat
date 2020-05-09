class User < ApplicationRecord
  has_secure_password
  has_secure_token :auth_token
  has_one_attached :avatar

  has_many :memberships
  has_many :rooms, through: :memberships
  has_many :messages

  USERNAME_REGEXP = /\A[a-z0-9._=\-\/]+\z/
  validates :username, uniqueness: { case_sensitive: false }, format: { with: USERNAME_REGEXP }, presence: true
  validates :email, uniqueness: { case_sensitive: false }, format: { with: URI::MailTo::EMAIL_REGEXP }, presence: true

  def avatar_thumb
    avatar.variant(resize_to_limit: [160, 160])
  end

  after_commit :generate_default_avatar, on: [:create]

  DEFAULT_AVATAR_COLORS = %w(
    #007bff
    #6610f2
    #6f42c1
    #e83e8c
    #dc3545
    #fd7e14
    #ffc107
    #28a745
    #20c997
    #17a2b8
  )

  def generate_default_avatar
    temp_path = "#{Rails.root}/tmp/default_avatar_#{SecureRandom.base58}.png"
    system(*%W(convert -size 160x160 -annotate 0 #{username[0].upcase} -font DejaVu-Sans -fill white -pointsize 100 -gravity Center xc:#{DEFAULT_AVATAR_COLORS.sample} #{temp_path}))
    avatar.attach(io: File.open(temp_path), filename: 'default_avatar.png', content_type: 'image/png', identify: false)
    FileUtils.rm temp_path
  end
end
