class RoomsController < ApplicationController
  def new
    @room = Room.new
  end

  def create
    @room = Room.new(room_params.merge(owner: current_user))

    if @room.save
      redirect_to @room
    else
      render 'update_form'
    end
  end

  def show
    @room = Room.find_by! uid: params[:id]

    if !@room.visible_to(current_user)
      raise ActiveRecord::RecordNotFound
    end
  end

  private

  def room_params
    params.require(:room).permit(:name, :visibility)
  end
end
