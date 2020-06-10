class Room < ApplicationRecord
  has_secure_token :uid

  enum visibility: {
    private: 0,
    internal: 1,
    public: 2
  }, _prefix: true

  has_many :room_memberships
  has_many :users, through: :room_memberships
  has_many :messages

  validates :uid, uniqueness: true
  validates :name, presence: true
  validates :alias, uniqueness: true, allow_blank: true

  def visible_to?(user)
    case visibility
    when 'private'
      room_memberships.where(user: user).exists?
    when 'internal'
      !!user
    when 'public'
      true
    else
      false
    end
  end

  def to_param
    uid
  end
end
