class ApplicationController < ActionController::Base
  include Authenticate

  before_action :require_signed_in
end
