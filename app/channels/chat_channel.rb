class ChatChannel < ApplicationCable::Channel
  def subscribed
    room = Room.find_by uid: params[:room_id]

    if room&.visible_to?(current_user)
      stream_for room
    else
      rejct
    end
  end

  def unsubscribed
  end
end
