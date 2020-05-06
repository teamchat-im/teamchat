require 'test_helper'

class HomeControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    sign_in create(:user)
    get root_url
    assert_response :success
  end

  test "should redirect sign in" do
    get root_url
    assert_redirected_to sign_in_url(return_to: '/')
  end
end
