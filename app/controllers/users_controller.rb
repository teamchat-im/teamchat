class UsersController < ApplicationController
  layout 'base'

  skip_before_action :require_signed_in

  def new
    @user = User.new
  end

  def create
    @user = User.new user_params

    if @user.save
      sign_in(@user)
      redirect_to root_url
    else
      render 'update_form'
    end
  end

  private

  def user_params
    params.require(:user).permit(:username, :email, :password, :password_confirmation)
  end
end
