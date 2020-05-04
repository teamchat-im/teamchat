require 'test_helper'

class UserTest < ActiveSupport::TestCase
  test "username validates" do
    # valid case
    assert build(:user, username: 'username').valid?
    assert build(:user, username: 'user.name').valid?
    assert build(:user, username: 'user_name').valid?
    assert build(:user, username: 'user-name').valid?
    assert build(:user, username: 'user=name').valid?
    assert build(:user, username: 'user/name').valid?

    # invalid case
    assert_not build(:user, username: 'Username').valid?
    assert_not build(:user, username: 'user name').valid?
    assert_not build(:user, username: 'user+name').valid?
  end
end
