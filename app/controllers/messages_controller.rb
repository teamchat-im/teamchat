class MessagesController < ApplicationController
  before_action :set_room

  def create
    @message = @room.messages.new message_params.merge(user: current_user)

    if @message.save
      @message.broadcast
      render 'create'
    else
      render 'update_form'
    end
  end

  private

  def set_room
    @room = Room.find_by! uid: params[:room_id]

    if !@room.memberships.where(user: current_user).exists?
      raise ActiveRecord::RecordNotFound
      # TODO show require join room message
    end
  end

  def message_params
    params.require(:message).permit(:body)
  end
end
