class Settings::ProfilesController < ApplicationController
  def show
  end

  def update
    if current_user.update user_params
      redirect_to settings_profile_path
    else
      render 'update_form'
    end
  end

  private

  def user_params
    params.require(:user).permit(:name, :username, :avatar, :bio)
  end
end
