require 'test_helper'

class RoomsControllerTest < ActionDispatch::IntegrationTest
  test "should get public room" do
    # TODO: public for nologin?
    sign_in create(:user)
    room = create(:room, visibility: 'public')
    get room_url(room)
    assert_response :success
  end

  test "should get internal room" do
    sign_in create(:user)
    room = create(:room, visibility: 'internal')
    get room_url(room)
    assert_response :success
  end

  test "should get private room for member" do
    sign_in create(:user)
    room = create(:room, visibility: 'private')
    room.memberships.create(user: current_user, role: 'member')
    get room_url(room)
    assert_response :success
  end

  test "should not get private room if no member" do
    sign_in create(:user)
    room = create(:room, visibility: 'private')
    assert_raise ActiveRecord::RecordNotFound do
      get room_url(room)
    end
  end
end
