class Membership < ApplicationRecord
  belongs_to :room
  belongs_to :user

  enum role: {
    member: 0,
    admin: 1,
    owner: 2
  }
end
