FactoryBot.define do
  factory :user do
    sequence(:username) { |n| "username#{n}" }
    sequence(:email) { |n| "username#{n}@example.com" }
    sequence(:name) { |n| "User#{n}" }
    password { SecureRandom.base58 }
  end
end
