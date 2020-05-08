require 'test_helper'

class MessagesControllerTest < ActionDispatch::IntegrationTest
  test "should create message" do
    sign_in create(:user)
    room = create(:room)
    room.memberships.create(user: current_user)
    assert_difference "room.messages.count" do
      post room_messages_url(room), params: { message: { body: 'text ' } }, xhr: true
    end
  end

  test "should not create message before join" do
    sign_in create(:user)
    room = create(:room)
    assert_raise(ActiveRecord::RecordNotFound) do
      post room_messages_url(room), params: { message: { body: 'text ' } }, xhr: true
    end
  end
end
