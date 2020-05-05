module Authenticate
  extend ActiveSupport::Concern

  included do
    helper_method :signed_in?, :current_user
  end

  private

  def require_signed_in
    unless signed_in?
      return_path = request.get? ? request.path : URI(request.referer.presence || '/').path
      redirect_to sign_in_path(return_to: return_path), alert: t('flash.require_sign_in')
    end
  end

  def signed_in?
    !!current_user
  end

  def current_user
    @current_user ||= authenticate_by_auth_token
  end

  def authenticate_by_auth_token
    if cookies[:auth_token].present?
      User.find_by(auth_token: cookies[:auth_token])
    end
  end

  def sign_in(user)
    @current_user = user
    cookies[:auth_token] = {
      value: user.auth_token,
      expires: 1.month,
      httponly: true
    }
  end

  def sign_out
    @current_user = nil
    cookies[:auth_token] = nil
  end
end
