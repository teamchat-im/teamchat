class Room < ApplicationRecord
  self.inheritance_column = :_type_disabled

  has_secure_token :uid

  enum visibility: {
    private: 0,
    internal: 1,
    public: 2
  }, _prefix: true

  belongs_to :owner, class_name: 'User'
  has_many :memberships
  has_many :users, through: :memberships
  has_many :members, -> { where(memberships: { role: Membership.roles[:member] }) }, through: :memberships, source: :user
  has_many :admins, -> { where(memberships: { role: Membership.roles[:admin] }) }, through: :memberships, source: :user

  validates :uid, uniqueness: true
  validates :name, presence: true
  validates :alias, uniqueness: true, allow_blank: true

  def visible_to(user)
    case visibility
    when 'private'
      owner == user || users.where(user: user).exists?
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
