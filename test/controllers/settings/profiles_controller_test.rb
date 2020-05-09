require 'test_helper'

class Settings::ProfilesControllerTest < ActionDispatch::IntegrationTest
  test "should get profile setting page" do
    sign_in create(:user)
    get settings_profile_path
    assert_response :success
  end

  test "should update profile" do
    sign_in create(:user)
    put settings_profile_path, params: { user: { name: 'changed' } }
    assert_equal 'changed', current_user.name
  end
end
