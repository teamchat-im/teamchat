class Users::SearchController < ApplicationController
  def index
    @users = User.where('name like ?', "%#{params[:q]}%")
  end
end
