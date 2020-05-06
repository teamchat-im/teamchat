class HomeController < ApplicationController
  before_action :require_signed_in

  def index
  end
end
