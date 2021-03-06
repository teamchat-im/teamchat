class MessagesController < ApplicationController
  before_action :set_room

  def index
    @messages = @room.messages.where("id < ?", params[:before].to_i).last(50)

    render layout: false
  end

  def create
    @message = @room.messages.new message_params.merge(user: current_user)
    @message.save

    render json: {
      id: @message.uid,
      username: current_user.username
    }
  end

  private

  def set_room
    @room = Room.find_by! uid: params[:room_id]

    if !@room.room_memberships.where(user: current_user).exists?
      raise ActiveRecord::RecordNotFound
      # TODO show require join room message
    end
  end

  def message_params
    params.require(:message).permit(:body, :file)
  end
end
