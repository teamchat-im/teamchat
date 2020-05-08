class User < ApplicationRecord
  has_secure_password
  has_secure_token :auth_token

  has_many :memberships
  has_many :rooms, through: :memberships
  has_many :messages

  USERNAME_REGEXP = /\A[a-z0-9._=\-\/]+\z/
  validates :username, uniqueness: { case_sensitive: false }, format: { with: USERNAME_REGEXP }, presence: true
  validates :email, uniqueness: { case_sensitive: false }, format: { with: URI::MailTo::EMAIL_REGEXP }, presence: true
end
